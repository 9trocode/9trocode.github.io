---
layout: post
title: "How to Safely Give AI Agents a Terminal"
date: 2026-08-11
description: >-
  Giving an agent a shell is useful. Giving it your machine is not. How to
  reason about security, enforce limits, control network access, and build
  disposable terminals - lessons from Rexec.
tags:
- Agents
- Security
- Sandboxes
- Rexec
- Open Source
- Platform Engineering
- gVisor
image: /assets/images/nitrocode-og-v2.png
# Locked until SysConf (same speaker code as the talk deck).
unlock_after: 2026-10-03
speaker_key: sysconf-2026-rexec
sitemap: false
---

Giving an agent a shell is useful. Giving it your machine is not.

Agents that run commands are common. **Unrestricted shell access** on a laptop, bastion, or shared runner is still the default. System prompts and “approve tool use” are not a control plane.

The mistake is the blast radius - not the shell.

**TL;DR:** Isolation + lifecycle, not prompting. From building [Rexec](https://github.com/PipeOpsHQ/Rexec) I’ll answer four questions: how you reason about security, enforce resource limits, control network access, and build disposable terminals (cloud or your own machines).

Related: [Rexec control room](/blog/2026/02/27/rexec-terminal-control-room) · [SysConf 2026 talk](/talks/sysconf-2026/)

---

## Why the default fails

Useful agents shell out - `npm install`, `curl | bash`, “fix the Dockerfile,” “explore the filesystem.” You’re doing **untrusted remote code execution** with a friendly UI.

What breaks without a jailbreak:

- Secrets land on disk
- Creative `rm` / path expansion
- Env leaves over HTTPS or DNS
- Packages phone home
- `~/.kube` and other prod creds sit next to the agent

Models thrash. Hope is not a control.

---

## What this answers

Same questions the SysConf editors called out - and what I actually had to solve in Rexec:

1. How do you **reason about security**?
2. How do you **enforce resource limits** for disposable terminals?
3. How do you **control network access**?
4. How do you **build** a tool like that?

---

## How you reason about security (and enforce limits)

**Isolation ladder** I use:

1. **cgroup + caps + network** - baseline
2. **gVisor (`runsc`)** - smaller host syscall surface (my default for agent sandboxes)
3. **Firecracker / microVM** - when the threat model demands it
4. **Dedicated node / account** - real budget, not cosplay

Stock containers share the host kernel. Name the rung you’re buying.

**Resource limits** on every sandbox:

- Hard CPU / memory / PIDs
- Disk quotas when the host can enforce them
- Concurrency caps + TTL - thrashing agents are a DoS on yourself

Limits are a **security control**, not just FinOps.

---

## How you control network access (and lifecycle)

A shell is a network endpoint. Watch for peer traffic, host/cloud metadata, HTTPS exfil, DNS exfil, and “just for the demo” published ports.

Pick at create time: **none** · **allowlist** · **full** (you accepted the leak). ICC off is not “no internet.”

**Lifecycle** is the other half:

1. Create - image, limits, network mode  
2. Inject secrets - short-lived only  
3. Run - headless by default  
4. Attach - only if a human must intervene  
5. **Delete** - assume disk and memory are gone  

Long-lived “dev sandboxes” become bastions with worse accountability. Delete is the control people skip.

---

## How you build something like Rexec

Two shapes:

| Shape | What it is |
|---|---|
| **Cloud terminal** | Disposable Linux. Caps, ICC off, `runsc`. Attach via API/WebSocket - not published SSH. |
| **BYOS** | Outbound WebSocket from your machine. Real GPU/lab. Mediated access - not a jail. No open 22 for the demo. |

Steal the shape with Jobs + RuntimeClass + NetworkPolicy if you never run our code.

Self-host sketch:

```bash
git clone https://github.com/PipeOpsHQ/Rexec.git
cd Rexec/docker
docker compose up --build
# UI/API on localhost:8080 - change default admin credentials immediately
```

Docs: [rexec.sh/docs](https://rexec.sh/docs) · [source](https://github.com/PipeOpsHQ/Rexec)

**Failures I’ve hit:** Docker socket in the sandbox (moved the gate), full egress by default, no TTL/concurrency caps, prompt as the boundary, gVisor in the README and runc in prod.

---

## Steal this

1. No agent shell on laptops for secrets / prod  
2. One sandbox per task - then delete  
3. gVisor or stronger for untrusted agent code  
4. Egress on purpose; treat DNS as data  
5. Hard caps + TTL; outbound over inbound SSH for real boxes  

Giving an agent a shell is useful. Giving it your machine is not.

Talk: [How to Safely Give AI Agents a Terminal](/talks/sysconf-2026/) (SysConf 2026).

## Related writing

- [Rexec: The Terminal Control Room](/blog/2026/02/27/rexec-terminal-control-room)
- [Namespaces Aren't Isolation](/blog/2026/08/11/namespaces-arent-isolation)
- [firecracker-shim](https://github.com/PipeOpsHQ/firecracker-shim)
- [Work catalogue](/work/)
