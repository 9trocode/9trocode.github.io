---
layout: post
title: "Multi-Tenant Kubernetes: Namespaces Aren’t Isolation"
date: 2026-08-11
description: "We tried shared Kubernetes with a namespace per customer and killed it in two weeks. This is the isolation stack that survived: Capsule, NetworkPolicy, quotas, an API proxy, and gVisor."
tags:
- Kubernetes
- Multi-tenancy
- Security
- Platform Engineering
- Capsule
- gVisor
image: /assets/images/nitrocode-og.png
---

“We give every customer their own namespace” is the most common multi-tenant Kubernetes story I hear.

It’s also usually incomplete.

Namespaces are a **scoping convenience**, not a security boundary. If your platform’s isolation story stops at `metadata.namespace`, you’re running shared fate with extra YAML.

I learned this the expensive way while designing multi-tenant hosting for people who didn’t have (or want) a full cloud account - the path we eventually shipped as **Nova** on PipeOps. This post is the **field pattern**, not a product tour. Product notes live in the older write-up: [Nova: multi-tenant Kubernetes without the complexity](/blog/2024/11/01/nova-multitenancy).

**TL;DR:** Soft multi-tenancy needs controls that actually enforce isolation, not a namespace label. In our stack that means API identity (no raw apiserver), NetworkPolicy, resource quotas, and a stronger runtime for tenant code (**gVisor / `runsc`**, not stock runc). Capsule, NetworkPolicies, quotas, an impersonating proxy, and gVisor work together. Namespaces alone are not enough.

---

## The failed first design (keep this story)

Our first multi-tenant attempt was naive on purpose: one beefy node pool, many users, “split the bill.”

What broke in two weeks:

- **No network isolation** - pods could talk sideways
- **No meaningful quotas** - one memory leak was everyone’s outage
- **Shared trust in the API** - if you can reach the apiserver as a powerful subject, the namespace label is cosplay
- **Blast radius = the cluster** - noisy neighbor wasn’t a metaphor

We killed it. Soft multi-tenancy without enforcement is just **colocation**.

---

## What “tenant” has to mean

For application platforms (not hyperscaler-grade hostile multitenancy), a tenant is roughly:

> A principal that can deploy and operate workloads **without reading, mutating, or starving** other principals’ workloads - and without administering the host cluster.

That implies controls for:

| Layer | Failure if missing |
|---|---|
| **API identity** | Cross-namespace get/list/watch, privilege escalation via bindings |
| **Network** | Lateral movement, data exfil to sibling tenants |
| **Compute/storage** | Noisy neighbor, disk fill, fork bombs |
| **Node/kernel** | Escape to host (default runc shares the host kernel aggressively) |

If you only sell “namespace,” you’ve only bought the first bullet’s *directory structure*.

Hard multi-tenancy (dedicated clusters/nodes, microVMs, bare metal) is a different product. Soft multi-tenancy is valid - **if** you raise the runtime bar and enforce the rest. We don’t stop at “shared kernel, shrug”; tenant workloads sit on **gVisor** so userland is isolated from the host more tightly than plain `runc`.

---

## The pattern that worked for us

We needed virtual clusters **without** standing up a full control plane per customer (vCluster-class cost/ops). The stack:

1. **Namespace (or Tenant CR → namespaces) per customer**
2. **Capsule** as the multi-tenant operator (tenant boundaries, policy hooks)
3. **ResourceQuota / LimitRange** (and pod count caps)
4. **NetworkPolicy** default-deny + explicit allows
5. **Capsule Proxy (or equivalent)** so tenants never hold a kubeconfig that can see the real cluster API as cluster-admin cosplay
6. **RBAC** scoped to the tenant’s namespaces only
7. **gVisor (`runsc`)** as the container runtime for tenant workloads - application-kernel isolation between the pod and the host

Flow in practice:

```
Tenant tooling / kubectl / CI
 │
 ▼
 Impersonating API proxy ──enforces tenant scope──► Kubernetes API
 │
 ├── RBAC: only their namespaces
 ├── Admission / operator: quotas, policies
 ├── CNI NetworkPolicies: no east-west between tenants
 └── RuntimeClass → gVisor (runsc) for tenant pods
```

To the user it *feels* like “my cluster.” 
To the platform it’s “your namespace(s) + API mediation + network/quota teeth + a sandboxed runtime.”

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
- Allow egress only to what the product requires (registries, object storage, public web - **deliberately**)
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

Exceeding quota should fail **their** deploys - not page your whole fleet.

### Why gVisor (not “just Docker”)

API and network policy stop a lot of multi-tenant pain. They do **not** fix “this untrusted binary is talking to the host kernel through runc.”

