---
layout: post
title: "Igris: Finishing the Voice Agent I Started at OAU in 2014"
date: 2026-08-11
description: "A personal AI agent I first built as a campus Jarvis prototype - wake word, Iron Man UI, open apps, shut down the PC - is back as Igris: Go brain, Apple clients, 3D guardian hardware plan."
tags:
- Igris
- Agents
- Voice
- Open Source
- Personal
- Go
image: /assets/images/igris/hero-card.png
---

Some projects don’t die. They wait.

In **2014/2015 at OAU**, I built a personal assistant that felt like science fiction on a student machine: custom **Iron Man-inspired UI**, talk when I said **“hey Jarvis,”** listen for actions, and actually do things - open an app, close an app, shut down the PC. It worked enough to feel real. It was also **way ahead of what I could resource** then: compute, models, speech stacks, distribution, time.

I didn’t have the runway to chase it properly. So it lived in the back of my head while I went deep on infrastructure, platforms, and production systems.

**Here we are.**

**[Igris](https://github.com/9trocode/Igris)** is that dream with adult tools. Not a nostalgia rebuild of every pixel - a **voice-only personal agent** with a real architecture: a **Go brain**, thin **Apple clients** (iPhone, iPad, Mac), one WebSocket protocol, memory, tools, and a guardian presence you can feel when it’s listening vs thinking vs speaking. The product thesis is simple: **you talk, it talks back; the screen is for captions and things that should be read, not a chat box pretending to be a conversation.**

![Igris brand - sworn guardian, voice-first](/assets/images/igris/01-hero.png)

**TL;DR:** Igris is my long-cycle personal agent project - from OAU prototype to a modern voice-native stack - with a full **software + 3D hardware** design: one will, many blades (bodies), from phone and Mac to desk sentinels and field units.

---

## What the 2014 version got right

Even with limited resources, the old design instincts were solid:

1. **Voice first** - if you have to type everything, it’s an app, not an assistant.
2. **Actions, not answers** - open, close, power state; agency over encyclopedia mode.
3. **Presence UI** - the orb / reactor aesthetic wasn’t decoration; it was state machine visualization before I had the vocabulary for that.
4. **Local life integration** - the PC was the body. The assistant lived where work happened.

What it lacked was everything the industry spent a decade building: reliable STT/TTS, long-context brains, tool protocols, mobile as a first-class body, and enough personal platform skill to ship a control plane instead of a demo script.

---

## What Igris is now (software)

From the public tree (repo still uses some `jarvis` paths under the hood - the lineage is not subtle):

```
server/ Go: agent loop, memory, voice gateway - one binary
apple/ SwiftUI clients: iPhone, iPad, Mac menu bar
```

**Brain:** Go server. Default path Claude; any OpenAI-compatible mind via config (including local models). 
**Ears/mouth:** Deepgram live STT + VAD; speech out native Apple by default, or server TTS when you want it. 
**Body:** Apple-only thin clients on one full-duplex WebSocket. No web client by design. 
**Tools:** reminders, tasks, web search, local Mac integrations (calendar, mail, messages - with **confirm-before-send** for anything that leaves the machine), MCP servers, background coding jobs.

Architecture in one line: **one protocol, many bodies.** The phone is not a separate product from the Mac menu bar; both are skins over the same agent loop - the same “one will, many blades” idea the hardware plan extends.

![iPhone, Mac, and protocol - one will, many blades](/assets/images/igris/05-blades-ui.png)

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

## The visage - state, not wallpaper

The face is a **sigil**: slow ember pulse at rest, then clear stances for listening, assessing, speaking (with visemes), alert, dormant. The 2014 orb was the same instinct; this version is a full state machine you can read across glass.

![Guardian states and visemes](/assets/images/igris/03-visage-states.png)

---

## 3D plan - guardian forms, not a speaker puck

Igris isn’t meant to live only as an icon on a phone. The design board locks **four desk-scale directions** - hardware with a face and a job:

| Form | Idea |
|---|---|
| **The Sentinel** | Forged shell, round visor, stands post on the desk |
| **The Wisp** | Levitating ember core on a ring - pure watchful presence |
| **The Squire** | Small armored unit, wide visor, overtly “character” |
| **The Obelisk** | Slim black-glass slab; architectural, under-glass OLED |

![Guardian forms - Sentinel, Wisp, Squire, Obelisk](/assets/images/igris/04-guardian-forms-3d.png)

Same will as the software clients: **thin blade, one brain**. The desk unit is another WebSocket body, not a separate product line with its own half-broken firmware personality.

---

## Field units - seven blades, one will

Beyond the desk, the ecosystem plan spreads the same guardian into the world: pocket, wrist, sight, home, wall watch, road, find.

![Guardian units in the field - Talisman, Vambrace, Helm, Brazier, Bastion, Charger, Seal](/assets/images/igris/06-field-units.png)

- **Talisman** - palm summon, panic ping, location 
- **Vambrace** - wrist vitals + silent guardian alert 
- **Helm** - AR overlay / face match (quietly, only when you ask) 
- **Brazier** - home shelf presence, glass-break / far-field mic 
- **Bastion** - wall/ceiling eye that tracks motion 
- **Charger** - in-cabin escort on the road 
- **Seal** - coin-sized find / precision ping 

Every body is **another client of the same server**. Summon it from your palm, wear it, mount it, park it in the car - Igris is the will; the blades are armor.

---

## What’s next

I’m building this in public as far as the repo allows. Near-term focus for me:

1. **Reliability of the voice loop** - barge-in, latency, silence, failure modes when STT flakes 
2. **Safer action surface** - more confirmations, clearer audit of what the agent did 
3. **Bodies** - Mac + iOS parity first; desk **Sentinel / Wisp** hardware when the protocol stays clean 
4. **Local-first options** - brains and voices that don’t require every token to leave home 
5. **Field blades** - pocket and home units after the software will is solid 

If the 2014 version was a spark on a student PC, Igris is the forge. Same obsession. Better steel - and a real plan for silicon that stands watch on the desk.

---

## Summary

I built a Jarvis-class desktop agent at OAU before the ecosystem could carry it. Igris is me refusing to leave that idea in a drawer: voice-only, action-capable, beautiful on purpose - software bodies now, **3D guardian forms and field units** on the roadmap.

Dream projects aren’t late. They’re early until the world (and you) can hold them.

Repo: [9trocode/Igris](https://github.com/9trocode/Igris)
