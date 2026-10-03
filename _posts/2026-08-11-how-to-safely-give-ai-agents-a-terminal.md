---
layout: post
title: "Rexec: How to Safely Give AI Agents a Terminal"
date: 2026-08-11
description: >-
  How to safely give AI agents a terminal using Rexec. They still get a
  terminal - a disposable sandbox, not your workstation. Isolation, limits,
  network, lifecycle.
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

**How to safely give AI agents a terminal - using Rexec.**

Agents still get a terminal. It just shouldn’t be your workstation.

They need to run commands - that’s the product. The shortcut everyone takes is running those commands *as you* on a laptop, bastion, or shared runner, held together by system prompts and “approve tool use.”

This is **not** “harden your personal shell for AI.”

It’s **give the agent its own disposable terminal** - isolated, capped, networked on purpose, then deleted. That’s what **Rexec** is for (cloud sandboxes or BYOS).

**TL;DR:** Isolation + lifecycle. How Rexec reasons about security, enforces limits, controls network access, what the pieces are, and what happens when you send a request. The checklist still applies if you wire your own stack.

Talk deck: [Rexec: How to Safely Give AI Agents a Terminal](/talks/sysconf-2026/) (SysConf 2026)

---

## Goals - what this talk covers

How to safely give AI agents a terminal **using Rexec** - and the controls that still matter if you wire your own stack:

1. **The problem** - agent exec on your workstation, not a sandbox terminal  
2. **Security & limits** - what walls that terminal gets; CPU / memory / TTL  
3. **Reach & disposal** - what the terminal can talk to, and when it dies  
4. **Rexec build** - components, then request dataflow  
5. **Practice** - create → prove → delete  

Rexec is the through-line. The controls travel without it.

---

## Content - the problem

Useful agents shell out. You’re doing untrusted remote code execution with a friendly UI.

What breaks without a jailbreak:

- Secrets land on disk  
- Creative `rm` / path expansion  
- Env leaves over HTTPS or DNS  
- Packages phone home  
- `~/.kube` and other prod creds sit next to the agent  

Models thrash. Hope is not a control.

Give the agent its own disposable terminal. That’s what Rexec is for.

Disposable terminal. Now make the walls real.

---

## Content - what walls does that terminal get?

Before Docker I ran **Proxmox at home** - one VM per agent. Heat, maxed box, nowhere to scale. That dead end is why Rexec exists.

Two approaches when I built it: **shared host** with runtime + kernel protection, or **VM / node per agent** when the threat model pays for a harder boundary. A delete button is not a boundary - pick a path, then a rung, then hard-cap it.

**Isolation ladder**

1. cgroup + caps + network - baseline on any shared host  
2. **gVisor** (`runsc` = its OCI runtime; user-space kernel between container and host) - shared-host default  
3. Firecracker / microVM - when one sandbox must not share fate with the next  
4. Dedicated node / account - real budget, not cosplay  

Default Docker (`runc`) shares the host kernel - say so if that’s all you’re using.

**Limits:** hard CPU / memory / PIDs; concurrency + **TTL** (kill on a timer) on *both* paths. Thrash is a DoS on yourself. Limits = security, not just FinOps.

**Trade-off in Rexec:** Proxmox taught density. Needed density on shared hosts, including hosts without KVM → gVisor default. Pay syscall/compat tax. Escalate to Firecracker / a node when the threat model says so.

---

## Content - what the terminal can reach, and when it dies

Shared host or VM-per-agent - neither is safe if the shell can phone home forever.

**Network:** a shell is a network endpoint. Pick at create: **none** · **allowlist** · **full** (you accepted the leak). **ICC** (inter-container communication on a Docker bridge) off only stops sandbox-to-sandbox on that bridge - not “no internet.”

**Lifecycle:** create → short-lived secrets → run → attach if needed → **delete**. Long-lived sandboxes become bastions with worse accountability (Proxmox pets included).

---

## Content - Rexec pieces (one line each)

| Piece | Job |
|---|---|
| **Browser / CLI** | Where humans and agents attach (xterm.js, API clients). |
| **Rexec API** | Auth, policy, create / exec / delete, WebSocket sessions. |
| **PostgreSQL** | Users, agents, session metadata. |
| **Container Manager** | Talks to Docker for disposable cloud sandboxes (limits, network, runtime). |
| **Docker Engine** | Where cloud sandboxes actually run. |
| **Agent Handler** | Relays sessions to machines you connect. |
| **BYOS agent** | Outbound WebSocket from your laptop/server; no inbound SSH. |

**BYOS** = bring your own server. Mediated access, not a jail.

---

## Content - what happens when you send a request

```text
Input (create / exec)
        │
        ▼
   Rexec API  ──persist──►  PostgreSQL
        │
        ├── Container Manager ──► Docker Engine   (cloud sandbox)
        └── Agent Handler ──outbound WS──► BYOS agent
        │
        ▼
Output stream ──► UI / agent
```

One request in. Routed. Persisted. Executed. Streamed back.

Self-host sketch:

```bash
git clone https://github.com/PipeOpsHQ/Rexec.git
cd Rexec/docker
docker compose up --build
# UI/API on localhost:8080 - change default admin credentials immediately
```

Docs: [rexec.sh/docs](https://rexec.sh/docs)

**Failures I’ve hit:** Docker socket in the sandbox; full egress by default; no TTL/concurrency; prompt as the boundary; gVisor in the README and runc in prod.

---

## Conclusion

**Build the agent a terminal. Don’t share the one you live in.**

1. Secrets and prod never meet an agent on your laptop  
2. One sandbox per task. Then delete it  
3. Untrusted agent code → gVisor or stronger  
4. Egress is a decision. DNS is data  
5. Hard caps + TTL. Outbound agents, not inbound SSH  

No Rexec? Same controls with Kubernetes **Jobs** + **RuntimeClass** + **NetworkPolicy**.

---

## Resources

### This talk
- **Talk deck:** [Rexec: How to Safely Give AI Agents a Terminal](/talks/sysconf-2026/) (SysConf 2026)  
- **Rexec:** [github.com/PipeOpsHQ/Rexec](https://github.com/PipeOpsHQ/Rexec)  
- **Docs:** [rexec.sh/docs](https://rexec.sh/docs)  
- **Related:** [Rexec control room](/blog/2026/02/27/rexec-terminal-control-room) · [Namespaces aren't isolation](/blog/2026/08/11/namespaces-arent-isolation) · [Work](/work/)

### Isolation & runtimes
- **gVisor:** [gvisor.dev](https://gvisor.dev/) · [github.com/google/gvisor](https://github.com/google/gvisor)  
- **Firecracker:** [firecracker-microvm.github.io](https://firecracker-microvm.github.io/) · [github.com/firecracker-microvm/firecracker](https://github.com/firecracker-microvm/firecracker)  
- **runc:** [github.com/opencontainers/runc](https://github.com/opencontainers/runc)  
- **cgroup v2:** [kernel docs](https://docs.kernel.org/admin-guide/cgroup-v2.html)  
- **Linux capabilities:** [capabilities(7)](https://man7.org/linux/man-pages/man7/capabilities.7.html)

### Platform building blocks
- **Docker:** [docs.docker.com](https://docs.docker.com/)  
- **PostgreSQL:** [postgresql.org/docs](https://www.postgresql.org/docs/)  
- **Kubernetes Jobs:** [docs](https://kubernetes.io/docs/concepts/workloads/controllers/job/)  
- **RuntimeClass:** [docs](https://kubernetes.io/docs/concepts/containers/runtime-class/)  
- **NetworkPolicy:** [docs](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
