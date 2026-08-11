---
layout: post
title: "Multi-Tenant Kubernetes: Namespaces Aren’t Isolation"
date: 2026-08-11
description: "Why namespace-per-tenant cosplay fails—and the Capsule, NetworkPolicy, quota, and API-proxy pattern we used to isolate real workloads on shared clusters."
tags:
- Kubernetes
- Multi-tenancy
- Security
- Platform Engineering
- Capsule
- NetworkPolicy
image: /assets/images/nitrocode-og.png
---

“We give every customer their own namespace” is the most common multi-tenant Kubernetes story I hear.

It’s also usually incomplete.

Namespaces are a **scoping convenience**, not a security boundary. If your platform’s isolation story stops at `metadata.namespace`, you’re running shared fate with extra YAML.

I learned this the expensive way while designing multi-tenant hosting for people who didn’t have (or want) a full cloud account—the path we eventually shipped as **Nova** on PipeOps. This post is the **field pattern**, not a product tour. Product notes live in the older write-up: [Nova: multi-tenant Kubernetes without the complexity](/blog/2024/11/01/nova-multitenancy).

**TL;DR:** Soft multi-tenancy needs four layers that actually enforce: **identity at the API**, **network policy**, **resource containment**, and **no raw control-plane access**. Capsule (or similar) + NetworkPolicies + quotas + an impersonating proxy is one coherent stack. Namespaces alone are not.

---

## The failed first design (keep this story)

Our first multi-tenant attempt was naive on purpose: one beefy node pool, many users, “split the bill.”

What broke in two weeks:

- **No network isolation** — pods could talk sideways
- **No meaningful quotas** — one memory leak was everyone’s outage
- **Shared trust in the API** — if you can reach the apiserver as a powerful subject, the namespace label is cosplay
- **Blast radius = the cluster** — noisy neighbor wasn’t a metaphor

We killed it. Soft multi-tenancy without enforcement is just **colocation**.

---

## What “tenant” has to mean

For application platforms (not hyperscaler-grade hostile multitenancy), a tenant is roughly:

> A principal that can deploy and operate workloads **without reading, mutating, or starving** other principals’ workloads—and without administering the host cluster.

That implies controls for:

| Layer | Failure if missing |
|---|---|
| **API identity** | Cross-namespace get/list/watch, privilege escalation via bindings |
| **Network** | Lateral movement, data exfil to sibling tenants |
| **Compute/storage** | Noisy neighbor, disk fill, fork bombs |
| **Node/kernel** | Escape to host (containers are not VMs) |

If you only sell “namespace,” you’ve only bought the first bullet’s *directory structure*.

Hard multi-tenancy (dedicated clusters/nodes, microVMs, bare metal) is a different product. Soft multi-tenancy is valid—**if** you name the threats you accept (shared kernel) and enforce the rest.

---

## The pattern that worked for us

We needed virtual clusters **without** standing up a full control plane per customer (vCluster-class cost/ops). The stack:

1. **Namespace (or Tenant CR → namespaces) per customer**
2. **Capsule** as the multi-tenant operator (tenant boundaries, policy hooks)
3. **ResourceQuota / LimitRange** (and pod count caps)
4. **NetworkPolicy** default-deny + explicit allows
5. **Capsule Proxy (or equivalent)** so tenants never hold a kubeconfig that can see the real cluster API as cluster-admin cosplay
6. **RBAC** scoped to the tenant’s namespaces only

Flow in practice:

```
Tenant tooling / kubectl / CI
        │
        ▼
  Impersonating API proxy  ──enforces tenant scope──►  Kubernetes API
        │
        ├── RBAC: only their namespaces
        ├── Admission / operator: quotas, policies
        └── CNI NetworkPolicies: no east-west between tenants
```

To the user it *feels* like “my cluster.”  
To the platform it’s “your namespace(s) + a lie you can’t break easily.”

### Why a proxy (this is the non-negotiable)

The critical product decision: **tenants never talk to the real apiserver with a wide-open credential.**

They talk to a proxy that:

- Authenticates the tenant
- Impersonates a constrained identity
- Filters verbs/resources to their scope
- Rejects cluster-scoped power tools (`nodes`, other tenants’ namespaces, wild cluster role binds)

If you hand out a normal kubeconfig against the shared apiserver and “trust RBAC,” one mis-bound RoleBinding or aggregated ClusterRole later, isolation is a blog post, not a property.

### Why NetworkPolicy is not optional

Without default-deny:

- Service discovery becomes a reconnaissance API
- One compromised app is a pivot into the estate
- “We use private clusters” doesn’t help *inside* the cluster

Baseline I want on every soft multi-tenant pool:

