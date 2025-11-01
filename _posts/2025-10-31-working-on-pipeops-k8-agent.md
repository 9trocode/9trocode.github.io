---
date: 2025-10-31
layout: post
tags:
- Kubernetes
- Infrastructure
- PipeOps
---

# Building the PipeOps Kubernetes Agent

Most of my recent work has been on `pipeops-k8-agent` - a Kubernetes controller that manages deployments and infrastructure for PipeOps. With 274 commits this year, it's become the core of how we deploy applications.

<!-- more -->

## What It Does

The k8-agent runs inside Kubernetes clusters and handles:

- Deploying applications from Git repositories
- Managing Kubernetes resources (deployments, services, ingress)
- Monitoring application health and metrics
- Handling rollbacks and updates
- Reporting cluster state back to PipeOps control plane

It's essentially the bridge between PipeOps platform and customer Kubernetes clusters.

## The Challenge

Building a Kubernetes controller that runs in untrusted environments is tricky. The agent has to:

- Work across different Kubernetes distributions (EKS, GKE, AKS, self-hosted)
- Handle network partitions gracefully
- Manage resources without breaking existing cluster configurations
- Be lightweight and not consume too many resources
- Recover from failures automatically

## Architecture Decisions

**Event-driven design.** The agent watches Kubernetes events and PipeOps API events, reconciling state when they diverge.

**Stateless operations.** The agent doesn't store state locally. Everything is derived from Kubernetes API and PipeOps API, making it resilient to restarts.

**Leader election.** Multiple agent replicas can run for high availability, using leader election to prevent conflicts.

## Real Problems, Real Solutions

**Problem: Detecting when deployments actually fail.** Kubernetes doesn't always report failures immediately. A pod might crash loop, or image pulls might fail silently.

**Solution:** We watch multiple signals - pod status, deployment progress, event logs - and correlate them to determine actual deployment health.

**Problem: Managing resources we didn't create.** Clusters often have existing resources. We needed to manage new resources without touching existing ones.

**Solution:** Label-based selection. The agent only manages resources with specific labels, ignoring everything else.

## What I've Learned

**Kubernetes is complex.** There are so many edge cases - CrashLoopBackOff, ImagePullBackOff, resource limits, network policies, RBAC. Each one needs handling.

**Observability is critical.** When the agent runs in 100+ clusters, you can't SSH in to debug. Structured logging, metrics, and error reporting are essential.

**Reconciliation loops are hard to get right.** The agent constantly reconciles desired state with actual state. Getting this logic correct, especially around retries and backoff, took iteration.

**Testing in production is unavoidable.** No amount of staging can replicate all the environments customers run. We ship carefully and monitor closely.

## Current Work

Right now I'm working on:

- Resource optimization - automatically adjusting resource requests based on actual usage
- Better error handling for network partitions
- Support for more Kubernetes features (StatefulSets, Jobs)
- Performance improvements for large clusters

The agent is closed source (part of PipeOps), but the problems and solutions are universal to anyone building Kubernetes controllers.

## Resources

If you're building Kubernetes operators or controllers, these helped me:

- [Kubernetes Controller Runtime](https://github.com/kubernetes-sigs/controller-runtime)
- [Programming Kubernetes](https://www.oreilly.com/library/view/programming-kubernetes/9781492047094/) by O'Reilly
- [Kubernetes Development Guide](https://github.com/kubernetes/community/tree/master/contributors/devel)
