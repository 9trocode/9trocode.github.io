---
layout: post
title: "How PipeOps Actually Deploys Your Code"
date: 2024-10-31
description: "Deep dive into PipeOps deployment pipeline: BuildKit, Kubernetes, Go, and production infrastructure. Real implementation details, not marketing."
tags:
- PipeOps
- Kubernetes
- BuildKit
- Go
- DevOps
- CI/CD
---

People think deploying is simple. Push code, build image, deploy to Kubernetes. Done.

It's not. Here's what actually happens when you deploy on PipeOps, with all the details I wish other platforms documented.

## Architecture Overview

Here's the complete flow from git push to running container:

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    PipeOps Platform                          │
│                                                              │
│  ┌──────────┐     ┌────────────┐     ┌─────────────┐       │
│  │ Webhook  │────▶│ Controller │────▶│  RabbitMQ   │       │
│  │   API    │     │  (Go)      │     │   Queue     │       │
│  └──────────┘     └────────────┘     └──────┬──────┘       │
│                                              │              │
│                                              ▼              │
│                                       ┌─────────────┐       │
│                                       │   Runner    │       │
│                                       │   (Go)      │       │
│                                       └──────┬──────┘       │
│                                              │              │
│                  ┌───────────────────────────┼───────────┐  │
│                  │                           │           │  │
│                  ▼                           ▼           ▼  │
│          ┌──────────────┐         ┌──────────────┐  ┌────┐ │
│          │   BuildKit   │         │  Kubernetes  │  │ DB │ │
│          │    (Build)   │         │  (Deploy)    │  └────┘ │
│          └──────┬───────┘         └──────────────┘         │
│                 │                                           │
│                 ▼                                           │
│          ┌──────────────┐                                   │
│          │    Image     │                                   │
│          │   Registry   │                                   │
│          └──────────────┘                                   │
└──────────────────────────────────────────────────────────────┘
```

Every deployment goes through this pipeline. No shortcuts, no special cases.

## The Real Stack

Everything is written in Go. The [Runner](/2024/10/31/runner-terraform-provisioning.html) is a Go service that handles the entire deployment lifecycle. We don't shell out to `docker build` - we use BuildKit's Go SDK directly.

Why Go? Because we need:
- Concurrency (hundreds of simultaneous builds)
- Performance (fast is non-negotiable)
- Type safety (infrastructure code needs to be reliable)
- Good Kubernetes client libraries

## Git to Build: The Actual Flow

When you push code:

1. Webhook hits our API (signature validated - we don't trust anyone)
2. Controller validates the project exists and is configured
3. Job goes into RabbitMQ with full context
4. Runner picks it up from the queue
5. Creates isolated workspace with unique ID
6. Clones repo (shallow clone, commit-specific)
7. Detects language if not specified
8. Executes build

Each workspace is isolated. No shared state. Workspace gets nuked after build completes or fails.

## Language Detection: Pattern Matching

Not AI, not magic - just file patterns:

```go
if fileExists("package.json") {
    return "nodejs"
} else if fileExists("requirements.txt") || fileExists("Pipfile") {
    return "python"
} else if fileExists("go.mod") {
    return "go"
} else if fileExists("pom.xml") || fileExists("build.gradle") {
    return "java"
}
```

Works 95% of the time. The other 5%, you tell us what you're using.

## BuildKit: Not Docker

We don't run `docker build`. We use BuildKit - Docker's build engine - but directly via its Go API.

### Why BuildKit?

**Parallel builds**: BuildKit builds independent layers in parallel. Regular Docker is sequential.

**Better caching**: Content-addressable storage. If layer content hasn't changed, it's cached even if Dockerfile changed.

**Remote caching**: Build cache in S3. Team members share cache. First build is slow, rest are fast.

**Build secrets**: Pass secrets without baking them into images. They're mounted at build time, never stored.

**Multi-platform**: Build ARM and x86 images simultaneously. Same Dockerfile, multiple architectures.

### Our BuildKit Setup

We run BuildKit as privileged pods in Kubernetes with tuned configuration for:

- **High concurrency** - Multiple parallel build operations per pod
- **Large cache retention** - Aggressive caching strategy to maximize hit rates
- **Fast base image pulls** - Registry mirrors and geographic distribution
- **Multi-platform builds** - ARM64 and AMD64 support out of the box

The BuildKit configuration is optimized for throughput over individual build speed - we prioritize handling 50+ concurrent builds over making one build 10% faster.

### The Build Process

We use BuildKit's Go SDK directly - no shelling out to `docker build`. The flow:

1. **Connect to BuildKit daemon** - Each Runner maintains a pool of BuildKit connections
2. **Prepare build context** - Isolated workspace with source code and Dockerfile
3. **Configure cache backend** - S3-backed cache with content-addressable storage
4. **Stream progress** - Real-time build output to dashboard via WebSockets
5. **Handle completion** - Push image to registry or fail with actionable errors

The BuildKit SDK gives us fine-grained control over:
- Build parallelization (independent layers build simultaneously)
- Cache import/export (share cache across team)
- Secret handling (mount secrets at build time, never bake into image)
- Multi-platform targeting (ARM64 + AMD64 from same Dockerfile)

### Build Args: Security Matters

We filter what gets passed as build args. Early mistake: passing all env vars. Bad idea - secrets ended up in image layers.

Now we only pass:
1. Args explicitly declared in Dockerfile with `ARG`
2. Essential build metadata (commit SHA, build ID, timestamps)
3. User-provided build args that match declared ARGs

Everything else is filtered out. We parse your Dockerfile, extract ARG declarations, and only pass matching variables. Undeclared args are silently dropped.

This prevents accidents like `--build-arg DATABASE_PASSWORD=...` ending up in image metadata that anyone can inspect with `docker history`.

### Caching Strategy

Build cache lives in S3 with content-addressable storage. Each project gets isolated cache namespacing based on repo, branch, and Dockerfile path.

First build? Slow. Downloads all base images, installs all dependencies.

Second build? Fast. Only changed layers rebuild.

Team member builds? Fast. Shares your cache automatically.

Cache has automatic expiration and cleanup - we balance hit rates against storage costs. The system adapts: frequently-built projects get longer retention, abandoned projects get cleaned up fast.

## Push to Registry

Built image gets pushed to your container registry. We support all major registries with native authentication:

**DockerHub**: Username/token  
**AWS ECR**: IAM credentials with auto-renewal  
**GCR**: Service account JSON  
**GitHub/GitLab**: OAuth tokens  
**Azure ACR**: Service principal  

Image tag is always the commit SHA. Makes rollbacks trivial - just deploy a different SHA.

Multi-platform images? We push a manifest list. One tag, multiple architectures. Kubernetes pulls the right one.

## Manifest Generation: Kubernetes Resources

Once image is built, we generate Kubernetes manifests. Not templated YAML - generated programmatically from Go structs using the official Kubernetes client libraries.

We generate a complete resource stack:
- **Deployment** (or StatefulSet for stateful apps)
- **Service** (ClusterIP, LoadBalancer, or NodePort)
- **Ingress** (for public apps with TLS)
- **ConfigMap** (non-sensitive environment variables)
- **Secret** (sensitive env vars, encrypted at rest)
- **HorizontalPodAutoscaler** (if autoscaling enabled)
- **NetworkPolicy** (traffic isolation rules)
- **PodDisruptionBudget** (for high availability)

All generated from your project configuration. The advantage of Go structs over YAML templates: type safety catches errors at compile time, not when the deploy fails.

## Deployment Strategies: More Than Rolling Updates

**Rolling Update**: Default. Max unavailable=1, max surge=1. Gradual rollout.

**Recreate**: Kill everything, start new version. Fast but downtime.

**Blue-Green**: We deploy new version with different labels, wait for health checks, then switch service selector. Zero downtime, uses 2x resources temporarily.

**Canary**: Deploy with weight-based routing. 5% traffic → 25% → 50% → 100%. Istio VirtualService for traffic splitting.

You pick the strategy. We implement it correctly.

## Health Checks: Not Optional

We configure three probe types:

**Startup probe**: Is the app starting? High timeout tolerance for slow-starting apps.

**Readiness probe**: Should this pod receive traffic? Failure removes pod from service endpoints immediately.

**Liveness probe**: Is the app alive? Failure triggers pod restart.

Default probes hit `/health` endpoints with tuned timeouts and thresholds based on app type. Node.js apps get longer startup windows than Go apps. Databases get different probe intervals than web servers.

Custom health endpoints? Configure them in project settings. We'll use whatever you specify - HTTP, TCP, or exec probes.

## Deployment Rollout Tracking

We don't just apply manifests and hope. We watch the rollout using Kubernetes watch APIs to monitor deployment status in real-time.

The Runner tracks:
- **Replica counts** - Are new pods being created?
- **Ready status** - Are new pods passing health checks?
- **Rollout conditions** - Did we hit the progress deadline?
- **Pod events** - Why did that pod fail to start?

All status updates stream to the dashboard via WebSockets. You see exactly what's happening: "Pod 2/3 ready", "Waiting for health checks", "Rollout complete".

If the rollout stalls (pods not ready after deadline), we automatically rollback to the previous version. The old ReplicaSet is never deleted until the new one is healthy.

## When Things Fail

Builds fail. Deployments fail. We handle it.

**Build failure**: Log the error, mark build as failed, send webhook, keep old version running.

**Image push failure**: Retry with exponential backoff (3 attempts), then fail.

**Deployment failure**: Monitor rollout for 5 minutes. If pods don't become ready, automatic rollback.

Errors are actionable:

```
❌ Deployment failed: ImagePullBackOff