For multi-tenant pools we run tenant workloads on **[gVisor](https://gvisor.dev/)** (`runsc`): a user-space kernel that intercepts syscalls so guest code doesn’t get the full host kernel surface by default. Same Kubernetes UX (`RuntimeClass`), stronger isolation story than stock containers.

What it buys:

- Smaller host-kernel attack surface for tenant pods
- A middle ground between “hope runc is fine” and “every tenant gets a VM”

What it doesn’t buy:

- Perfect multi-tenancy (nothing on a shared node is perfect)
- Free compatibility - some workloads hate gVisor’s syscall coverage; test your images
- An excuse to skip NetworkPolicy, quotas, or the API proxy

**Pitfall:** RuntimeClass on the YAML but nodes still defaulting to `runc`. If it isn’t enforced (admission / RuntimeClass default / restricted RuntimeClass), you have a blog post, not a control.

---

## Capsule vs the alternatives (tradeoffs, not religion)

We evaluated patterns in the usual set:

| Approach | Pros | Cons |
|---|---|---|
| **Namespaces + RBAC only** | Simple | Isolation theater |
| **Hierarchical namespaces** | Org-shaped trees | Still soft; ops complexity |
| **vCluster / virtual control planes** | Stronger API isolation feel | More moving parts, cost per tenant |
| **Capsule-style tenant operator + gVisor** | Soft multi-tenancy with policy hooks + sandboxed runtime | Some syscall compatibility cost; still not a dedicated VM |
| **Dedicated cluster per tenant** | Clean blast radius | Economics kill low-ARPU products |

We chose Capsule-class soft multi-tenancy **plus gVisor** because:

- No second control plane per customer
- Works with normal Kubernetes tooling *through the proxy*
- Policy and quota can be templated at tenant create
- Runtime isolation for tenant code without full microVM tax everywhere

We still don’t market this as bare metal. If compliance needs dedicated hardware, provision **their** cloud account instead (Terraform runners - see [The Runner](/blog/2024/10/31/runner-terraform-provisioning)). MicroVMs (Firecracker et al.) remain the next step when gVisor isn’t enough.

Different products, different isolation SLOs.

---

## Provisioning checklist (steal this)

When a tenant is created:

1. Create tenant object / namespace(s) with immutable labels (`tenant=…`)
2. Apply **ResourceQuota** + **LimitRange**
3. Apply **default-deny NetworkPolicy** + DNS/egress allowlist
4. Bind **Role/RoleBinding** only inside tenant namespaces
5. Set **RuntimeClass → gVisor** for tenant workloads (and enforce it)
6. Issue credentials **only for the proxy** (short-lived if you can)
7. Run a smoke test: 
 - can deploy to own namespace 
 - cannot list other namespaces 
 - cannot reach another tenant’s Service ClusterIP 
 - cannot create ClusterRoleBinding 
 - pods actually land on `runsc` (not silent runc fallback)
8. Emit audit events for admin-ish verbs

Automate the smoke test. Manual “looks good” doesn’t scale.

---

## Pitfalls I’ve seen (including ours)

1. **Ingress as a free lateral path** - misconfigured shared ingress controllers become universal peers.
2. **Cluster-wide CRDs without tenancy** - one CRD install is a shared brain; gate who can create CRs.
3. **Node filesystem assumptions** - hostPath is a footgun; ban it for tenants.
4. **Privileged pods / CAP_SYS_ADMIN** - if your PSS/PSA isn’t enforced, NetworkPolicy won’t save you.
5. **“Admin kubeconfig for support”** - support tooling becomes the real attack surface; impersonate with break-glass and audit.
6. **Log and metric multi-tenancy** - observability backends that don’t filter by tenant leak data as surely as etcd.
7. **RuntimeClass theater** - gVisor on paper, tenants still scheduled on runc.

---

## What this advances

The reusable claim:

> **Namespace-per-tenant is a directory structure. Isolation is an enforced control plane: identity, network, resources, API mediation, and a sandboxed runtime (gVisor) - not hope.**

If your platform slides only ship architecture diagrams with green boxes labeled “Namespace,” push for the proxy, the default-deny, the quotas, and RuntimeClass enforcement - or accept that you’re selling colocation.

---

## Summary

We tried shared hosts without teeth. It failed. Soft multi-tenancy only became real when tenants stopped holding the real apiserver, networks defaulted to deny, quotas made noisy neighbors a local outage, and workloads ran under **gVisor** instead of plain runc cosplay.

Namespaces start the story. They don’t end it.

If you’re designing a platform path right now: write the threat model on one page, name the runtime boundary (gVisor / microVM / dedicated node), and refuse to ship tenant create until the checklist above is automated.
