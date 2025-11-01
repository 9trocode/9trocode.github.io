---
layout: post
date: 2025-10-31
tags:
- Terraform
- Infrastructure
- PipeOps
---

# The Runner: How PipeOps Provisions Thousands of Clusters

The Runner is the workhorse of PipeOps. When someone clicks "Create Server," the Runner is what actually makes it happen.

It's a Go service that executes Terraform across multiple cloud providers, manages state, handles failures, and streams logs back in real-time.

## The Flow

1. Controller receives "provision cluster" request
2. Validates params (region, instance types, node count)
3. Queues job in RabbitMQ
4. Runner picks up job from queue
5. Clones appropriate Terraform modules from nova-templates
6. Injects customer-specific variables
7. Runs `terraform apply`
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

With hundreds of customers and thousands of clusters, Terraform state management is critical.

Each cluster gets its own state stored in the customer's cloud provider bucket. Not our bucket - yours. You bring your AWS/GCP/Azure account, we provision infrastructure in it, state lives there too.

Each cluster gets:

- Separate state file in customer's S3/GCS bucket
- State locking via DynamoDB (AWS) or native locking (GCS)
- Automated backups every hour
- Versioning enabled (can rollback state if needed)

State bucket structure in your account:
```
s3://customer-terraform-state-bucket/
  cluster-production/
    terraform.tfstate
    backups/
      terraform.tfstate.2025-10-31
  cluster-staging/
    terraform.tfstate
    backups/
      terraform.tfstate.2025-10-31
```

If state gets corrupted (it happens), we restore from backup. Your infrastructure, your state, your control.

## The Terraform Modules

We don't write Terraform from scratch for each cluster. We use modules:

**tf-k8s-module**: Core Kubernetes cluster (EKS, GKE, AKS)  
**tf-network-module**: VPC, subnets, routing  
**tf-essentials-module**: Ingress, cert-manager, monitoring  
**nova-tf-template**: Combines modules into full stacks

Modules are versioned. We lock versions to prevent breaking changes. When we update modules, we test in staging, then gradually roll out.

## Error Handling

Terraform fails. A lot. Our error handling:

**Cloud API failures**: Retry with exponential backoff (up to 5 times)  
**Quota limits**: Surface clear error with fix  
**Invalid config**: Validate before running Terraform  
**Partial failures**: Mark what succeeded, offer cleanup or continue  
**Terraform crashes**: Capture logs, save state, alert  

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

Users watch `terraform apply` output in real-time in the dashboard. It's WebSocket-based:

Runner → RabbitMQ → Controller → WebSocket → Browser

Terraform outputs to stdout/stderr, we capture it, send to queue, controller forwards to connected clients. They see everything as it happens.

## Cleanup on Failure

If provisioning fails halfway, we clean up what was created. Otherwise users end up with orphaned resources costing money.

The cleanup process:

1. Mark resources that were successfully created
2. Run `terraform destroy` on partial state
3. If destroy fails, retry up to 3 times
4. If still failing, alert ops team
5. Manually investigate and clean up

We log everything for post-mortem analysis.

## Variable Injection

Customers don't write Terraform. They fill out a form, we generate Terraform variables:

```hcl
cluster_name     = "customer-production"
region           = "us-east-1"
node_count       = 3
instance_type    = "t3.medium"
enable_monitoring = true
backup_schedule  = "daily"
```

We validate types, ranges, and dependencies before passing to Terraform. Invalid config never reaches `terraform apply`.

## Cost Estimation

Before applying, we estimate monthly costs using Terraform's plan output and cloud provider pricing APIs.

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


