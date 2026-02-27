---
layout: post
title: "Rexec: The Terminal Control Room I Built to Test a CLI"
date: 2026-02-27
description: "How Rexec grew from a CLI test tool into a terminal control room: disposable cloud terminals, BYOS agents, an embed widget, and agent sandboxes."
tags:
- Terminals
- Open Source
- DevOps
- SRE
- Agents
- Security
image: /assets/images/nitrocode-og.png
---

I built **rexec** because I was tired of *pretending* my CLI worked everywhere.

I needed real-world testing across different machines and architectures — not just “works on my laptop” and not just CI logs. The quickest thing that could give me that was: **a disposable terminal I can spin up anywhere, run the binary, and throw away**.

That small tool turned into something bigger: a terminal control room for cloud sandboxes *and* your own machines.

**TL;DR:** Rexec is a Terminal-as-a-Service platform: create network-isolated cloud terminals (Docker-backed), connect your own machines with an outbound agent, share sessions, record sessions, and integrate via CLI/SDKs or an embed widget.

---

## The Origin Story (And the Accidental Product)

Rexec started off as a small tool I needed to test our CLI and agent binary on different machine types with real-world usage.

Then the scope creep hit:

1. **CLI testing across machines**: “Does this binary behave the same on Ubuntu vs Alpine? AMD64 vs ARM64? Fresh box vs crusty box?”
2. **Cloud shell**: once you can spin terminals up quickly, it’s basically a cloud shell. So we built a proper terminal UX around it.
3. **Widget mode**: then we added an embeddable widget, because the terminal shouldn’t live only inside the dashboard.
4. **Students + low-spec laptops**: a hosted terminal with a curated toolchain is a cheat code for learning when your laptop is underpowered (or you don’t have one).
5. **Agent sandboxes**: once I installed `opencode` in a terminal and started running AI-generated code in there, it clicked — this is a safer default for agents and automation.
6. **Shared expensive machines**: teams can connect a single beefy box (yes, including a GPU machine) and manage access without turning SSH keys into a company-wide group chat.

Rexec is now a multipurpose tool. We use it for all of the above. And it’s open source.

---

## What Rexec Actually Is

Rexec has two primitives:

1. **Cloud terminals**: disposable Linux environments running as isolated containers.
2. **BYOS agents**: connect your own server/laptop/Raspberry Pi into the same dashboard via an outbound WebSocket tunnel.

Everything else (CLI, SDKs, widget, collaboration, recording) is built around making those two primitives usable in real workflows.

Canonical links:
- Docs: https://rexec.sh/docs
- Resources/tutorials: https://rexec.sh/resources
- Source: https://github.com/PipeOpsHQ/rexec

---

## How We Built It (High-Level Architecture)

Rexec is intentionally boring infrastructure:

- **Terminals are Docker containers** (network-isolated, disposable).
- **Terminal I/O streams over WebSockets** (low latency, real-time).
- **Agents connect outbound** (no inbound firewall rules, no exposed SSH port).
- **State lives in PostgreSQL**, and recordings can go to **S3** (or an S3-compatible store).

From the OSS README, the architecture looks like this:

```
[Browser UI] ←(WebSocket)→ [Rexec API] ←→ [PostgreSQL]
                                │
                                ├── [Container Manager] ──→ [Docker Engine]
                                │
                                └── [Agent Handler] ←(WebSocket)→ [Remote Agents]
```

Implementation stack (also from the repo):

- **Frontend**: Svelte + xterm.js + Tailwind CSS
- **Backend**: Go (Gin) + Gorilla WebSocket
- **Runtime**: Docker Engine
- **DB**: PostgreSQL

The design goal is simple: a terminal that feels native, but is disposable by default.

---

## What It Can Do (Without the Marketing)

### 1) Disposable, network-isolated Linux terminals

Spin up a new terminal, test something risky, then delete it. You can choose from common images (Ubuntu/Debian/Alpine/Fedora/Arch/Kali, etc) depending on the workflow.

This is the feature that makes everything else possible: once environments are cheap, you stop doing dangerous things on your laptop.

### 2) A real terminal UX (not a toy web console)

Rexec streams a proper terminal session (xterm.js) over WebSockets, with session persistence and collaboration.

The “instant access” trick is that you can start typing while the environment finishes provisioning in the background — no staring at progress bars.

### 3) Bring-your-own-server access (BYOS agent)

If you already have machines you care about (prod boxes, staging, a GPU workstation, a lab server), you can connect them to Rexec via an outbound agent. The machine shows up like a terminal you can click into.

Key point: you’re not opening inbound SSH or building VPN spaghetti.

### 4) Collaboration + session recording

Two features that matter when you’re doing real ops work:

- **Share a session** (view/control) for pair debugging or teaching.
- **Record a session** and replay it for documentation, auditing, or incident reviews.

### 5) CLI + TUI (power-user mode)

The `rexec` CLI lets you create/list/connect to terminals, manage snippets/macros, and register agents.

