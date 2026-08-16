---
layout: post
title: "Agents Do Better When Work Lives on a Board"
date: 2026-08-16
description: "Observation from heavy agent use: harness todos are fine as a scratchpad, but durable work has been more stable on external boards - especially GitHub Issues and Projects next to the code."
tags:
- Agents
- Workflow
- GitHub
- Productivity
- AI
- Platform Engineering
image: /assets/images/nitrocode-og-v2.png
---

Most agent harnesses ship a todo list. Checkboxes in the chat, a side panel, something that looks like progress while the session is alive.

From my experience using AI heavily: **relying on that internal list for a real workstream gets hard to manage and track.** An external todo system is often easier to govern. The agent has also tended to do better when work is expressed as **issues on the repo you’re in** - plan the product as a project on a board, put goals and breakdown there, and let the agent pick cards instead of inventing a private backlog every session.

**TL;DR:** This is an observation, not a rule. Harness todos still help for short in-session steps. For longer arcs I’ve gotten more stable results when planning and ownership live outside the chat - preferably on the forge you already use for code.

---

## What I’ve been doing

Create a project board for what you’re shipping (org-level if several repos share one product). Write the summary once: problem, goals, non-goals, constraints, what “done” means. Break that into issues with enough acceptance criteria that something can actually finish. Point the agent at the board - next Ready item, implement `#142`, triage bugs labeled for it. Land via PR. Reviews, CI failures, and product follow-ups go back to issues so the next turn (same agent or another) still has a durable queue.

Other project tools work - Linear, Jira, Notion, whatever your team already has. What I’ve noticed with **native issues + projects next to the code** is less glue: stable IDs (`#142` survives chats), PRs and CI sit beside the task, humans and agents share one surface, and you spend fewer tokens re-explaining state every session. You’ve moved planning and management of what you’re building onto a board both of you can track, correlate, and pull context from.

Harness todos still have a job. Mid-issue micro-steps (“run tests,” “update the readme”) are fine as ephemeral checkboxes. They die with the session; the issue doesn’t. For a twenty-minute drive that never needs a second agent or a tomorrow-morning resume, the built-in list is often enough and a board is overhead.

This can be countered. If your work is small, solo, and finishes in one chat, external process is ceremony. If the board is theater - everything In progress, novel-length issues, no review - you just moved the mess. Some people keep a clean harness workflow and never miss a forge board. Fair. I’m not arguing universality. I’m saying **for multi-session, multi-PR work, the durable queue has been the part that held up for me** - and reviews still matter; the issues page is just a convenient attention surface when something needs a human or a second pass.

The agent still lives in the terminal (ideally a sandbox - [How to Safely Give AI Agents a Terminal](/blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal)). The board is optional infrastructure for remembering what “done” was supposed to mean after the chat is gone.
