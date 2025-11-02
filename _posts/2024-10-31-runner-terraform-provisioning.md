---
layout: post
title: "The Runner: Terraform Multi-Cloud Provisioning"
date: 2024-10-31
description: "How PipeOps Runner provisions Kubernetes clusters across AWS, GCP, and Azure using Terraform. State management, error handling, and production lessons."
tags:
- Terraform
- Infrastructure
- PipeOps
- AWS
- GCP
- Azure
- Kubernetes
---

The Runner is the workhorse of PipeOps. When someone clicks "Create Server," the Runner is what actually makes it happen.

It's a Go service that provisions infrastructure across multiple cloud providers, manages state, handles failures, and streams logs back in real-time.

## The Flow

1. Controller receives "provision cluster" request
2. Validates params (region, instance types, node count)
3. Queues job in RabbitMQ
4. Runner picks up job from queue
5. Loads our custom infrastructure modules
6. Injects customer-specific variables
7. Executes provisioning workflow
8. Streams output back to user in real-time
9. Extracts outputs (cluster endpoints, credentials)
10. Updates database with results
11. Triggers k8-agent deployment
12. Marks job complete

Average time: 10-15 minutes for a new cluster. Faster for updates.

## Multi-Cloud Complexity

Supporting AWS, GCP, Azure, DigitalOcean, and Linode meant handling each provider's quirks:

**AWS**: VPCs, subnets, security groups, IAM roles. Everything needs tagging. EKS takes 12 minutes to provision.

**GCP**: Networks, subnetworks, firewall rules, service accounts. GKE is faster (8 minutes) but weird networking defaults.

**Azure**: Resource groups, virtual networks, NSGs, managed identities. AKS takes forever (15 minutes). Their API is slow.

**DigitalOcean**: Simple but limited. K8s setup is quick (6 minutes) but features are basic.

**Linode**: Similar to DO. Fast but fewer regions.

The Runner abstracts all this. User picks "AWS, us-east-1, 3 nodes" and we handle the rest.

## State Management

With hundreds of customers and thousands of clusters, infrastructure state management is critical.

Each cluster gets its own state stored in the customer's cloud provider bucket. Not our bucket - yours. You bring your AWS/GCP/Azure account, we provision infrastructure in it, state lives there too.

Each cluster gets:

- Separate state file in customer's S3/GCS bucket
- State locking mechanisms (DynamoDB for AWS, native for GCS)
- Automated backups every hour
- Versioning enabled (can rollback if needed)

State bucket structure in your account:
```
s3://customer-state-bucket/
  cluster-production/
    state.tf
    backups/
      state.2024-10-31.tf
  cluster-staging/
    state.tf
    backups/
      state.2024-10-31.tf
```

If state gets corrupted (it happens), we restore from backup. Your infrastructure, your state, your control.

## Infrastructure Modules

We don't provision infrastructure from scratch for each cluster. We use internally-built, battle-tested modules that we've developed and maintained over two years:

**Kubernetes Module**: Core cluster provisioning (EKS, GKE, AKS)  
**Network Module**: VPC, subnets, routing, security groups  
**Essentials Module**: Ingress controllers, cert-manager, monitoring stack  
**Template Repository**: Combines modules into complete infrastructure stacks

All modules are developed and maintained privately by our team. They're versioned and locked to prevent breaking changes. When we update modules, we test in staging environments, then gradually roll out to production clusters.

## Error Handling

Infrastructure provisioning fails. A lot. Our error handling:

**Cloud API failures**: Retry with exponential backoff (up to 5 times)  
**Quota limits**: Surface clear error with fix  
**Invalid config**: Validate before execution  
**Partial failures**: Mark what succeeded, offer cleanup or continue  
**Process crashes**: Capture logs, save state, alert ops team  

When provisioning fails, users get:
1. What went wrong
2. At what step
3. How to fix it
4. Option to retry or rollback

No "Something went wrong." Actual information.

## Concurrent Execution

The Runner handles hundreds of concurrent jobs:

- Each job gets isolated workspace
- Separate working directories
- No shared state between jobs
- Resource limits per job (CPU, memory)
- Job timeouts (30 minutes max)

We can run 50+ Terraform jobs simultaneously. The bottleneck is cloud provider APIs, not our infrastructure.

## Streaming Logs

Users watch provisioning output in real-time in the dashboard. It's WebSocket-based:

Runner → RabbitMQ → Controller → WebSocket → Browser

The provisioning process outputs to stdout/stderr, we capture it, send to queue, controller forwards to connected clients. They see everything as it happens.

## Cleanup on Failure

If provisioning fails halfway, we clean up what was created. Otherwise users end up with orphaned resources costing money.

The cleanup process:

1. Mark resources that were successfully created
2. Run cleanup procedures on partial state
3. If cleanup fails, retry up to 3 times
4. If still failing, alert ops team
5. Manually investigate and resolve

We log everything for post-mortem analysis.

## Variable Injection

Customers don't write infrastructure code. They fill out a form, we generate the required configuration:

```yaml
cluster_name: "customer-production"
region: "us-east-1"
node_count: 3
instance_type: "t3.medium"
enable_monitoring: true
backup_schedule: "daily"
```

We validate types, ranges, and dependencies before execution. Invalid config never reaches the provisioning stage.

## Cost Estimation

Before provisioning, we estimate monthly costs using cloud provider pricing APIs and our infrastructure module calculations.

"This cluster will cost approximately $450/month."

Not perfect (data transfer and storage costs are hard to predict), but close enough for budget planning.

## What's Next

Working on:

- Drift detection (alert when manual changes diverge from Terraform)
- Cost optimization recommendations
- Faster provisioning (parallel resource creation where safe)
- Better rollback mechanisms
- Support for more cloud providers

The Runner evolved from "provision clusters" to handling all infrastructure operations. Updates, scaling, configuration changes, teardowns - all go through the Runner now.

Our infrastructure modules represent two years of production learnings, edge cases, and optimizations. They're not open source - they're our competitive advantage.


