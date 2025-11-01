---
layout: post
date: 2025-11-01
tags:
- PipeOps
- Nova
- Kubernetes
- Multi-tenancy
---

# Nova: Multi-Tenant Kubernetes Without the Headaches

Nova started because we had a problem: not everyone has AWS credits. Shocking, I know.

When we launched PipeOps, you could provision servers on AWS, GCP, Azure - bring your own cloud account, we'll manage it. Great for companies with cloud budgets. Not so great for side projects and solo developers.

So we thought: what if PipeOps could just...provide the servers?

## The First Attempt (The Bad One)

Our first try was naive. Spin up one beefy AWS server, let multiple users deploy to it. Shared infrastructure, split the cost, everyone's happy.

Except:

- Zero isolation between tenants
- One user's memory leak affected everyone
- Security nightmare (shared namespace? really?)
- Couldn't scale worth a damn

We killed it after two weeks. Back to the drawing board.

## Enter Capsule

Then I found Capsule - a Kubernetes operator that turns namespaces into "virtual clusters." Each tenant gets what *looks* like their own cluster, but it's really just isolated namespaces with strict policies.

Perfect. This is what we needed.

## How Nova Works Now

When you create a PipeOps-managed server through Nova:

1. We create a dedicated namespace with your name on it
2. Capsule enforces resource quotas (CPU, memory, storage)
3. Network policies isolate your traffic
4. RBAC prevents you from seeing other tenants
5. You get your own kubeconfig (via Capsule Proxy)

To you, it looks like a personal Kubernetes cluster. To us, it's a namespace in our multi-tenant setup. You can't access our control plane, you can't see other tenants, you can't break out.

## The Security Model

Here's the critical part: **you never touch our actual Kubernetes API.**

When you deploy, you're talking to Capsule Proxy. It impersonates your tenant, applies your namespace's policies, and forwards requests. If you try something you shouldn't - access another namespace, create cluster-wide resources - the proxy says "nope."

It's Kubernetes inside Kubernetes. Turtles all the way down.

## vs. Cloud Provider Provisioning

If you create servers through Nova on AWS/GCP/Azure, we provision actual VMs or Kubernetes clusters in *your* account. That's different infrastructure - you own it, we just manage it.

PipeOps-managed servers (the multi-tenant ones) are for when you don't have (or want) a cloud account. We handle everything.

## Resource Limits

Every Nova server gets:

- CPU quota (no hogging cores)
- Memory limits (OOM kills stay in your namespace)
- Storage caps (you can't fill our disk)
- Pod limits (can't spawn a million containers)

Exceed your quota? Your stuff stops working, not everyone else's. Fair's fair.

## The Tech Stack

Nova is built on:

- **Kubernetes 1.28+**: Base orchestration
- **Capsule**: Multi-tenant operator
- **Capsule Proxy**: Tenant impersonation and isolation
- **Network Policies**: Traffic isolation
- **RBAC**: Permission boundaries
- **Resource Quotas**: Hard limits

We chose Capsule over alternatives (Hierarchical Namespaces, vCluster) because:
- Mature project, active development
- Doesn't add another control plane
- Works with standard Kubernetes tools
- Good docs (rare in K8s land)

## Cost Model

Here's the math: our multi-tenant cluster costs $X/month to run. We split that across N tenants. Each tenant pays based on their resource usage.

Use more, pay more. Use less, pay less. Simple.

Compare to AWS: minimum $72/month for a tiny EKS cluster. Nova starts at $5.

## What You Can Deploy

Anything that runs in a container:

- Web apps (Node, Python, Go, whatever)
- Databases (we support stateful sets)
- Workers and background jobs
- APIs and microservices
- Even ML workloads (if you have GPU quota)

If it fits in a Docker image and respects resource limits, Nova will run it.

## The Future

We're working on:

- Bare metal Nova (our own data centers)
- GPU instances for ML workloads
- Serverless containers (only pay when running)
- Spot instance support (cheaper, less reliable)

The goal is simple: make servers boring. Pick a size, deploy your code, forget about it.

## When Not to Use Nova

Don't use PipeOps-managed servers if you:

- Need root access to the node
- Want to run custom kernel modules
- Have compliance requiring dedicated hardware
- Need guaranteed physical isolation

In those cases, use Nova's cloud provisioning. We'll spin up VMs in your account instead.

## Try It

Go to console.pipeops.io, click "New Server," choose "PipeOps Managed." Pick your resources (1 CPU, 2GB RAM, 10GB storage - starts at $5/month).

Three minutes later, you have a server. Deploy something. It just works.

No AWS account. No kubectl. No Terraform. Just a server that runs your code.

---

139 commits into nova-templates. Most of that was debugging Capsule policies and figuring out why DNS broke (always DNS). Multi-tenancy is hard. But it works now.
