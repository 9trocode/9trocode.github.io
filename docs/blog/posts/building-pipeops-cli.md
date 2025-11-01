---
date: 2025-10-31
authors:
  - alex
categories:
  - CLI
  - Developer Tools
  - Go
---

# Building the PipeOps CLI

The PipeOps CLI is how developers interact with the PipeOps platform from their terminal. It's written in Go and handles everything from deploying applications to managing infrastructure.

<!-- more -->

## Why a CLI

We could have made everything work through a web dashboard, but developers prefer CLIs for:

- Automation and scripting
- CI/CD integration
- Speed (no clicking through UIs)
- Version control (infrastructure as code)

The CLI needed to be fast, intuitive, and work offline when possible.

## Technical Stack

**Go** was the obvious choice:

- Single binary distribution (no dependencies)
- Cross-platform (macOS, Linux, Windows)
- Fast startup time
- Good standard library for CLI apps

We use [Cobra](https://github.com/spf13/cobra) for command structure and [Viper](https://github.com/spf13/viper) for configuration management.

## Command Structure

The CLI follows standard Unix conventions:

```bash
pipeops deploy              # Deploy current project
pipeops logs -f             # Stream logs
pipeops env set KEY=value   # Manage environment variables
pipeops status              # Check deployment status
```

Each command does one thing well. Complex workflows are compositions of simple commands.

## Challenges

**Authentication.** The CLI needs to authenticate with PipeOps API securely. We use OAuth device flow for interactive login and API tokens for CI/CD.

**State management.** The CLI caches some data locally (project info, last deployment) but needs to stay in sync with the server.

**Error messages.** Bad error messages waste developer time. We spent effort making errors actionable:

```bash
❌ Deployment failed: Port 3000 is not exposed
💡 Add EXPOSE 3000 to your Dockerfile
```

**Progress feedback.** Long-running operations need feedback. We show spinners for quick tasks and progress bars for deployments.

## What I Learned

**CLI UX matters.** Commands should be obvious. Help text should be useful. Error messages should help users fix problems.

**Testing is different.** Testing CLI apps means testing command parsing, flag handling, output formatting, and user interaction flows.

**Versioning is critical.** Users have different CLI versions installed. The CLI needs to handle API version mismatches gracefully.

**Configuration is complex.** Users expect config files, environment variables, and flags to all work together with proper precedence.

## Current State

The CLI is in active development (173 commits this year). It's used by all PipeOps customers and runs in thousands of CI/CD pipelines.

Features being added:

- Better autocomplete support
- Improved error recovery
- Local development environment setup
- Infrastructure resource management

## For CLI Builders

If you're building a CLI tool:

- Make common tasks simple, complex tasks possible
- Provide good help text and examples
- Use colors and formatting thoughtfully
- Support both interactive and non-interactive modes
- Version your CLI and handle backwards compatibility
- Test on all platforms you support

Building developer tools is rewarding. When done right, they disappear into the workflow and just work.
