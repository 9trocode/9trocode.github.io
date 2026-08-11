---
layout: post
title: "Agent Terminal Sandboxes: Isolation That Isn’t “Trust the Model”"
date: 2026-08-11
description: "AI coding agents should not shell out on machines you care about. The isolation model I built into Rexec: disposable terminals, network isolation, and gVisor for headless agent work."
tags:
- Agents
- Security
- Sandboxes
- Rexec
- Open Source
- Platform Engineering
image: /assets/images/nitrocode-og.png
---

Most “AI coding agent” setups still do the dangerous thing by default: **run model-generated commands on a machine you care about**.

Laptop. Dev VM. Shared CI runner. Sometimes worse.

I hit this while building and testing CLIs and agents. The moment you let a model shell out - `npm install`, `curl | bash`, “fix the Dockerfile,” “explore the filesystem” - you’re no longer doing chat. You’re doing **untrusted remote code execution** with a friendly UI.

**TL;DR:** Treat agent execution as an isolation problem, not a prompt problem. Prefer disposable Linux terminals that are network-isolated, resource-capped, and sandboxed with **gVisor (`runsc`)**. Outbound-only BYOS access is a separate path when you need real hardware. That model is what I designed into [Rexec](https://github.com/PipeOpsHQ/Rexec).

Related background: [Rexec as a terminal control room](/blog/2026/02/27/rexec-terminal-control-room).

---

## The wrong default

Teams adopt agent tooling like this:

1. Install agent CLI on a developer machine or bastion.
2. Point it at a repo.
3. Grant shell / network / package install.
4. Hope system prompts and “approve tool use” are enough.

Hope is not a control.

Models are good at *sounding* careful and still doing something catastrophic:

- Writing secrets into world-readable files
- `rm -rf` with a creative path expansion
- Exfiltrating env vars over DNS or HTTPS
- Installing packages that phone home
- Touching production kubeconfigs sitting in `~/.kube`

Even without malice, agents are sloppy operators. They thrash package managers, leave half-broken state, and burn hours on “works in the agent’s world / broken in yours.”

If the blast radius is your primary workstation, every session is a production incident waiting for a bad completion.

---

## What “sandbox the agent” actually has to mean

A sandbox for interactive *humans* and a sandbox for *agents* share plumbing, but agents change the threat model:

| Concern | Human terminal | Agent terminal |
|---|---|---|
| Intent | Usually intentional | High volume, exploratory, error-prone |
| Speed | Seconds between commands | Bursts of tool calls |
| Oversight | Eyes on the glass | Often headless / API-driven |
| Network | User expects outbound | Agent *will* try outbound unless blocked |
| Lifecycle | Hours to days | Should be minutes, then deleted |

So the requirements I care about:

1. **Disposable by default** - create, run, destroy. No “that container from last Tuesday.”
2. **Hard resource bounds** - CPU, memory, PIDs; disk when the host can enforce it.
3. **Network isolation as a first-class switch** - not “we’ll add NetworkPolicy later.”
4. **API/headless entry** - agents shouldn’t need a human clicking xterm for every step.
5. **Auditability** - session recording / logs when you’re debugging “what did it do?”
6. **No inbound SSH theater** - prefer outbound tunnels when attaching real machines.

This is platform engineering, not vibes: terminals become **infrastructure primitives** with create/delete semantics, quotas, and a control plane.

---

## The isolation model (field pattern)

I implemented this as two primitives in Rexec. The pattern is portable even if you roll your own.

### Primitive 1: Cloud terminals as sandboxed containers

Each session is a Linux environment backed by Docker/Podman, with **gVisor** in the isolation path:

- Hard **CPU / memory / PID** limits
- Optional disk quotas when the host supports them
- **Dropped capabilities** + `no-new-privileges`
- Attachment to an isolated bridge (`rexec-isolated`) with **inter-container communication disabled**
- **OCI runtime `runsc` (gVisor)** so guest syscalls hit a user-space kernel, not the full host surface by default

Rexec wires this as a first-class isolation choice (`OCI_RUNTIME=runsc`), not a footnote. Don’t leave untrusted code on stock `runc` and call it a day. More product context: [Rexec control-room post](/blog/2026/02/27/rexec-terminal-control-room).

Conceptually:

```
Agent / CLI / UI
 │ (API or WebSocket)
 ▼
 Control plane ──create/exec/delete──► Container runtime
 │
 ├─ cgroup limits
 ├─ dropped caps
 ├─ isolated network bridge
 └─ gVisor (runsc) application kernel
```

The important product decision: **the environment outlives a single WebSocket flap, but not your interest in it.** Interactive UX can reattach via `tmux`/`exec`; the *security* unit is still “this sandbox, this network, these limits, this runtime.”

### Primitive 2: BYOS agents (outbound only)

Sometimes the agent needs *your* GPU box or a lab server - not a fresh Ubuntu container.

The pattern I use: an agent process on the machine opens an **outbound WebSocket** to the control plane. No inbound SSH, no “open 22 to the world,” no VPN spaghetti for a demo.

Tradeoff, said plainly:

- **Cloud container:** strong isolation, weak access to “my weird hardware”
- **BYOS:** strong access to real iron, weaker isolation (it’s still that machine)

Don’t pretend BYOS is a jail. It’s **mediated access** with auth, session control, and audit - not a microVM escape boundary.

For untrusted agent code, prefer the container primitive. Use BYOS when the job *requires* the metal, and treat permissions like production access.

---

## Agent-shaped usage (not marketing)

Once terminals are API-managed, agents stop needing to live on laptops.

Typical flow:

1. Create a sandbox (image + resource class + network mode).
2. Inject only the secrets that job needs (short-lived tokens, not your whole `.env`).
3. Run the agent headlessly against that sandbox.
4. Stream logs / attach if a human must intervene.
5. **Delete** the sandbox. Assume disk and memory are gone.

Self-host sketch (from the public Rexec path):

```bash
git clone https://github.com/PipeOpsHQ/Rexec.git
cd Rexec/docker
docker compose up --build
# UI/API on localhost:8080 - change default admin credentials immediately
```

Docs and deeper product context: [rexec.sh/docs](https://rexec.sh/docs) · [source](https://github.com/PipeOpsHQ/Rexec)

I’m not going to pretend “one compose file” is a complete multi-tenant security program. It’s the right *unit of isolation* to build on.

---

## Design choices that matter (and failure modes)

### Isolation is layered, not absolute

**gVisor** is real isolation: a smaller host-kernel attack surface than plain runc. It is still **not** a full hypervisor boundary.

Ladder we actually use:

1. **cgroup + caps + network isolate** - baseline hygiene 
2. **gVisor (`runsc`)** - default stronger sandbox for Rexec cloud terminals
3. **MicroVMs (Firecracker et al.)** - next step when the threat model demands it ([firecracker-shim](https://github.com/PipeOpsHQ/firecracker-shim)-shaped work)
4. **Dedicated nodes / accounts** - compliance and economics, not cosplay

**Pitfall:** marketing “secure sandboxes” while sharing a Docker socket with the world - or advertising gVisor while still spawning on runc. If the control plane can spawn privileged containers, you’ve moved the castle gate, not closed it.

### Network policy is part of the product

Default-deny between sandboxes should be boring and on.

Decide explicitly:

- Full outbound for package installs?
- Egress allowlists for registries only?
- No egress, vendored dependencies only?

Agents without egress are safer and more annoying. Agents with open egress are convenient and leaky. Pick per workload; don’t leave the default implicit.

### Identity beats “shared admin shell”

Multi-user demos that all land in the same `root@box` teach the wrong lesson.

Sessions need:

- Authenticated users (or service accounts)
- Short-lived credentials for the sandbox
- Audit logs that answer “who/what/when”

### Cost and chaos engineering for agents

Agents thrash. They’ll create five environments, install three toolchains, and OOM the host if you let them.

Quotas, concurrency caps, and aggressive TTLs aren’t “enterprise features.” They’re how you keep a sandbox fleet from becoming an expensive fork bomb with a language model at the wheel.

---

## What this advances (the reusable idea)

The field doesn’t need another chat UI. It needs a default execution substrate for untrusted automation:

> **Ephemeral compute + gVisor-class runtime + explicit network policy + API lifecycle + audit**, aimed at *tool-using agents*, not just humans.

Rexec is one implementation of that idea. The pattern still holds if you wire it with Kubernetes Jobs, RuntimeClass, Firecracker, or a cloud sandbox API, as long as you don’t run the agent as `local shell == trusted`.

I built Rexec because I needed real multi-machine CLI testing, then watched agent workflows force the security model into the open. The architecture (gVisor sandboxes, outbound BYOS agents, WebSocket terminal sessions, disposable lifecycle) is the part worth copying, not the brand name.

---

## Practical checklist

If you’re wiring agents into your company this quarter:

1. **Ban “agent has shell on my laptop”** for anything that can touch secrets or prod.
2. **Create/delete sandboxes per task** (or per PR), not per quarter.
3. **Run agent sandboxes on gVisor (`runsc`)** - or stronger - not stock runc “because Docker default.”
4. **Set egress policy deliberately**; log outbound destinations if you can.
5. **Cap CPU/memory/PIDs**; kill zombies on a timer.
6. **Record sessions** for high-risk automation until you trust the loop.
7. **Prefer outbound agents** over inbound SSH when attaching real machines.
8. **Assume breakout is possible**; escalate to microVMs or dedicated nodes when the threat model says so.

---

## Summary

Agent sandboxes fail when teams treat them as a prompt-engineering problem. They’re an isolation and lifecycle problem.

Disposable, network-isolated, **gVisor-backed** terminals with hard limits and API-driven create/delete are a better default than trusting the model on a precious machine. That’s the model I designed into Rexec. Take the pattern even if you never run our compose file.