Error: Failed to pull image "registry/app:abc123"
Reason: authentication required

Fix:
1. Verify registry credentials in project settings
2. Ensure image tag exists in registry
3. Check registry is accessible from cluster

Run: pipeops project registry update
```

No "something went wrong." Real errors, real fixes.

## Performance Numbers

From production:

- Average build time (with cache): 2-4 minutes
- Average build time (no cache): 6-10 minutes
- Average deploy time: 45-90 seconds
- Concurrent builds: 50+ at peak
- Build success rate: 97%
- Deployment success rate: 98.5%

The 3% build failures? Usually user config (broken Dockerfile, missing dependencies).

The 1.5% deployment failures? Usually cluster issues (out of resources, network problems).

### How We Compare

Compared to other CI/CD platforms (Node.js app, cold cache):

| Platform | Build Time | Deploy Time | Total |
|----------|------------|-------------|-------|
| **PipeOps** | **6-8 min** | **60 sec** | **~7-9 min** |
| GitHub Actions | 8-12 min | 2-3 min | 10-15 min |
| CircleCI | 7-10 min | 2-3 min | 9-13 min |
| GitLab CI | 9-13 min | 2-4 min | 11-17 min |

Why we're faster:

- **BuildKit's layer caching** - Smarter than Docker's cache
- **Dedicated build infrastructure** - Not competing for shared runners
- **Geographic distribution** - BuildKit nodes close to clusters
- **Direct K8s deployment** - No intermediate artifacts or handoffs
- **Optimized base images** - We maintain language-specific optimized images

With cache hits (typical after first deploy):

| Platform | Build + Deploy |
|----------|---------------|
| **PipeOps** | **2-3 min** |
| GitHub Actions | 4-6 min |
| CircleCI | 4-5 min |
| GitLab CI | 5-7 min |

The difference compounds. 50 deploys per day? PipeOps saves your team 4-5 hours of waiting.

## What We Don't Do

We don't:
- Run builds on your cluster (security risk)
- Store secrets in images (filtered out)
- Use Docker in Docker (unstable)
- Poll Git repositories (wasteful, webhooks only)
- Keep failed builds around (cleanup is automatic)

## The Code

The Runner is 10,000+ lines of Go. Two years of production taught us everything that can break:

- AWS throttling ECR pushes
- BuildKit daemon crashes under load
- Kubernetes API timeouts during deploys
- Image pull failures on slow networks
- Race conditions in concurrent builds

All handled now.

---

**Related Posts:**
- [The Runner: Terraform Multi-Cloud Provisioning](/2024/10/31/runner-terraform-provisioning.html) - How infrastructure is provisioned
- [Nova: Multi-Tenant Kubernetes Without the Complexity](/2024/11/01/nova-multitenancy.html) - Where deployments run
- [The PipeOps Agent: One Script to Rule Them All](/2024/11/01/pipeops-agent-installer.html) - Installing on BYOS infrastructure