Some quick examples:

```bash
rexec login
rexec ls
rexec create --name mydev --image ubuntu:24.04
rexec connect <terminal-id>
rexec -i
```

It also supports shell completion and SSH integration patterns (ProxyCommand) if you’re the type of person that lives in `~/.ssh/config`.

### 6) SDKs + API for automation and agents

Rexec exposes a REST API (and WebSockets for terminals). On top of that, there are official SDKs in multiple languages (Go, JS/TS, Python, Rust, Ruby, Java, .NET, PHP).

Example (Python-style SDK usage):

```python
from rexec import RexecClient

async with RexecClient("https://rexec.sh", "YOUR_API_TOKEN") as client:
    container = await client.containers.create(image="ubuntu:24.04")
    result = await client.containers.exec(container.id, "echo Hello from Rexec!")
    print(result.stdout)
```

### 7) Embeddable terminal widget

This is the “cloud shell inside your docs” feature.

You add a script tag, create a div, then embed a session using either:

- a **share code** (guest access), or
- an **API token** (authenticated)

Minimal embed example:

```html
<script src="https://rexec.sh/embed/rexec.min.js"></script>

<div id="terminal" style="width: 100%; height: 400px;"></div>

<script>
  const term = Rexec.embed('#terminal', {
    shareCode: 'YOUR_SHARE_CODE'
  });
</script>
```

Token mode (create a new terminal from your site) looks like this:

```html
<script>
  const term = Rexec.embed('#terminal', {
    token: 'YOUR_API_TOKEN',
    image: 'ubuntu',
    role: 'python'
  });
</script>
```

This is why I think Rexec is useful for education and DevRel: you can turn “run this command” into “run it here”.

### 8) Security building blocks

Security claims are cheap. The useful bit is what’s actually enforced:

- **Container isolation** with dedicated networking per terminal
- **JWT auth** + **MFA (TOTP)** support
- **`no-new-privileges`** style hardening to reduce container escape impact
- **Encrypted-at-rest storage** for sensitive data (tokens, SSH keys)
- **Session timeouts** and cleanup for abandoned terminals

---

## Who Needs This (Realistically)

Rexec isn’t for everyone. If you already have perfect laptops, perfect networks, and perfect discipline, you can stop reading.

If you don’t, here’s who it’s built for:

- **CLI authors and release engineers** who need to validate binaries on real machines/arches without collecting laptops like Pokémon.
- **SRE/DevOps teams** who want disposable jump boxes and a safer way to reach machines without SSH key chaos.
- **Students and bootcamps** who need a real environment without a high-spec laptop.
- **DevRel + docs teams** who want runnable tutorials via the embed widget (or pre-configured roles).
- **AI/agent builders** who need a sandbox to run generated code, execute tests, and share sessions for review.
- **Teams with shared expensive hardware** (including GPUs): connect the box once, manage access centrally, and avoid “who has the SSH key?” as your access-control strategy.

---

## Pitfalls (Read This Before You Paste Tokens Into Anything)

1. **Treat API tokens like passwords.** They give account-level access.
2. **Network isolation isn’t magic.** It’s a safer execution environment, not a license to run malware.
3. **Agents need outbound WebSockets.** Some corporate networks break this; plan accordingly.
4. **Self-hosting defaults are for dev.** If you run the OSS stack, change default credentials and set `JWT_SECRET`.

---

## Try It (Quick, Practical)

### Cloud terminal (hosted)

1. Open https://rexec.sh and create a terminal.
2. Run something you normally don’t want on your laptop (build scripts, installer experiments, etc).
3. Share the session if you need help debugging.

### Install the CLI (optional, but you’ll end up here)

1. Install `rexec`:

```bash
# Linux/macOS install script
curl -fsSL https://rexec.sh/install-cli.sh | bash

# macOS via Homebrew
brew install rexec/tap/rexec

# or build/install via Go
go install github.com/rexec/rexec/cmd/rexec-cli@latest
```

2. Log in and create a terminal:

```bash
rexec login
rexec create --name mydev --image ubuntu:24.04
rexec connect <terminal-id>
```

### Connect your own machine (agent)

1. Generate an agent install command from the dashboard (**Settings → Agents**).
2. Run the installer on your server:

```bash
curl -fsSL https://rexec.sh/install-agent.sh | sudo bash -s -- --token YOUR_TOKEN
```

3. Your machine should appear as a terminal card.

### Self-host (open source)

If you want full control, self-host:

```bash
git clone https://github.com/PipeOpsHQ/rexec
cd rexec/docker
docker compose up --build
```

Then open `http://localhost:8080` and change the default creds immediately.

---

## Summary

Rexec started as a way to test a CLI on real machines. It became a terminal control room: disposable cloud terminals, a BYOS agent, an embed widget for docs, SDKs for automation, and a safer sandbox for agents.

If that sounds like your workflow, start with the docs: https://rexec.sh/docs
