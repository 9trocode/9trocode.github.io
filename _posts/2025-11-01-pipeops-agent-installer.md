---
layout: post
date: 2025-11-01
tags:
- PipeOps
- Kubernetes
- Infrastructure
---

# The PipeOps Agent: One Bash Script to Rule Them All

We needed a way to turn any server into a PipeOps-managed host. Not just Kubernetes clusters - any machine. Fresh Ubuntu box? Old server gathering dust? AWS EC2 instance? Doesn't matter. One command, three minutes, done.

That's how the PipeOps agent installer was born.

## The Problem

Before the agent, using PipeOps meant you either:
1. Provisioned through us (AWS, GCP, Azure via Terraform)
2. Had an existing Kubernetes cluster we could talk to

But what about that Dell server under someone's desk? Or the Hetzner box running some legacy app? Or hell, even a Raspberry Pi?

People wanted to bring their own metal. We needed a way to make any Linux machine speak PipeOps.

## How It Works

```bash
curl -fsSL https://get.pipeops.dev/k8-install.sh | bash
```

That's it. One line. The script:

1. Detects your OS (Ubuntu, Debian, CentOS - we're not picky)
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

This is what made Nova possible. Remember Nova? Our multi-tenant platform where you can either use PipeOps-managed infrastructure or your own?

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
- Even a NAS running in someone's closet

If it runs Linux and has 1GB RAM, the agent will probably work.

## The Code

The installer is a bash script with way too many comments (my fault). We detect package managers, handle different init systems, and try not to break existing setups.

When something goes wrong, we log everything. Error messages include the fix. No "contact support" BS - just "here's what broke, here's how to fix it."

## What's Next

Working on:

- Windows support (yes, really)
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


