---
date: 2025-10-31
authors:
  - alex
categories:
  - Infrastructure
  - Platform Engineering
  - Go
---

# Building the PipeOps Controller

The PipeOps controller is the brain of our platform. It manages the entire lifecycle of infrastructure - from provisioning to updates to teardown. It coordinates between the API, runner, Terraform modules, and Kubernetes clusters.

<!-- more -->

## What the Controller Does

The controller sits at the center of PipeOps architecture:

- Receives infrastructure requests from the API
- Dispatches provisioning jobs to the runner
- Tracks infrastructure state
- Handles updates and modifications
- Manages teardown and cleanup
- Enforces policies and quotas
- Monitors cluster health

It's a state machine that moves infrastructure through different stages: pending → provisioning → active → updating → deleting.

## Architecture Decisions

**Event-driven design.** The controller responds to events rather than polling. When a cluster needs provisioning, an event triggers the workflow.

**State persistence.** All infrastructure state is stored in a database. The controller is stateless and can be restarted without losing track of what's deployed.

**Queue-based processing.** Requests go into queues. This prevents overload and allows graceful handling of spikes.

**Idempotent operations.** Operations can be retried safely. If provisioning fails halfway, rerunning picks up where it left off.

## The State Machine

Infrastructure moves through defined states:

```
PENDING → PROVISIONING → CONFIGURING → ACTIVE
    ↓          ↓              ↓           ↓
  FAILED ← ──────────────────────← ─ ← ← ←
                                          ↓
                                    UPDATING
                                          ↓
                                    DELETING → DELETED
```

Each transition has specific actions:
- PENDING → PROVISIONING: Validate request, queue job
- PROVISIONING → CONFIGURING: Deploy k8-agent
- CONFIGURING → ACTIVE: Verify cluster health
- ACTIVE → UPDATING: Apply changes via Terraform
- ACTIVE → DELETING: Tear down infrastructure

## Challenges

**Handling long-running operations.** Terraform can take 15 minutes to provision a cluster. The controller needs to track progress without blocking.

**Solution:** Async job execution. The controller dispatches jobs and gets notified on completion. It doesn't wait.

**Concurrent modifications.** What if a user tries to update a cluster that's already being updated?

**Solution:** State locking. Only one operation per cluster at a time. Additional requests are queued.

**Partial failures.** Infrastructure might be half-created when an error occurs.

**Solution:** Track resources created. On failure, attempt cleanup. Store state for manual intervention if needed.

**Multi-tenancy.** Different customers share the controller but shouldn't affect each other.

**Solution:** Resource isolation. Each customer's jobs run in separate contexts with quotas and rate limits.

## Integration with Runner

The controller and runner work together:

1. Controller receives infrastructure request
2. Controller validates and prepares configuration
3. Controller sends job to runner via message queue
4. Runner executes Terraform
5. Runner streams progress back to controller
6. Controller updates infrastructure state
7. Controller notifies user of completion

The runner handles execution; the controller handles orchestration.

## Working with Terraform

The controller manages Terraform lifecycle:

**Initialization:** Generate backend config, set up state bucket, prepare working directory

**Planning:** Run terraform plan, parse output, detect changes

**Applying:** Execute terraform apply, capture resource IDs, update database

**State management:** Store state remotely, lock during operations, backup regularly

**Outputs:** Extract outputs, store for later use (API endpoints, credentials)

## Observability

With infrastructure spanning multiple clouds and hundreds of clusters, observability is critical:

**Structured logging:** Every operation is logged with context (customer, cluster, operation type)

**Metrics:** Provisioning times, failure rates, queue depths, active operations

**Distributed tracing:** Track requests from API through controller to runner to Terraform

**Alerts:** Failed provisions, long-running operations, state inconsistencies

## Error Handling

Infrastructure operations fail. A lot. The controller needs to handle:

- Cloud provider API failures
- Network timeouts
- Quota limits
- Invalid configurations
- Terraform crashes
- State corruption

For each error type:
- Log detailed information
- Determine if retryable
- Update user-facing status
- Clean up if necessary
- Alert if requires intervention

## Current Development

Recent work includes:

- Improved rollback mechanisms
- Better handling of cloud provider outages
- Support for infrastructure drift detection
- Automated cost optimization
- Multi-region failover

The controller evolves as we learn from production issues and customer needs.

## Lessons Learned

**State machines are powerful.** They make complex workflows manageable and debuggable.

**Async is necessary.** Long-running operations can't block. Embrace async patterns from the start.

**Logging is worth the effort.** When debugging production issues, detailed logs are invaluable.

**Test failure paths.** Happy path is easy. Failure handling is where bugs hide.

**Idempotency is hard but essential.** Making operations safely retryable takes thought but prevents so many issues.

Building platform infrastructure is complex. The controller hides that complexity from users, letting them provision clusters with a single API call while handling hundreds of edge cases underneath.