- Deny all ingress/egress by default in tenant namespaces
- Allow DNS to the cluster DNS service
- Allow egress only to what the product requires (registries, object storage, public web—**deliberately**)
- Allow ingress only from the platform ingress / mesh identity you own

Policy drift kills you. Treat policies as **part of tenant provisioning**, not a ticket after an incident.

### Why quotas are a security control

People file quotas under “FinOps.” They’re also **availability security**.

Without them:

- One tenant schedules the node into death
- EmptyDir fills the disk
- CronJobs stampede the apiserver

Every tenant needs at least:

- CPU / memory requests+limits (LimitRange defaults)
- Namespace ResourceQuota
- Object count caps (pods, services, PVCs)
- Optional PriorityClass isolation so platform agents aren’t starved

Exceeding quota should fail **their** deploys—not page your whole fleet.

---

## Capsule vs the alternatives (tradeoffs, not religion)

We evaluated patterns in the usual set:

| Approach | Pros | Cons |
|---|---|---|
| **Namespaces + RBAC only** | Simple | Isolation theater |
| **Hierarchical namespaces** | Org-shaped trees | Still soft; ops complexity |
| **vCluster / virtual control planes** | Stronger API isolation feel | More moving parts, cost per tenant |
| **Capsule-style tenant operator** | Soft multi-tenancy with policy hooks, no full CP per tenant | Shared kernel remains |
| **Dedicated cluster per tenant** | Clean blast radius | Economics kill low-ARPU products |

We chose Capsule-class soft multi-tenancy because:

- No second control plane per customer
- Works with normal Kubernetes tooling *through the proxy*
- Policy and quota can be templated at tenant create
- Good enough isolation for **trusted-ish SaaS workloads** on shared pools

We did **not** claim “hostile tenant safe.” Shared kernel means a container escape is a platform incident. If compliance needs dedicated hardware, provision **their** cloud account instead (we do that path with Terraform runners—see [The Runner](/blog/2024/10/31/runner-terraform-provisioning)).

Different products, different isolation SLOs. Don’t market soft multi-tenancy as bare metal.

---

## Provisioning checklist (steal this)

When a tenant is created:

1. Create tenant object / namespace(s) with immutable labels (`tenant=…`)
2. Apply **ResourceQuota** + **LimitRange**
3. Apply **default-deny NetworkPolicy** + DNS/egress allowlist
4. Bind **Role/RoleBinding** only inside tenant namespaces
5. Issue credentials **only for the proxy** (short-lived if you can)
6. Run a smoke test:  
   - can deploy to own namespace  
   - cannot list other namespaces  
   - cannot reach another tenant’s Service ClusterIP  
   - cannot create ClusterRoleBinding
7. Emit audit events for admin-ish verbs

Automate the smoke test. Manual “looks good” doesn’t scale.

---

## Pitfalls I’ve seen (including ours)

1. **Ingress as a free lateral path** — misconfigured shared ingress controllers become universal peers.
2. **Cluster-wide CRDs without tenancy** — one CRD install is a shared brain; gate who can create CRs.
3. **Node filesystem assumptions** — hostPath is a footgun; ban it for tenants.
4. **Privileged pods / CAP_SYS_ADMIN** — if your PSS/PSA isn’t enforced, NetworkPolicy won’t save you.
5. **“Admin kubeconfig for support”** — support tooling becomes the real attack surface; impersonate with break-glass and audit.
6. **Log and metric multi-tenancy** — observability backends that don’t filter by tenant leak data as surely as etcd.

---

## How this connects to agent sandboxes

Different layer, same discipline.

- Soft multi-tenant **apps** → namespace + policy + quota + API proxy  
- Untrusted **agent shells** → disposable containers/microVMs + network isolation + TTL  

I wrote up the agent side separately: [Agent terminal sandboxes](/blog/2026/08/11/agent-terminal-sandboxes-isolation).  
Platforms that run both (customer apps *and* agent execution) need **both** models—or they accidentally give agents a kubeconfig to the shared estate. Don’t do that.

---

## What this advances

The reusable claim:

> **Namespace-per-tenant is a directory structure. Isolation is an enforced control plane: identity, network, resources, and API mediation.**

If your platform slides only ship architecture diagrams with green boxes labeled “Namespace,” push for the proxy, the default-deny, and the quotas—or accept that you’re selling colocation.

---

## Summary

We tried shared hosts without teeth. It failed. Soft multi-tenancy only became real when tenants stopped holding the real apiserver, networks defaulted to deny, and quotas made noisy neighbors a local outage.

Namespaces start the story. They don’t end it.

If you’re designing a platform path right now: write the threat model on one page, mark shared-kernel as accepted or not, and refuse to ship tenant create until the checklist above is automated.
