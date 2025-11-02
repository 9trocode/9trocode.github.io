---
layout: post
title: "The PipeOps Agent: One Script to Rule Them All"
date: 2024-11-01
description: "How a single bash script installs K3s, Istio, monitoring stack, and turns any server into a production Kubernetes cluster. Windows and Linux support."
tags:
- PipeOps
- Kubernetes
- K3s
- Infrastructure
- DevOps
- Automation
---

We needed a way to turn any server into a PipeOps-managed host. Not just Kubernetes clusters - any machine. Fresh Ubuntu box? Old server gathering dust? AWS EC2 instance? Doesn't matter. One command, three minutes, done.

That's how the PipeOps agent installer was born.

## The Problem

Before the agent, using PipeOps meant you either:
1. Provisioned through us (AWS, GCP, Azure via Terraform)
2. Had an existing Kubernetes cluster we could talk to

But what about that Dell server under someone's desk? Or the Hetzner box running some legacy app? Or hell, even a Raspberry Pi?

People wanted to bring their own metal. We needed a way to make any Linux machine speak PipeOps.

## How It Works

**Linux/Mac:**
```bash
curl -fsSL https://get.pipeops.dev/k8-install.sh | bash
```

**Windows (PowerShell):**
```powershell
# Install dependencies first
choco install curl wget -y

# Set your token
$env:PIPEOPS_TOKEN = "your-token"

# Run installer
curl -fsSL https://get.pipeops.dev/k8-install.sh | bash
```

**Windows (WSL - recommended):**
```bash
curl -fsSL https://get.pipeops.dev/k8-install.sh | bash
```

That's it. One line. The script:

1. Detects your OS (Ubuntu, Debian, CentOS, Windows - we're not picky)
2. Installs k3s if you don't have Kubernetes
3. Downloads and configures the PipeOps agent
4. Registers with the control plane
5. Reports back "I'm ready, what's next?"

Three minutes later, your random server is now a first-class PipeOps deployment target.

## The Agent

Once installed, the agent is basically a lightweight Kubernetes controller that:

- Watches for deployment requests from the control plane
- Pulls container images
- Manages application lifecycles
- Reports metrics and logs back
- Handles secrets and configs

It's the bridge between our control plane and your infrastructure. Websocket connection, encrypted, minimal overhead.

## Why k3s?

We picked k3s over full Kubernetes because:

- Tiny footprint (512MB RAM minimum)
- Single binary install
- Works on ARM (Pi support for free)
- Battle-tested in production

If your server already has Kubernetes, cool - we'll use that. If not, k3s gets you 90% of Kubernetes with 10% of the complexity.

## Bring Your Own Server (BYOS)

This is what made [Nova](/2024/11/01/nova-multitenancy.html) possible. Our multi-tenant platform where you can either use PipeOps-managed infrastructure or your own.

The agent is how "your own" works. Point it at any server, run the installer, boom - that machine is now part of your Nova fleet.

No cloud account needed. No Terraform modules. No kubectl fu. Just hardware and the installer script.

## Security

The agent never exposes your Kubernetes API. Ever. It's a one-way connection:

- Agent initiates connection to control plane
- Uses websockets with TLS
- Token-based auth (rotate tokens anytime)
- No inbound ports needed (firewall friendly)

Your clusters stay isolated. We don't get API access. If the agent goes down, your apps keep running - they just stop getting updates until it reconnects.

## Real-World Usage

I've seen this thing installed on:

- Bare metal in colocation facilities
- Old laptops running Ubuntu
- ARM servers (Raspberry Pi clusters, believe it or not)
- Hetzner dedicated servers
- DigitalOcean droplets (why not?)
- Windows servers (both native and WSL)
- Even a NAS running in someone's closet

If it has 1GB RAM and can run containers, the agent will probably work.

## The Code

The installer is a bash script with way too many comments (my fault). We detect package managers, handle different init systems, and try not to break existing setups.

When something goes wrong, we log everything. Error messages include the fix. No "contact support" BS - just "here's what broke, here's how to fix it."

## What's Next

Working on:

- Auto-updates for the agent
- Better health checks
- Local dashboard (no internet? agent still works)

The goal is simple: if it has an IP address, PipeOps should be able to deploy to it.

## Try It

If you have a server laying around:

```bash
curl -fsSL https://get.pipeops.dev/k8-install.sh | bash
```

Three minutes later, deploy something to it from the PipeOps dashboard.

That's the magic - infrastructure should be this easy.

---

**Related Posts:**
- [Nova: Multi-Tenant Kubernetes Without the Complexity](/2024/11/01/nova-multitenancy.html) - How the agent enables BYOS for Nova
- [How PipeOps Actually Deploys Your Code](/2024/10/31/how-pipeops-deploys.html) - What happens after the agent is installed
- [The Runner: Terraform Multi-Cloud Provisioning](/2024/10/31/runner-terraform-provisioning.html) - Alternative cloud provisioning approach


