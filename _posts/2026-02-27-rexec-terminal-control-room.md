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

**Positioning:** Rexec turns terminals into infrastructure primitives.

Terminals become API-managed sandboxes you can create, connect to (WebSocket), run commands in, share, record, lock down, and delete — with guardrails.

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

- **Compute**: Docker/Podman containers with hard CPU/memory/PID limits (and optional disk quotas when the host supports it).
- **Isolation**: terminals attach to an isolated bridge network with inter-container communication disabled (`rexec-isolated`) and hardened container settings (dropped capabilities + `no-new-privileges`).
- **Terminal UX**: WebSocket streaming to xterm.js, with `tmux` inside the container for reconnect + scrollback.
- **BYOS**: agents connect outbound over WebSockets (no inbound SSH ports).
- **State**: PostgreSQL for users/sessions/audit logs; optional S3 for session recordings.

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

One implementation detail that matters: cloud terminals are kept alive (the container runs indefinitely), and interactive sessions attach via `exec` into a `tmux` session. That’s what makes disconnect/reconnect cheap.

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
import asyncio
from rexec import RexecClient

async def main():
    async with RexecClient("https://rexec.sh", "YOUR_API_TOKEN") as client:
        container = await client.containers.create(image="ubuntu:24.04", name="sdk-demo")
        async with client.terminal.connect(container.id) as term:
            await term.write(b"echo 'Hello from Rexec!'\n")
            out = await term.read()
            print(out.decode())

asyncio.run(main())
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

---

## Security: What’s Actually Enforced

Rexec runs arbitrary shell sessions. So security isn’t a paragraph — it’s the product.

Here’s what the open-source stack enforces for **Linux terminals** today (and what you can tune when self-hosting).

### Container boundaries

- **No privileged containers** (Linux terminals run with `Privileged: false`) plus `SecurityOpt: no-new-privileges:true`
- **Capabilities**: `CapDrop: ALL`, then add back a small allowlist (including `NET_BIND_SERVICE` for low ports, and `SYS_PTRACE` for debugging/TUI tools)
- **Default seccomp** profile (not `unconfined`)
- **Host info masking** via masked `/proc` + read-only `/proc/sys*` paths

### Network isolation model

- Terminals attach to a dedicated bridge network: `rexec-isolated`
- Inter-container communication is disabled (`com.docker.network.bridge.enable_icc=false`)

This doesn’t mean “no internet”. It means “don’t let user sandboxes talk to each other by default.”

### Resource + abuse controls

- **Hard memory limit** with swap disabled (`MemorySwap == Memory`)
- **CPU quota** limiting (`CPUPeriod`/`CPUQuota`)
- **PIDs limit** (fork-bomb brake)
- **Optional disk quotas** when the host supports it (overlay2 quotas, typically XFS/ext4)
- **Rate limiting** at multiple layers (nginx at the edge + application middleware)

### Auth + audit trail

- JWT auth + MFA support, plus hardened account options like **single-session mode** and **IP allowlists**
- Sensitive stored values are protected (API tokens are stored **hashed**, and secrets like MFA/SSH material are **encrypted at rest**)
- Audit logs stored in Postgres (action, IP, user-agent, JSON details)
- Session recording (optional S3 backend) for replay/auditing

### Caveats (the honest part)

- The root filesystem is currently **writable** to support role/tool installation. If you need a stricter boundary, run with gVisor/Kata (`OCI_RUNTIME=runsc` or `OCI_RUNTIME=kata`) or isolate at the host level.
- `/tmp` is mounted `exec` in the default profile to support some terminal tooling. Tighten it if you don’t need that.

There’s also ongoing work in the repo to support **Firecracker microVM terminals** for a stronger isolation boundary than containers.

---

## Differentiation: Compared to the Usual Suspects

If you’re evaluating Rexec, you’re probably comparing it to one of these:

| Compared to | The line in the sand |
| --- | --- |
| GitHub Codespaces / Gitpod | Great repo-first IDE workspaces. Rexec is terminal-first: disposable sandboxes + BYOS agents + embed widget + SDKs. |
| Cloud Shell | Usually cloud-vendor specific and tied to their control plane. Rexec is neutral and self-hostable. |
| wetty / ttyd / “web SSH” | Mostly a UI on top of *one* machine. Rexec adds disposable sandboxes, guardrails, collaboration/recording, and an automation surface (CLI/SDK). |
| SSH jumpboxes | You can DIY, but then you’re building auth, auditing, sharing, recordings, and access workflows yourself. Rexec packages the “terminal control room” layer. |

