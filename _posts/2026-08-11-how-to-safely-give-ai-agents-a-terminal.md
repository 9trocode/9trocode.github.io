---
layout: post
title: "How to Safely Give AI Agents a Terminal"
date: 2026-08-11
description: >-
  Rexec: how to safely give AI agents a terminal. Shell is useful; your machine
  is not. Isolation, limits, network, lifecycle - and how a request flows
  through Rexec.
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

**Rexec: how to safely give AI agents a terminal.**

Shell is useful. Your machine is not.

Coding agents that run commands are common. Unrestricted shell on a laptop, bastion, or shared runner is still the default. System prompts and “approve tool use” are not a control plane. The mistake is the **blast radius** - not the shell.

**TL;DR:** Isolation + lifecycle. From building [Rexec](https://github.com/PipeOpsHQ/Rexec): how to reason about security, enforce limits, control network access, what the pieces are, and what happens when you send a request. Then steal a short checklist.

Talk deck: [SysConf 2026](/talks/sysconf-2026/)

---

## Intro - why the default fails

Useful agents shell out. You’re doing untrusted remote code execution with a friendly UI.

What breaks without a jailbreak:

- Secrets land on disk  
- Creative `rm` / path expansion  
- Env leaves over HTTPS or DNS  
- Packages phone home  
- `~/.kube` and other prod creds sit next to the agent  

Models thrash. Hope is not a control.

---

## Goals

Lessons from building **Rexec** - disposable, network-isolated Linux terminals (cloud or your own machines):

1. **Security** - how to reason about isolation  
2. **Limits** - how to enforce CPU / memory / TTL  
3. **Network** - how to control egress and peers  
4. **Lifecycle** - create → run → delete  
5. **Build** - components, then how a request flows  
6. **Practice** - prove it (create → block → delete)  

Not a prompting essay. Controls you can ship.

---

## Content - isolation and limits

**Security ladder**

1. cgroup + caps + network - baseline  
2. **gVisor** (`runsc` = its OCI runtime; user-space kernel between container and host) - my default  
3. Firecracker / microVM - when the threat model demands it  
4. Dedicated node / account - real budget, not cosplay  

Stock containers share the host kernel. Name the rung.

**Limits:** hard CPU / memory / PIDs; concurrency + **TTL** (kill on a timer). Thrash is a DoS on yourself. Limits = security, not just FinOps.

**Trade-off in Rexec:** needed density on shared hosts, including hosts without KVM → gVisor default. Pay syscall/compat tax. Escalate to Firecracker when the threat model says so.

---

## Content - network and lifecycle

**Network:** a shell is a network endpoint. Pick at create: **none** · **allowlist** · **full** (you accepted the leak). **ICC** (inter-container communication on a Docker bridge) off only stops sandbox-to-sandbox on that bridge - not “no internet.”

**Lifecycle:** create → short-lived secrets → run → attach if needed → **delete**. Long-lived sandboxes become bastions with worse accountability.

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

Steal the shape without our code: Kubernetes **Jobs** + **RuntimeClass** + **NetworkPolicy**.

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

## Conclusion - steal this

1. No agent shell on laptops for secrets / prod  
2. One sandbox per task - then delete  
3. gVisor or stronger for untrusted agent code  
4. Egress on purpose; DNS is data  
5. Hard caps + TTL; outbound over inbound SSH for real boxes  

Shell is useful. Your machine is not.

---

## Resources

- **Talk deck:** [How to Safely Give AI Agents a Terminal](/talks/sysconf-2026/) (SysConf 2026)  
- **Rexec:** [github.com/PipeOpsHQ/Rexec](https://github.com/PipeOpsHQ/Rexec)  
- **Docs:** [rexec.sh/docs](https://rexec.sh/docs)  
- **Related:** [Rexec control room](/blog/2026/02/27/rexec-terminal-control-room) · [Namespaces aren't isolation](/blog/2026/08/11/namespaces-arent-isolation) · [Work](/work/)
