---
layout: talk
title: How to Safely Give AI Agents a Terminal
description: >-
  Giving an agent a shell is useful. Giving it your machine is not. Isolation,
  lifecycle, network control, and resource limits for disposable Linux
  terminals - lessons from building Rexec. Live demo.
permalink: /talks/sysconf-2026/
event: SysConf 2026
slot: "Sat 3 Oct · 12:25-12:55 WAT · Room 1 · Standard 30m"
talk_date: 2026-10-03
# Public teaser while talk_date is in the future. Speaker: ?key= or unlock form.
speaker_key: sysconf-2026-rexec
blog: /blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal
repo: https://github.com/PipeOpsHQ/Rexec
image: /assets/images/nitrocode-og-v2.png
---

<div class="talk-intro">
  <p class="eyebrow">SysConf 2026 · Standard</p>
  <h1>How to Safely Give AI Agents a Terminal</h1>
  <div class="talk-intro__meta">
    <p>Alex Idowu · Co-founder &amp; CTO, PipeOps · Lagos</p>
    <p><strong>Sat 3 Oct 2026 · 12:25-12:55 WAT · Room 1</strong><br>
    25 min talk + 5 min Q&amp;A · live Rexec sandbox demo</p>
    <p>
      Field notes:
      <a href="/blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal">blog post</a>
      ·
      <a href="https://github.com/PipeOpsHQ/Rexec" target="_blank" rel="noopener">Rexec</a>
    </p>
  </div>
  <p class="talk-keys">Present · <kbd>P</kbd> or button · Navigate <kbd>→</kbd> <kbd>←</kbd> · Esc exits · Deep link <code>?present=1</code></p>
</div>

<section class="talk-slide is-active" id="s01" data-slide="1">
  <p class="talk-slide__label">01 · Title</p>
  <h2>How to Safely Give AI Agents a Terminal</h2>
  <p>Alex Idowu · PipeOps · Lagos</p>
  <p class="ok">SysConf 2026 · Room 1</p>
</section>

<section class="talk-slide" id="s02" data-slide="2">
  <p class="talk-slide__label">02 · Problem</p>
  <h2>Giving an agent a shell is useful.<br>Giving it your machine is not.</h2>
  <p>Agents that run commands are common. <strong>Unrestricted shell access</strong> on a laptop, bastion, or shared runner is still the default.</p>
  <p>System prompts + “approve tool use” are not a control plane.</p>
  <p class="punch">The mistake is the blast radius - not the shell.</p>
</section>

<section class="talk-slide" id="s03" data-slide="3">
  <p class="talk-slide__label">03 · Why the default fails</p>
  <h2>Why the default fails</h2>
  <ul>
    <li>Secrets land on disk</li>
    <li>Creative <code>rm</code> / path expansion</li>
    <li>Env leaves over HTTPS or DNS</li>
    <li>Packages phone home</li>
    <li><code>~/.kube</code> and other prod creds sit next to the agent</li>
  </ul>
  <p>No jailbreak required. Models thrash. Hope is not a control.</p>
</section>

<section class="talk-slide" id="s04" data-slide="4">
  <p class="talk-slide__label">04 · What this talk answers</p>
  <h2>What this talk answers</h2>
  <p>From building <strong>Rexec</strong> - disposable, network-isolated Linux terminals (cloud or your own machines):</p>
  <ol>
    <li>How do you <strong>reason about security</strong>?</li>
    <li>How do you <strong>enforce resource limits</strong>?</li>
    <li>How do you <strong>control network access</strong>?</li>
    <li>How do you <strong>build</strong> a tool like that?</li>
  </ol>
  <p class="ok">Isolation + lifecycle. Not a prompting talk.</p>
</section>

<section class="talk-slide" id="s05" data-slide="5">
  <p class="talk-slide__label">05 · Security + limits</p>
  <h2>Security and resource limits</h2>
  <div class="talk-grid">
    <div class="talk-card">
      <strong>Reason about isolation</strong>
      <span>cgroup + caps → gVisor (<code>runsc</code>, my default) → Firecracker → dedicated. Stock containers share the host kernel. Name the rung.</span>
    </div>
    <div class="talk-card">
      <strong>Enforce limits</strong>
      <span>Hard CPU / memory / PIDs. Concurrency caps + TTL. Thrashing agents are a DoS on yourself. Limits = security, not just FinOps.</span>
    </div>
  </div>
</section>

<section class="talk-slide" id="s06" data-slide="6">
  <p class="talk-slide__label">06 · Network + lifecycle</p>
  <h2>Network access and lifecycle</h2>
  <div class="talk-grid">
    <div class="talk-card">
      <strong>Control the network</strong>
      <span>A shell is a network endpoint. Peer, metadata, HTTPS, DNS, demo ports. Pick at create: <strong>none</strong> · <strong>allowlist</strong> · <strong>full</strong>. ICC off ≠ no internet.</span>
    </div>
    <div class="talk-card">
      <strong>Lifecycle</strong>
      <span>Create → short-lived secrets → run → attach if needed → <strong>delete</strong>. Long-lived sandboxes become bastions with worse accountability.</span>
    </div>
  </div>
</section>

<section class="talk-slide" id="s07" data-slide="7">
  <p class="talk-slide__label">07 · Building Rexec</p>
  <h2>How you build something like Rexec</h2>
  <div class="talk-grid">
    <div class="talk-card">
      <strong>Cloud terminal</strong>
      <span>Disposable Linux. Caps, ICC off, <code>runsc</code>. Attach via API/WebSocket - not published SSH.</span>
    </div>
    <div class="talk-card">
      <strong>BYOS</strong>
      <span>Outbound WebSocket from your machine. Real GPU/lab. Mediated access - not a jail. No open 22 for the demo.</span>
    </div>
  </div>
  <p>Steal the shape with Jobs + RuntimeClass + NetworkPolicy if you never run our code.</p>
  <p class="punch">Failures I’ve hit (say out loud): Docker socket, full egress, no TTL, prompt-as-boundary, gVisor in README / runc in prod.</p>
</section>

<section class="talk-slide" id="s08" data-slide="8">
  <p class="talk-slide__label">08 · Live demo</p>
  <h2>Live: create → prove controls → delete</h2>
  <ol>
    <li>Create (limits + network mode)</li>
    <li>Show the block - egress or peer</li>
    <li>Run something agent-shaped</li>
    <li><strong>Delete</strong></li>
  </ol>
  <div class="talk-code">rexec sandbox create --network none
# show the failure / block
rexec sandbox delete</div>
  <p>Wifi bad? Same four steps on screenshots.</p>
</section>

<section class="talk-slide" id="s09" data-slide="9">
  <p class="talk-slide__label">09 · Steal this + close</p>
  <h2>Steal this</h2>
  <ol>
    <li>No agent shell on laptops for secrets / prod</li>
    <li>One sandbox per task - then delete</li>
    <li>gVisor or stronger for untrusted agent code</li>
    <li>Egress on purpose; treat DNS as data</li>
    <li>Hard caps + TTL; outbound over inbound SSH for real boxes</li>
  </ol>
  <p class="punch">Giving an agent a shell is useful. Giving it your machine is not.</p>
  <div class="talk-code">github.com/PipeOpsHQ/Rexec
/blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal</div>
  <p>Questions? · Alex Idowu · @nitrocode</p>
</section>
