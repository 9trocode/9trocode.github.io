---
layout: talk
title: How to Safely Give AI Agents a Terminal
description: >-
  Rexec: how to safely give AI agents a terminal. Isolation, limits, network,
  and lifecycle for disposable Linux sandboxes - from building Rexec. Live demo.
permalink: /talks/sysconf-2026/
event: SysConf 2026
slot: "Sat 3 Oct · 12:25-12:55 WAT · Room 1 · Standard 30m"
talk_date: 2026-10-03
speaker_key: sysconf-2026-rexec
blog: /blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal
repo: https://github.com/PipeOpsHQ/Rexec
image: /assets/images/nitrocode-og-v2.png
---

<div class="talk-intro">
  <p class="eyebrow">SysConf 2026 · Standard · 25 + 5</p>
  <h1>How to Safely Give AI Agents a Terminal</h1>
  <div class="talk-intro__meta">
    <p>Alex Idowu · PipeOps · Lagos</p>
    <p><strong>Sat 3 Oct 2026 · 12:25-12:55 WAT · Room 1</strong></p>
    <p>
      <a href="/blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal">Field notes</a>
      ·
      <a href="https://github.com/PipeOpsHQ/Rexec" target="_blank" rel="noopener">Rexec</a>
    </p>
  </div>
  <p class="talk-keys">Present <kbd>P</kbd> · Theme toggle in chrome · <kbd>→</kbd> <kbd>←</kbd> · <code>?present=1</code> · speaker <code>?key=</code></p>
</div>

<!-- 01 Intro / hook -->
<section class="talk-slide talk-slide--elbaph is-active" id="s01" data-slide="1">
  <div class="talk-elbaph" aria-hidden="true">
    <img
      class="talk-elbaph__art"
      src="{{ '/assets/talks/agent-terminal-title.jpg?v=' | append: site.asset_version | relative_url }}"
      alt=""
      width="1280"
      height="720"
      loading="eager"
      decoding="async"
    />
  </div>
  <div class="talk-slide__fore">
    <p class="talk-slide__label">01 · Intro</p>
    <p class="talk-hook">Rexec: how to safely give AI agents a terminal</p>
    <h2>How to Safely Give AI Agents a Terminal</h2>
    <p>Alex Idowu · PipeOps · Lagos · SysConf 2026</p>
  </div>
</section>

<!-- 02 Intro / problem -->
<section class="talk-slide" id="s02" data-slide="2">
  <p class="talk-slide__label">02 · Intro</p>
  <div class="talk-split">
    <div class="talk-split__main">
      <h2>Shell is useful.<br>Your machine is not.</h2>
      <p>Coding agents that run commands are common. Unrestricted shell on a laptop, bastion, or shared runner is still the default.</p>
      <p class="punch">Blast radius is the problem - not the shell.</p>
    </div>
    <aside class="talk-prompt-joke" aria-label="Joke: system prompt control plane">
      <p class="talk-prompt-joke__tag">system prompt</p>
      <pre class="talk-prompt-joke__body">NEVER delete files.
NEVER touch ~/.kube.
NEVER curl | bash.

(You have full shell.)

Approve tool use?
[ Always allow ] ✓</pre>
      <p class="talk-prompt-joke__caption">Not a control plane.</p>
    </aside>
  </div>
</section>

<!-- 03 Goals -->
<section class="talk-slide" id="s03" data-slide="3">
  <p class="talk-slide__label">03 · Goals</p>
  <h2>What we’ll cover</h2>
  <p>Lessons from building <strong>Rexec</strong> - disposable, network-isolated Linux terminals (cloud or your own machines).</p>
  <ol class="talk-goals">
    <li><strong>Security</strong> - how to reason about isolation <span class="talk-goals__next">→ next</span></li>
    <li><strong>Limits</strong> - how to enforce CPU / memory / TTL</li>
    <li><strong>Network</strong> - how to control egress and peers</li>
    <li><strong>Lifecycle</strong> - create → run → delete</li>
    <li><strong>Build</strong> - Rexec components, then how a request flows</li>
    <li><strong>Demo</strong> - prove it live</li>
  </ol>
  <p class="ok">Authoritative on the controls. Relaxed on the delivery.</p>
</section>

<!-- 04 Content: security + limits -->
<section class="talk-slide" id="s04" data-slide="4">
  <p class="talk-slide__label">04 · Content · security &amp; limits</p>
  <h2>Isolation and resource limits</h2>
  <div class="talk-grid">
    <div class="talk-card">
      <strong>Security</strong>
      <span>Ladder: cgroup + caps → <strong>gVisor</strong> (<code>runsc</code>, user-space kernel - my default) → Firecracker → dedicated. Stock containers share the host kernel.</span>
    </div>
    <div class="talk-card">
      <strong>Limits</strong>
      <span>Hard CPU / memory / PIDs. Concurrency + <strong>TTL</strong> (kill on a timer). Thrash is a DoS on yourself. Limits = security.</span>
    </div>
  </div>
  <p class="punch">Rexec trade-off: density + hosts without KVM → gVisor default. Escalate to Firecracker when the threat model says so.</p>
