---
layout: post
date: 2025-10-31
tags:
- CLI
- Go
- Developer Tools
---

# Building the PipeOps CLI

The PipeOps CLI started because I got tired of clicking through dashboards. If I'm deploying from my terminal anyway, why switch to a browser?

Written in Go, 173 commits over 6 months. It does everything the web dashboard does, but faster.

## Why CLI

Developers prefer terminals for:

- Speed (no UI to load)
- Scriptability (CI/CD integration)
- Automation (no clicking 50 buttons)
- Muscle memory (commands don't move)

The dashboard is great for exploration. The CLI is great for work.

## Commands

```bash
pipeops login                    # OAuth device flow
pipeops projects list            # Show your projects
pipeops deploy                   # Deploy current directory
pipeops logs -f                  # Stream logs
pipeops env set KEY=val          # Manage environment variables
pipeops scale --replicas=5       # Scale deployment
pipeops rollback                 # Rollback to previous version
pipeops exec -- /bin/sh          # SSH into container
```

Unix philosophy: each command does one thing. Compose them for complex workflows.

## Authentication

CLI auth is different than web auth. No browser redirect. No callback URLs.

We use OAuth device flow:

1. User runs `pipeops login`
2. CLI requests device code from API
3. CLI shows: "Go to https://pipeops.io/activate and enter: ABCD-1234"
4. User enters code in browser
5. User approves access
6. CLI polls API until approved
7. CLI receives access token
8. Token saved in `~/.pipeops/config`

Works great for:
- Remote servers (no browser)
- CI/CD (API tokens instead)
- Headless environments

## Project Detection

Run `pipeops deploy` in any directory. CLI figures out the project:

1. Check if `.pipeops.yml` exists (explicit config)
2. Check git remote (match repo URL)
3. Check directory name (fuzzy match project names)
4. Ask user to select from list

Once detected, remember for next time.

## Real-Time Output

When deploying, you see build logs in real-time:

```
[12:34:56] Pulling source code...
[12:34:58] Running npm install...
[12:35:45] Building Docker image...
[12:37:12] Pushing to registry...
[12:37:45] Deploying to cluster...
[12:38:02] Deployment successful!
```

Same WebSocket connection the dashboard uses. CLI just renders it differently.

## Error Messages

Bad CLI tools show useless errors. We try to be helpful:

**Bad:**
```
Error: deployment failed
```

**Good:**
```
❌ Deployment failed: Port 3000 not exposed

Your Dockerfile needs to expose the port your app listens on:

  EXPOSE 3000

Or set it in pipeops.yml:

  port: 3000

Re-run with: pipeops deploy --port=3000
```

Always explain what's wrong and how to fix it.

## Configuration

Three levels of config (in precedence order):

1. Command flags: `--replicas=3`
2. Environment variables: `PIPEOPS_REPLICAS=3`
3. Config file: `.pipeops.yml`

```yaml
# .pipeops.yml
project: my-app
environment: production
replicas: 3
port: 8080
env:
  NODE_ENV: production
  API_KEY: ${API_KEY}  # From environment
```

Commit this to git. Everyone on the team uses same config.

## CI/CD Integration

The CLI is built for automation:

```yaml
# GitHub Actions
- name: Deploy to PipeOps
  env:
    PIPEOPS_TOKEN: ${{ secrets.PIPEOPS_TOKEN }}
  run: |
    curl -sfL https://cli.pipeops.io/install.sh | sh
    pipeops deploy --wait
```

The `--wait` flag blocks until deployment succeeds or fails. Exit code 0 = success, non-zero = failure.

## Tab Completion

Install completions for your shell:

```bash
pipeops completion bash > /etc/bash_completion.d/pipeops
pipeops completion zsh > /usr/local/share/zsh/site-functions/_pipeops
```

Then `pipeops dep<TAB>` → `pipeops deploy`

Works with project names too: `pipeops logs my-<TAB>` → lists matching projects.

## Offline Mode

The CLI caches recent data. If the API is down or you're offline:

- Recent projects list still works
- Last deployment info still available
- Config still loads

Obviously can't deploy without API access, but you can still query local state.

## Binary Distribution

Single binary, no dependencies:

```bash
# macOS
brew install pipeops-cli

# Linux
curl -sfL https://cli.pipeops.io/install.sh | sh

# Windows
scoop install pipeops
```

The binary works on:
- macOS (Intel and Apple Silicon)
- Linux (amd64, arm64)
- Windows (amd64)

We cross-compile from Go. One codebase, every platform.

## What's Next

Working on:

- Interactive mode (`pipeops shell`)
- Local development environment
- Plugin system
- Better autocomplete
- Offline-first architecture

The goal: terminal-first experience. Everything you need without leaving the terminal.

## The Code

Private repo (part of PipeOps), but the patterns are standard:

- Cobra for command structure
- Viper for config management
- Survey for interactive prompts
- Color/Chalk for pretty output
- Websocket for real-time streaming

## Try It

```bash
brew install pipeops-cli
pipeops login
pipeops projects list
pipeops deploy
```

If you like terminals, you'll like the CLI.

---

173 commits. Most of that was getting auth right, handling edge cases, and making error messages useful. CLI UX is hard - there's no back button.
