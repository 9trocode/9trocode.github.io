---
date: 2025-10-31
authors:
  - alex
categories:
  - Terraform
  - Infrastructure
  - Kubernetes
---

# Dynamic Cluster Provisioning with Terraform Modules

At PipeOps, we provision Kubernetes clusters across multiple cloud providers for customers. The challenge: each customer has different requirements, but we need consistent, reliable infrastructure every time.

<!-- more -->

## The Architecture

The system has three main components:

**Runner** - Orchestrates cluster provisioning requests. When a customer requests a cluster, the runner picks the right Terraform modules and executes them.

**Controller** - Manages the lifecycle of infrastructure. It tracks what's deployed, handles updates, and tears down resources when needed.

**Nova Templates & TF Modules** - The actual infrastructure definitions. These are Terraform modules that create clusters on different cloud providers.

## How It Works

When a customer provisions a cluster:

1. Request comes in through the API
2. Runner validates requirements (region, node count, instance types)
3. Runner selects appropriate Terraform modules from nova templates
4. Controller executes Terraform with customer-specific variables
5. K8-agent gets deployed to the new cluster
6. Cluster reports back to PipeOps control plane

The entire process is automated. Customers get a production-ready Kubernetes cluster in 10-15 minutes.

## The Terraform Module Structure

We maintain separate modules for each component:

**tf-k8s-module** - Core Kubernetes cluster provisioning (EKS, GKE, AKS)

**tf-network-module** - VPC, subnets, security groups, firewall rules

**tf-essentials-module** - Kubernetes components (ingress controllers, cert-manager, monitoring)

**nova-tf-template** - Unifies all modules into deployable infrastructure stacks

Each module is:
- Provider-agnostic where possible
- Tested across cloud providers
- Versioned and locked to prevent breaking changes
- Documented with examples

## The Nova Template System

Nova templates are infrastructure blueprints. They define:

- Which Terraform modules to use
- Default configurations per cloud provider
- Variable schemas for customization
- Dependencies between components

For example, a basic cluster template includes:
- Network module (VPC setup)
- K8s module (cluster creation)
- Essentials module (core components)

Advanced templates add:
- Monitoring stack
- Service mesh
- Backup solutions
- Custom ingress configurations

## Challenges We Solved

**Multi-cloud complexity.** Each cloud provider has different resource models. AWS uses VPCs, GCP uses networks, Azure uses resource groups. We abstracted these differences in our modules.

**State management.** With hundreds of clusters, Terraform state management is critical. We use remote backends with state locking, separate state per cluster, and automated state backups.

**Variable validation.** Customers can customize clusters, but not break them. We validate all inputs before Terraform runs using custom validation rules.

**Idempotency.** Running the same configuration twice should be safe. Our modules are designed to be rerun without causing issues.

**Rollback handling.** If provisioning fails halfway, we need to clean up. The controller tracks resources and can tear down partial deployments.

## The Runner

The runner is the workhorse. It:

- Queues provisioning requests
- Manages concurrent Terraform executions
- Handles retries for transient failures
- Streams logs back to users
- Updates cluster status in real-time

Written in Go, it can handle hundreds of concurrent provisioning jobs. Each job runs in isolation with its own working directory and state.

## Real-World Impact

This system provisions:
- 100+ clusters per week
- Across 5 cloud providers
- In 20+ regions worldwide
- With 99%+ success rate

When provisioning fails, it's usually cloud provider issues (quota limits, API rate limiting), not our infrastructure code.

## What I Learned

**Terraform modules need careful design.** Once customers are using them, changes are risky. We version modules and maintain backwards compatibility.

**Dynamic configuration is complex.** Balancing flexibility with safety means extensive validation and testing.

**Observability is crucial.** When provisioning fails, we need to know why immediately. Detailed logging and error tracking are essential.

**Testing infrastructure code is hard.** We can't test every configuration in every region. We focus on common patterns and handle edge cases as they come up.

## The Code

The Terraform modules are private (part of PipeOps), but the patterns are applicable to anyone building multi-tenant infrastructure:

- Use module composition for flexibility
- Validate inputs rigorously
- Make operations idempotent
- Plan for failure and rollback
- Log everything

Building infrastructure platforms is challenging but rewarding. When it works, customers get clusters without thinking about the complexity underneath.
