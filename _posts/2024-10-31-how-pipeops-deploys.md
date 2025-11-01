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
image: /assets/images/buildkit-deployment.png
---

People think deploying is simple. Push code, build image, deploy to Kubernetes. Done.

It's not. Here's what actually happens when you deploy on PipeOps, with all the details I wish other platforms documented.

## The Real Stack

Everything is written in Go. The Runner is a Go service that handles the entire lifecycle. We don't shell out to `docker build` - we use BuildKit's Go SDK directly.

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

We run BuildKit as a privileged pod in Kubernetes with custom configuration:

```toml
[worker.oci]
  max-parallelism = 8
  platforms = ["linux/amd64", "linux/arm64"]

[worker.containerd]
  enabled = true
  snapshotter = "overlayfs"

[[worker.oci.gcpolicy]]
  keepBytes = 100000000000  # 100GB cache
  keepDuration = 604800      # 7 days
  
[registry."docker.io"]
  mirrors = ["mirror.gcr.io"]
```

This config is tuned for:
- High concurrency (8 parallel operations)
- Large cache (100GB retention)
- Fast pulls (registry mirrors)
- Multi-platform builds

### The Build Process

{% raw %}
```go
// Simplified version of what we actually do
func buildWithBuildKit(ctx context.Context, dockerfile string, buildArgs map[string]string) error {
    client, err := buildkitclient.New(ctx, buildkitdAddr)
    if err != nil {
        return err
    }
    
    // Define build frontend (Dockerfile)
    frontend := gateway.NewGatewayForwarder(client, buildFrontend)
    
    // Configure build options
    opts := bk.SolveOpt{
        Frontend: "dockerfile.v0",
        FrontendAttrs: map[string]string{
            "filename": dockerfile,
        },
        LocalDirs: map[string]string{
            "context":    buildContext,
            "dockerfile": dockerfilePath,
        },
        CacheExports: []bk.CacheOptionsEntry{{
            Type: "s3",
            Attrs: map[string]string{
                "region": "auto",
                "bucket": cacheBucket,
                "name":   cacheKey,
            },
        }},
    }
    
    // Add build args
    for k, v := range buildArgs {
        opts.FrontendAttrs["build-arg:"+k] = v
    }
    
    // Execute build
    ch := make(chan *bk.SolveStatus)
    eg, ctx := errgroup.WithContext(ctx)
    
    eg.Go(func() error {
        _, err := client.Solve(ctx, nil, opts, ch)
        return err
    })
    
    eg.Go(func() error {
        // Stream build output in real-time
        for status := range ch {
            displayProgress(status)
        }
        return nil
    })
    
    return eg.Wait()
}
```
{% endraw %}

This is the real code pattern. We:
- Create BuildKit client (connects to BuildKit daemon)
- Define build context and Dockerfile location
- Configure S3 cache exports
- Pass build args (filtered - more on that later)
- Execute build with progress streaming
- Handle errors and cleanup

### Build Args: Security Matters

We filter what gets passed as build args. Early mistake: passing all env vars. Bad idea.

Now we only pass:
1. Args explicitly declared in Dockerfile with `ARG`
2. Essential build vars (commit SHA, build ID)
3. User vars that match declared ARGs

Everything else is filtered out. Your secrets don't end up in image layers.

```go
// From our actual code
func prepareFilteredBuildArgs(userVars map[string]string, declaredArgs []string) map[string]string {
    filtered := make(map[string]string)
    
    // Essential vars always included
    essentialVars := []string{"PIPEOPS_BUILD_SHA", "PIPEOPS_GIT_COMMIT"}
    for _, v := range essentialVars {
        if val, ok := os.LookupEnv(v); ok {
            filtered[v] = val
        }
    }
    
    // User vars only if declared as ARG
    for k, v := range userVars {
        if isInternalVar(k) {
            continue // Skip PipeOps internal vars
        }
        if contains(declaredArgs, k) {
            filtered[k] = v
        }
    }
    
    return filtered
}
```

We parse your Dockerfile, extract ARG declarations, match them against user vars. Undeclared vars don't get passed.

### Caching Strategy

Build cache lives in S3. Each project gets a cache key based on:
- Repository URL
- Branch name
- Dockerfile path

```
s3://buildcache/<repo-hash>/<branch>/<dockerfile-hash>
```

First build? Slow. Downloads all base images, installs all dependencies.

Second build? Fast. Only changed layers rebuild.

Team member builds? Fast. Shares your cache.

Cache expires after 7 days of no use. Automatic cleanup prevents S3 costs from exploding.

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

Once image is built, we generate Kubernetes manifests. Not templated YAML - generated from Go structs.