</section>

<!-- 05 Content: network + lifecycle -->
<section class="talk-slide" id="s05" data-slide="5">
  <p class="talk-slide__label">05 · Content · network &amp; lifecycle</p>
  <h2>Network and lifecycle</h2>
  <div class="talk-grid">
    <div class="talk-card">
      <strong>Network</strong>
      <span>A shell is a network endpoint. Pick at create: <strong>none</strong> · <strong>allowlist</strong> · <strong>full</strong>. <strong>ICC</strong> off only stops sandbox-to-sandbox on a Docker bridge - not “no internet.”</span>
    </div>
    <div class="talk-card">
      <strong>Lifecycle</strong>
      <span>Create → short-lived secrets → run → attach if needed → <strong>delete</strong>. Long-lived sandboxes become bastions.</span>
    </div>
  </div>
</section>

<!-- 06 Content: components one-liners (was part of 07) -->
<section class="talk-slide" id="s06" data-slide="6">
  <p class="talk-slide__label">06 · Content · components</p>
  <h2>Rexec pieces - one line each</h2>
  <ul class="talk-oneliners">
    <li><strong>Browser / CLI</strong> - where humans and agents attach (xterm.js, API clients).</li>
    <li><strong>Rexec API</strong> - auth, policy, create / exec / delete, WebSocket sessions.</li>
    <li><strong>PostgreSQL</strong> - users, agents, session metadata.</li>
    <li><strong>Container Manager</strong> - talks to Docker for disposable cloud sandboxes (limits, network, runtime).</li>
    <li><strong>Docker Engine</strong> - where cloud sandboxes actually run.</li>
    <li><strong>Agent Handler</strong> - relays sessions to machines you connect.</li>
    <li><strong>BYOS agent</strong> - outbound WebSocket from your laptop/server; no inbound SSH.</li>
  </ul>
</section>

<!-- 07 Content: architecture dataflow -->
<section class="talk-slide" id="s07" data-slide="7">
  <p class="talk-slide__label">07 · Content · dataflow</p>
  <h2>What happens when you send a request</h2>
  <figure class="talk-diagram talk-diagram--flow">
    {% include talk-rexec-dataflow.svg %}
  </figure>
  <p>Input → API (auth/route) → persist → <strong>Docker sandbox</strong> or <strong>BYOS agent</strong> → stream output back.</p>
</section>

<!-- 08 Demo -->
<section class="talk-slide" id="s08" data-slide="8">
  <p class="talk-slide__label">08 · Content · demo</p>
  <h2>Live: create → prove → delete</h2>
  <ol>
    <li>Create sandbox (limits + network)</li>
    <li>Show the block</li>
    <li>Run something agent-shaped</li>
    <li><strong>Delete</strong></li>
  </ol>
  <div class="talk-code">rexec sandbox create --network none
# show the block
rexec sandbox delete</div>
</section>

<!-- 09 Conclusion -->
<section class="talk-slide" id="s09" data-slide="9">
  <p class="talk-slide__label">09 · Conclusion</p>
  <h2>Steal this</h2>
  <ol>
    <li>No agent shell on laptops for secrets / prod</li>
    <li>One sandbox per task - then delete</li>
    <li>gVisor or stronger for untrusted agent code</li>
    <li>Egress on purpose; DNS is data</li>
    <li>Hard caps + TTL; outbound over inbound SSH</li>
  </ol>
  <p class="punch">Shell is useful. Your machine is not.</p>
</section>

<!-- 10 Resources -->
<section class="talk-slide" id="s10" data-slide="10">
  <p class="talk-slide__label">10 · Resources</p>
  <h2>Resources</h2>
  <ul class="talk-oneliners">
    <li><strong>Rexec</strong> - <a href="https://github.com/PipeOpsHQ/Rexec">github.com/PipeOpsHQ/Rexec</a></li>
    <li><strong>Docs</strong> - <a href="https://rexec.sh/docs">rexec.sh/docs</a></li>
    <li><strong>Field notes</strong> - <a href="/blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal">nitrocode.sh/blog/…/how-to-safely-give-ai-agents-a-terminal</a></li>
    <li><strong>This deck</strong> - <a href="/talks/sysconf-2026/">nitrocode.sh/talks/sysconf-2026</a></li>
  </ul>
  <p>Questions? · @nitrocode · Lagos</p>
</section>
