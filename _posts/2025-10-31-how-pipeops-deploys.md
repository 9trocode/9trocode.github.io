---
layout: post
date: 2025-10-31
tags:
- PipeOps
- Kubernetes
- CI/CD
---

# How PipeOps Actually Deploys Your Code

People ask "how does PipeOps deploy my app?" Here's the real answer, not the marketing version.

When you push code or hit "Deploy," the Runner kicks into gear. It's a Go service that handles everything from pulling your code to getting it running in Kubernetes.

## The Flow

```
git push → webhook → controller → queue → runner → build → push → deploy
```

Let me break down what actually happens.

## Step 1: Git Event

You push code. GitHub/GitLab/Bitbucket sends us a webhook. We don't poll - polling is wasteful. Webhooks are instant.

The webhook tells us:
- Repo URL
- Branch
- Commit SHA
- Who pushed

We validate the signature (don't want fake webhooks), check if this project is configured for auto-deploy, then queue the job.

## Step 2: Runner Picks It Up

The Runner watches a RabbitMQ queue. When a job lands, it:

1. Creates isolated workspace
2. Clones the repo (shallow clone, we don't need full history)
3. Checks out the specific commit
4. Starts the build process

Each job gets its own directory. No shared state between builds. When it's done, workspace gets cleaned up.

## Step 3: Language Detection

If you didn't specify a build method, the Runner figures it out:

```
package.json → Node.js
requirements.txt → Python
go.mod → Go
pom.xml → Java
Gemfile → Ruby
```

Not rocket science, just pattern matching. Works 95% of the time. The other 5% you specify it yourself.

## Step 4: The Build

Three ways to build:

### Dockerfile

You provided one. We use it. Simple.

```bash
docker build -t your-app:${commit-sha} .
docker push registry/your-app:${commit-sha}
```

### Buildpacks

No Dockerfile? We use Cloud Native Buildpacks. They detect your framework, install dependencies, configure everything.

Buildpacks are magic when they work. Pain in the ass when they don't. But they handle most common stacks well.

### Custom Command

You specified a build command. We run it. Your responsibility if it breaks.

```bash
npm run build && docker build -t app .
```

## Step 5: Tests (If You Have Them)

The Runner looks for tests:

```bash
# Node.js
npm test

# Python
pytest

# Go
go test ./...
```

Tests fail? Build stops. No point deploying broken code.

Tests pass? We continue. No tests? We deploy anyway - your funeral.

## Step 6: Push to Registry

Built image goes to your container registry:

- DockerHub
- AWS ECR
- Google Container Registry  
- Azure Container Registry
- GitHub Container Registry

We handle auth for all of them. You provide credentials once, we encrypt and store them.

Image tag is the commit SHA. Makes rollbacks easy - just deploy a previous SHA.

## Step 7: Generate Manifests

The Runner generates Kubernetes manifests based on your project config:

**Deployment**: How to run your app  
**Service**: How to expose it internally  
**Ingress**: How to expose it externally (if public)  
**ConfigMap**: Environment variables  
**Secret**: Sensitive env vars (encrypted)  
**HPA**: Autoscaling rules (if enabled)

All generated from your settings. You don't write YAML unless you want to.

## Step 8: Deploy to Kubernetes

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

But smarter. We use the Go Kubernetes client, not shelling out to kubectl.

### Deployment Strategies

**Rolling Update** (default): Gradually replace old pods with new ones. MaxUnavailable=1, MaxSurge=1.

**Recreate**: Kill everything, start new version. Fast but downtime.

**Blue-Green**: Deploy new version alongside old, switch traffic when ready. Zero downtime but uses 2x resources temporarily.

**Canary**: Roll out to 5% of traffic, then 25%, then 50%, then 100%. Catches issues early.

You pick the strategy. We handle the mechanics.

## Step 9: Health Checks

We don't just deploy and hope. The Runner watches:

**Startup probes**: Is the app starting?  
**Readiness probes**: Is it ready for traffic?  
**Liveness probes**: Is it still alive?

If probes fail, we don't route traffic. If they keep failing, we rollback.

## Step 10: Post-Deploy Actions

After deployment succeeds:

```bash
# Run database migrations
kubectl exec pod -- npm run migrate

# Warm up caches
kubectl exec pod -- npm run cache:warm
```

You define these in lifecycle commands. We execute them in order.

## What About Failures?

Builds fail. Deploys fail. Shit happens.

When something breaks:

1. We log everything (stdout, stderr, exit codes)
2. Mark the deployment as failed
3. Send webhook to your systems
4. Keep the old version running
5. Show you exactly what broke and at which step

No vague "deployment failed" messages. You get:

```
❌ Deployment failed at: Apply Ingress Manifest
Error: admission webhook "validate.nginx.ingress.kubernetes.io" denied the request:
host "example.com" is already in use

Fix: Either remove the existing ingress using that host, or use a different domain.
```

Actionable errors. Not our fault your domain is already in use, but we'll tell you how to fix it.

## Rollbacks

Rollback is just deploying a previous image:

```bash
pipeops rollback --to=${previous-commit-sha}
```

We already have the image in the registry. Kubernetes manifests are the same. Deploy previous version, done.

Rollback takes 30 seconds, not 10 minutes.

## The Database Problem

Deployments are easy. Database migrations are hard.

If your migration breaks, you can't just rollback the code - the database schema changed. We handle this with:

1. **Backup before migrate**: Automatic DB snapshots
2. **Migration verification**: Run migrations in dry-run mode first
3. **Backward-compatible changes**: Add columns, don't drop them
4. **Two-phase migrations**: New code works with old schema

Still manual work on your part. We provide the tools, you use them correctly.

## Logs & Monitoring

During deployment, logs stream to the dashboard in real-time:

```
[12:34:01] Pulling source code from github.com/user/repo
[12:34:03] Detected language: Node.js 20.x
[12:34:05] Installing dependencies...
[12:34:45] Running tests...
[12:35:12] Building Docker image...
[12:37:22] Pushing to registry...
[12:38:01] Deploying to cluster...
[12:38:45] Health checks passing
[12:38:46] Deployment successful
```

WebSocket connection. Same logs go to our database for history.

## Scale and Performance

The Runner handles hundreds of concurrent builds. Each build is isolated:

- Separate workspace
- Resource limits (CPU, memory)
- Network isolation
- No shared state

Bottlenecks are usually:
- Git clones (slow repos)
- Docker builds (uncached layers)
- Cloud provider APIs (rate limits)
- Your tests (slow test suites)

Not our infrastructure. We're fast. Your 10-minute test suite is the problem.

## Security

Throughout this whole process:

- Secrets never logged
- Registry credentials encrypted
- Git tokens encrypted
- Workspaces cleaned after build
- Images scanned for vulnerabilities
- No secrets in container images

We take security seriously. Had external audits, passed them all.

## The Real Numbers

From our production Runner:

- Average build time: 3-8 minutes
- Average deploy time: 1-2 minutes
- Success rate: 97% (3% are user config issues)
- Concurrent builds: 50+ at peak
- Deployments per day: thousands

This isn't theory. This is production, handling real workloads.

---

That's how deployments work. No magic, just solid engineering. The Runner is 10,000+ lines of Go handling every edge case we've encountered over two years.

173 commits. Most of them fixing issues we didn't anticipate. Like AWS throttling our API calls. Or Docker builds hanging forever. Or Kubernetes API timeouts. All handled now.