{% raw %}
```go
deployment := &appsv1.Deployment{
    ObjectMeta: metav1.ObjectMeta{
        Name:      projectName,
        Namespace: namespace,
        Labels:    labels,
    },
    Spec: appsv1.DeploymentSpec{
        Replicas: ptr.To(int32(replicas)),
        Selector: &metav1.LabelSelector{
            MatchLabels: labels,
        },
        Strategy: appsv1.DeploymentStrategy{
            Type: appsv1.RollingUpdateDeploymentStrategyType,
            RollingUpdate: &appsv1.RollingUpdateDeployment{
                MaxUnavailable: ptr.To(intstr.FromInt(1)),
                MaxSurge:       ptr.To(intstr.FromInt(1)),
            },
        },
        Template: corev1.PodTemplateSpec{
            ObjectMeta: metav1.ObjectMeta{
                Labels: labels,
            },
            Spec: corev1.PodSpec{
                Containers: []corev1.Container{{
                    Name:  projectName,
                    Image: imageWithTag,
                    Ports: containerPorts,
                    Env:   envVars,
                    Resources: corev1.ResourceRequirements{
                        Requests: resourceRequests,
                        Limits:   resourceLimits,
                    },
                    LivenessProbe:  livenessProbe,
                    ReadinessProbe: readinessProbe,
                    StartupProbe:   startupProbe,
                }},
                ImagePullSecrets: imagePullSecrets,
            },
        },
    },
}
```
{% endraw %}

We generate:
- Deployment (or StatefulSet for databases)
- Service (ClusterIP or LoadBalancer)
- Ingress (for public apps)
- ConfigMap (environment variables)
- Secret (sensitive env vars, encrypted)
- HorizontalPodAutoscaler (if autoscaling enabled)
- NetworkPolicy (traffic rules)
- PodDisruptionBudget (for HA setups)

All from your project configuration. No YAML editing.

## Deployment Strategies: More Than Rolling Updates

**Rolling Update**: Default. Max unavailable=1, max surge=1. Gradual rollout.

**Recreate**: Kill everything, start new version. Fast but downtime.

**Blue-Green**: We deploy new version with different labels, wait for health checks, then switch service selector. Zero downtime, uses 2x resources temporarily.

**Canary**: Deploy with weight-based routing. 5% traffic → 25% → 50% → 100%. Istio VirtualService for traffic splitting.

You pick the strategy. We implement it correctly.

## Health Checks: Not Optional

We configure three probe types:

**Startup probe**: Is the app starting? Checks every 5s, timeout 120s. Failure = pod never becomes ready.

**Readiness probe**: Should this pod receive traffic? Checks every 5s. Failure = removed from service endpoints.

**Liveness probe**: Is the app alive? Checks every 15s. Failure = pod restart.

Default probes:
{% raw %}
```go
livenessProbe := &corev1.Probe{
    ProbeHandler: corev1.ProbeHandler{
        HTTPGet: &corev1.HTTPGetAction{
            Path: "/health",
            Port: intstr.FromInt(port),
        },
    },
    InitialDelaySeconds: 20,
    PeriodSeconds:       15,
    TimeoutSeconds:      2,
    FailureThreshold:    3,
}
```
{% endraw %}

Custom health endpoints? Configure them. We'll use them.

## Deployment Rollout Tracking

We don't just apply manifests and hope. We watch the rollout:

```go
func watchRollout(ctx context.Context, deployment string, namespace string) error {
    watcher, err := clientset.AppsV1().Deployments(namespace).Watch(ctx, metav1.ListOptions{
        FieldSelector: fmt.Sprintf("metadata.name=%s", deployment),
    })
    if err != nil {
        return err
    }
    defer watcher.Stop()
    
    for {
        select {
        case event := <-watcher.ResultChan():
            deploy := event.Object.(*appsv1.Deployment)
            
            if deploy.Status.UpdatedReplicas == deploy.Status.Replicas &&
               deploy.Status.ReadyReplicas == deploy.Status.Replicas &&
               deploy.Status.AvailableReplicas == deploy.Status.Replicas {
                return nil // Rollout complete
            }
            
            if deploy.Status.Conditions != nil {
                for _, cond := range deploy.Status.Conditions {
                    if cond.Type == appsv1.DeploymentProgressing && cond.Reason == "ProgressDeadlineExceeded" {
                        return fmt.Errorf("deployment deadline exceeded")
                    }
                }
            }
        case <-ctx.Done():
            return ctx.Err()
        }
    }
}
```

We stream status updates to the dashboard in real-time via WebSockets. You see exactly what's happening.

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