If you want a full VS Code-in-the-browser experience, use Codespaces/Gitpod. If you want governed terminals as a primitive (sandboxes + BYOS + embed + API), that’s the lane Rexec is in.

---

## Performance & Scaling (The Boring Parts)

- **Startup** is “create container + start container”. For faster boots, you can prebuild `rexec-*` images (`./scripts/build-images.sh`) so basics (like SSH) are already there.
- **Reconnect** is fast because the session is `tmux`-backed, and the terminal attaches via `exec`. Scrollback is configured to be large (tmux history is set to 50,000 lines).
- **Fairness** is enforced with hard CPU/memory/PID limits, plus per-tier container/agent limits.
- **Abuse prevention** exists at multiple layers (edge + app). If you run a public instance, this matters.
- **Stronger sandboxes** are a deployment choice: set `OCI_RUNTIME=runsc` (gVisor) or `OCI_RUNTIME=kata` (Kata Containers) when you self-host.
- At “real usage” scale (dozens → hundreds of concurrent terminals), this becomes capacity planning: per-terminal caps, container-host sizing, and a load balancer that handles long-lived WebSockets properly.

---

## What It Looks Like in Practice

### Scenario: release engineering across distros

You’re shipping a CLI. You want confidence it works on real environments, not just CI containers.

1. Create terminals across a few base images:

```bash
rexec create --name cli-ubuntu --image ubuntu:24.04
rexec create --name cli-debian --image debian:12
rexec create --name cli-alpine --image alpine:3.21
```

2. Download the binary, run the same smoke test on all three.
3. Share one session (view/control) when something breaks, and record it if you need a replayable artifact.

### Scenario: SRE debugging without SSH key chaos

1. Install the agent on the box (outbound connection, no inbound SSH ports).
2. Connect from the dashboard, share the session for pair debugging, and keep an audit trail with session recording.

### Scenario: education + DevRel that actually runs

Embed a terminal in docs/tutorials, hand out share codes, and let people run commands where they’re learning — without a “works on my machine” setup tax.

### Scenario: agents that execute in a sandbox

If you’re using AI coding tools, the safest workflow is “generate → run → test” in a disposable environment:

1. Create a fresh terminal (or one per task).
2. Run the agent (e.g., `opencode`, `aider`) inside the sandbox.
3. Run tests in isolation.
4. Delete the terminal when you’re done.

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
2. **Know the trust model.** A sandbox reduces blast radius; it doesn’t make malware “safe”. Don’t drop production secrets into random terminals.
3. **Network isolation is about east/west by default.** If you need strict egress controls, enforce them at the host/network layer.
4. **Agents need outbound WebSockets.** Some corporate networks break this; plan accordingly.
5. **Self-hosting defaults are for dev.** Change default credentials, set `JWT_SECRET`, and put it behind TLS.

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
```

If you’d rather not run an install script, build from source:

```bash
git clone https://github.com/PipeOpsHQ/rexec
cd rexec
go build -o rexec ./cmd/rexec-cli
sudo mv rexec /usr/local/bin/rexec
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
```

Rexec’s container manager talks to a Docker/Podman daemon. In the stock `docker/docker-compose.yml`, the API container connects to a **remote Docker host over TLS** (no `docker.sock` mount), so you must provide `DOCKER_HOST` + certs.

Create `rexec/docker/.env`:

```bash
DOCKER_HOST=tcp://YOUR_DOCKER_HOST:2376
DOCKER_TLS_VERIFY=1
DOCKER_CA_CERT="(contents of ca.pem)"
DOCKER_CLIENT_CERT="(contents of cert.pem)"
DOCKER_CLIENT_KEY="(contents of key.pem)"
JWT_SECRET="change-me"
POSTGRES_PASSWORD="change-me"
```

Then start the stack:

```bash
docker compose up -d --build
```

Open `http://localhost:8080` and change defaults immediately. For the full remote-Docker deployment model (and why it’s the recommended production shape), see: https://github.com/PipeOpsHQ/rexec/blob/main/docs/DEPLOY_STANDALONE.md

For stricter isolation when self-hosting, configure a hardened runtime (gVisor/Kata) on your container host, then set `OCI_RUNTIME` for the `rexec` service (example):

```yaml
# docker/docker-compose.yml
environment:
  - OCI_RUNTIME=runsc
```

---

## Summary

Rexec turns terminals into infrastructure primitives. It started as a way to test a CLI on real machines. It became a terminal control room: disposable cloud terminals, a BYOS agent, an embed widget for docs, SDKs for automation, and a safer sandbox for agents.

If that sounds like your workflow, start with the docs: https://rexec.sh/docs
