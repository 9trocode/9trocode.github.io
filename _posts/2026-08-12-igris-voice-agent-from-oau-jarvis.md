---
layout: post
title: "Igris: Finishing the Voice Agent I Started at OAU in 2014"
date: 2026-08-12
description: "A personal AI agent I first built as a campus Jarvis prototype—wake word, Iron Man UI, open apps, shut down the PC—is back as Igris: Go brain, Apple clients, real tools."
tags:
- Igris
- Agents
- Voice
- Open Source
- Personal
- Go
image: /assets/images/nitrocode-og.png
---

Some projects don’t die. They wait.

In **2014/2015 at OAU**, I built a personal assistant that felt like science fiction on a student machine: custom **Iron Man–inspired UI**, talk when I said **“hey Jarvis,”** listen for actions, and actually do things—open an app, close an app, shut down the PC. It worked enough to feel real. It was also **way ahead of what I could resource** then: compute, models, speech stacks, distribution, time.

I didn’t have the runway to chase it properly. So it lived in the back of my head while I went deep on infrastructure, platforms, and production systems.

**Here we are.**

**[Igris](https://github.com/9trocode/Igris)** is that dream with adult tools. Not a nostalgia rebuild of every pixel—a **voice-only personal agent** with a real architecture: a **Go brain**, thin **Apple clients** (iPhone, iPad, Mac), one WebSocket protocol, memory, tools, and an interface that still understands the assignment: black room, arc-reactor orb, presence you can feel when it’s listening vs thinking vs speaking.

**TL;DR:** Igris is my long-cycle personal agent project—from OAU prototype to a modern voice-native stack. The product thesis is simple: **you talk, it talks back; the screen is for captions and things that should be read, not a chat box pretending to be a conversation.**

---

## What the 2014 version got right

Even with limited resources, the old design instincts were solid:

1. **Voice first** — if you have to type everything, it’s an app, not an assistant.
2. **Actions, not answers** — open, close, power state; agency over encyclopedia mode.
3. **Presence UI** — the orb / reactor aesthetic wasn’t decoration; it was state machine visualization before I had the vocabulary for that.
4. **Local life integration** — the PC was the body. The assistant lived where work happened.

What it lacked was everything the industry spent a decade building: reliable STT/TTS, long-context brains, tool protocols, mobile as a first-class body, and enough personal platform skill to ship a control plane instead of a demo script.

---

## What Igris is now

From the public tree (repo still uses some `jarvis` paths under the hood—the lineage is not subtle):

```
server/     Go: agent loop, memory, voice gateway — one binary
apple/      SwiftUI clients: iPhone, iPad, Mac menu bar
```

**Brain:** Go server. Default path Claude; any OpenAI-compatible mind via config (including local models).  
**Ears/mouth:** Deepgram live STT + VAD; speech out native Apple by default, or server TTS when you want it.  
**Body:** Apple-only thin clients on one full-duplex WebSocket. No web client by design.  
**Tools:** reminders, tasks, web search, local Mac integrations (calendar, mail, messages—with **confirm-before-send** for anything that leaves the machine), MCP servers, background coding jobs.

Architecture in one line: **one protocol, many bodies.** The phone is not a separate product from the Mac menu bar; both are skins over the same agent loop.

Run the brain (dev shape):

```bash
cd server
export DEEPGRAM_API_KEY=...
export ANTHROPIC_API_KEY=sk-ant-...
go run ./cmd/jarvis
# health: curl localhost:8787/healthz
```

Point the Apple app at `ws://…:8787/ws` with a bearer token. Prefer Tailscale or private network over “exposed to the internet with a hope and a JWT.”

Source: [github.com/9trocode/Igris](https://github.com/9trocode/Igris)

---

## Why this matters next to PipeOps and Rexec

I ship platforms for other people’s production systems for a living. Igris is different: **it’s personal infrastructure for my own life and work.**

Still, the engineering rhymes:

- **Clear control plane** (Go server) vs **thin edges** (Apple clients)
- **Tool use with confirmation gates** for irreversible actions (same instinct as not giving agents raw prod)
- **Memory and transcripts as durable state**, not chat scrollback cosplay
- **Sandbox thinking** when the agent codes — which is why disposable environments and [agent terminal isolation](/blog/2026/08/11/agent-terminal-sandboxes-isolation) sit in the same headspace

Igris is allowed to be romantic. The implementation still has to be boring where it counts: auth tokens, data dirs, staged sends, explicit voice modes.

---

## What’s next

I’m building this in public as far as the repo allows. Near-term focus for me:

1. **Reliability of the voice loop** — barge-in, latency, silence, failure modes when STT flakes  
2. **Safer action surface** — more confirmations, clearer audit of what the agent did  
3. **Bodies** — Mac + iOS parity; later, hardware if the protocol stays clean  
4. **Local-first options** — brains and voices that don’t require every token to leave home  

If the 2014 version was a spark on a student PC, Igris is the forge. Same obsession. Better steel.

---

## Summary

I built a Jarvis-class desktop agent at OAU before the ecosystem could carry it. Igris is me refusing to leave that idea in a drawer: voice-only, action-capable, beautiful on purpose, engineered like a real system.

Dream projects aren’t late. They’re early until the world (and you) can hold them.

Repo: [9trocode/Igris](https://github.com/9trocode/Igris)
