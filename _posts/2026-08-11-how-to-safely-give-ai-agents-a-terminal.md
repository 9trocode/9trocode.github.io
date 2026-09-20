---
layout: post
title: "How to Safely Give AI Agents a Terminal"
date: 2026-08-11
description: >-
  Giving an agent a shell is useful. Giving it your machine is not. Isolation,
  lifecycle, network control, and resource limits for disposable Linux
  terminals - lessons from building Rexec.
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

AI coding agents that execute commands are common. Most setups still hand them **unrestricted shell access** on a laptop, bastion, or shared runner - then call system prompts and “approve tool use” a control plane.

That’s the wrong default.

**TL;DR:** Reframe agent execution as an **isolation and lifecycle** problem. Walk four controls - isolation, lifecycle, network, resource limits - the same ones I shipped in [Rexec](https://github.com/PipeOpsHQ/Rexec): disposable network-isolated Linux terminals in the cloud, or outbound-only access to your own machines.

Related: [Rexec as a terminal control room](/blog/2026/02/27/rexec-terminal-control-room) · [SysConf 2026 talk](/talks/sysconf-2026/)

---

## The problem

Useful agents shell out - `npm install`, `curl | bash`, “fix the Dockerfile,” “explore the filesystem.” You’re not doing chat anymore. You’re doing **untrusted remote code execution** with a friendly UI.

What people actually do:

1. Install Cursor / Claude Code / some agent CLI on a machine they care about
2. Point it at a real repo
3. Leave network and package install on
4. Hope prompts and approval dialogs hold

Hope is not a control.

What breaks without a jailbreak story:

- Secrets written to world-readable files
- `rm -rf` with a creative path expansion
- Env vars leaving over HTTPS *or* DNS
- Packages that phone home
- Production kubeconfigs sitting in `~/.kube`
- Thrash: three package managers, half-broken state, “works in the agent’s world”

Blast radius = that machine.

---

## Reframe: four controls

Not a prompting problem. Four technical controls:

| Control | Question |
|---|---|
| **Isolation** | What can it touch - host, peers, kernel surface? |
| **Lifecycle** | Create → run → delete. No leftover Tuesday containers. |
| **Network** | Egress and peer traffic chosen at create time. |
| **Limits** | Hard CPU / memory / PIDs - not vibes. |

That’s the product. Below is how I reason about each while building Rexec. You can copy the shape with Jobs + RuntimeClass + NetworkPolicy even if you never run our code.

---

## Isolation - how you reason about security

Agents and humans share plumbing; the threat model differs. Agents burst tool calls, explore, will try outbound, and should die in minutes - not live for days on a bastion.

Ladder I use:

1. **cgroup + caps + network** - baseline hygiene
2. **gVisor (`runsc`)** - smaller host syscall surface (default for Rexec cloud terminals)
3. **MicroVMs (Firecracker et al.)** - when the threat model demands it
4. **Dedicated nodes / accounts** - compliance budget, not cosplay

Stock containers share the host kernel. Name the rung you’re buying.

In Rexec each cloud session is Docker/Podman with:

- Hard CPU / memory / PID limits
- Dropped capabilities + `no-new-privileges`
- Isolated bridge (`rexec-isolated`) with ICC off
- OCI runtime `runsc` - not stock runc by default
- Attach via API / WebSocket - not published SSH into the sandbox

**Pitfall:** Docker socket in the “sandbox,” or gVisor in the README and runc in prod. You moved the gate; you didn’t close it.

---

## Resource limits - how you enforce them

Agents thrash. They’ll create five environments, install three toolchains, and OOM the host if you let them.

- Hard CPU / memory / PID caps on every sandbox
- Disk quotas when the host can enforce them
- Concurrency caps + aggressive TTLs

Limits are a **security control**, not just FinOps.

---

## Network - how you control access

A terminal with a shell is a network endpoint. Filesystem jail with open egress is still a phone-home machine.

Watch for:

- Peer-to-peer between sandboxes
- Host / cloud metadata
- Exfil over HTTPS
- Exfil over DNS
- “Just for the demo” published ports

Pick at create time: **none** · **allowlist** · **full** (you accepted the leak).

ICC off is not “no internet.” Say that in the design review.

---

## Lifecycle - the other half of isolation

1. **Create** - image, limits, network mode
2. **Inject secrets** - short-lived only
3. **Run** - headless by default
4. **Attach** - only if a human must intervene
5. **Delete** - assume disk and memory are gone

Long-lived “dev sandboxes” become bastions with worse accountability. **Delete** is the control people skip.

Self-host sketch:

```bash
git clone https://github.com/PipeOpsHQ/Rexec.git
cd Rexec/docker
docker compose up --build
# UI/API on localhost:8080 - change default admin credentials immediately
```

Docs: [rexec.sh/docs](https://rexec.sh/docs) · [source](https://github.com/PipeOpsHQ/Rexec)

---

## Two shapes: cloud terminal and BYOS

**Cloud terminal:** strong isolation, weak access to weird iron (GPU lab, that one box).

**BYOS:** process on the machine opens an **outbound WebSocket**. Real hardware. Mediated access - not a jail. No open 22 for the demo.

| Need | Prefer |
|---|---|
| Untrusted model code | Disposable terminal + gVisor |
| Real GPU / lab hardware | BYOS - treat like prod access |
| Shared expensive machine | BYOS + identity + recording |

Don’t confuse isolation with access.

---

## Failures I’ve shipped into

- **Docker socket in the sandbox** - relocated the gate
- **Full egress by default** - agents phone home; you can’t say which session left
- **No TTL / concurrency caps** - one thrash OOMs the host
- **Prompt as the boundary** - UX, not isolation
- **gVisor in the README, runc in prod** - runtime theater

---

## Steal this

1. No agent shell on laptops for secrets / prod paths
2. One sandbox per task (or per PR) - then delete
3. gVisor or stronger for untrusted agent code
4. Egress on purpose; treat DNS as data
5. Hard CPU / memory / PID + TTL
6. Outbound agents over inbound SSH for real boxes
7. Assume breakout; escalate the rung when the threat model says so

---

## Summary

Giving an agent a shell is useful. Giving it your machine is not.

Agents that execute commands force the security model into the open: **isolation, lifecycle, network control, resource limits**. I built those into Rexec because I needed them. Copy the pattern even if you never run our compose file - Jobs, RuntimeClass, Firecracker, or a cloud sandbox API - as long as `local shell == trusted` is off the table.

Talk: [How to Safely Give AI Agents a Terminal](/talks/sysconf-2026/) (SysConf 2026).

## Related writing

- [Rexec: The Terminal Control Room](/blog/2026/02/27/rexec-terminal-control-room)
- [Namespaces Aren't Isolation](/blog/2026/08/11/namespaces-arent-isolation)
- [firecracker-shim](https://github.com/PipeOpsHQ/firecracker-shim)
- [Work catalogue](/work/)
