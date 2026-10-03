---
layout: talk
title: "Rexec: How to Safely Give AI Agents a Terminal"
description: >-
  How to safely give AI agents a terminal using Rexec - isolation, limits,
  network, and lifecycle for disposable Linux sandboxes. Live demo.
permalink: /talks/sysconf-2026/
event: SysConf 2026
slot: "Sat 3 Oct · 12:25-12:55 WAT · Room 1 · Standard 30m"
talk_date: 2026-10-03
speaker_key: sysconf-2026-rexec
blog: /blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal
repo: https://github.com/PipeOpsHQ/Rexec
image: /assets/talks/agent-terminal-title.jpg
---

<div class="talk-intro">
  <p class="eyebrow">#SysConf 2026 · Standard · 25 + 5</p>
  <h1>Rexec: How to Safely Give AI Agents a Terminal</h1>
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
    <p class="talk-hook">How to safely give AI agents a terminal - using Rexec</p>
    <h2>Rexec: How to Safely Give AI Agents a Terminal</h2>
    <p>Alex Idowu · PipeOps · Lagos · SysConf 2026</p>
  </div>
</section>


<!-- 02 About -->
<section class="talk-slide" id="s02" data-slide="2">
  <p class="talk-slide__label">02 · Intro · about</p>
  <div class="talk-split talk-split--about">
    <div class="talk-split__main">
      <h2>Quick intro</h2>
      <p>I’m <strong>Alex Idowu</strong> - Co-founder &amp; CTO at <strong>PipeOps</strong>, based in Lagos.</p>
      <ul class="talk-oneliners">
        <li>I build platforms, sandboxes, and isolation for a living - Rexec, agents, multi-tenant Kubernetes.</li>
        <li>Decade-plus in cloud infra, IaC, and runtime security (gVisor, Firecracker, the messy middle).</li>
        <li>When I’m not in production logs: <em>One Piece</em>, open source for fun, and shipping small tools that scratch my own itch.</li>
      </ul>
      <p class="ok">That’s enough about me - let’s talk terminals.</p>
    </div>
    <figure class="talk-portrait">
      <img
        src="{{ '/assets/images/alex-idowu-talk.jpg?v=' | append: site.asset_version | relative_url }}"
        alt="Alex Idowu"
        width="400"
        height="400"
        loading="eager"
        decoding="async"
      />
    </figure>
  </div>
</section>


<!-- 03 Goals -->
<section class="talk-slide" id="s03" data-slide="3">
  <p class="talk-slide__label">03 · Goals</p>
  <h2>What this talk covers</h2>
  <p>How to safely give AI agents a terminal <strong>using Rexec</strong> - and the controls that still matter if you wire your own stack.</p>
  <ol class="talk-goals">
    <li><strong>The problem</strong> - agent exec on your workstation, not a sandbox terminal <span class="talk-goals__next">→ next</span></li>
    <li><strong>Security &amp; limits</strong> - isolation ladder, CPU / memory / TTL</li>
    <li><strong>Reach &amp; disposal</strong> - what the terminal can talk to, and when it dies</li>
    <li><strong>Rexec build</strong> - components, then request dataflow</li>
    <li><strong>Demo</strong> - create → prove → delete</li>
  </ol>
  <p class="ok">Rexec is the through-line. The controls travel without it.</p>
</section>


<!-- 04 Content · problem -->
<section class="talk-slide" id="s04" data-slide="4">
  <p class="talk-slide__label">04 · Content · problem</p>
  <div class="talk-split">
    <div class="talk-split__main">
      <h2>Agents still get a terminal.<br>It just shouldn’t be your workstation.</h2>
      <p>They need to run commands - that’s the product. The shortcut is running those commands <em>as you</em> on a laptop, bastion, or shared runner.</p>
      <p>This talk is <strong>not</strong> “harden your personal shell for AI.”</p>
      <p>It’s <strong>give the agent its own disposable terminal</strong> - isolated, capped, networked on purpose, then deleted. That’s what <strong>Rexec</strong> is for.</p>
    </div>
    <aside class="talk-prompt-joke" aria-label="Joke: system prompt control plane">
      <p class="talk-prompt-joke__tag">system prompt</p>
      <pre class="talk-prompt-joke__body">NEVER delete files.
NEVER touch ~/.kube.
NEVER curl | bash.

(You have full shell.)

Approve tool use?
[ Always allow ] ✓</pre>
      <p class="talk-prompt-joke__caption">Fake fix when you share the workstation.</p>
    </aside>
  </div>
</section>


<!-- 04 Content: security + limits -->
<section class="talk-slide" id="s05" data-slide="5">
  <p class="talk-slide__label">05 · Content · security &amp; limits</p>
  <h2>Security &amp; limits</h2>
  <ul class="talk-oneliners talk-oneliners--logos">
    <li>
      <img class="talk-logo" src="{{ '/assets/talks/logos/cgroup.svg' | relative_url }}" alt="" width="28" height="28" />
      <span><strong>cgroup + caps</strong> - baseline Linux resource and privilege controls.</span>
    </li>
    <li>
      <img class="talk-logo" src="{{ '/assets/talks/logos/gvisor.svg' | relative_url }}" alt="" width="28" height="28" />
      <span><strong>gVisor (<code>runsc</code>)</strong> - user-space kernel; my default for agent sandboxes.</span>
    </li>
    <li>
      <img class="talk-logo" src="{{ '/assets/talks/logos/firecracker.svg' | relative_url }}" alt="" width="28" height="28" />
      <span><strong>Firecracker</strong> - microVM when you need a guest kernel / harder boundary.</span>
    </li>
    <li>
      <img class="talk-logo" src="{{ '/assets/talks/logos/linux.svg' | relative_url }}" alt="" width="28" height="28" />
      <span><strong>Default Docker (<code>runc</code>)</strong> - shares the host kernel; say so if that’s all you’re using.</span>
    </li>
    <li>
      <span class="talk-logo talk-logo--text">TTL</span>
      <span><strong>CPU / mem / PID + TTL</strong> - hard caps; thrash is a DoS on yourself. Limits = security.</span>
    </li>
  </ul>
  <p class="punch">Trade-off: density + no KVM → gVisor default; escalate to Firecracker when the threat model says so.</p>
</section>

<section class="talk-slide" id="s06" data-slide="6">
  <p class="talk-slide__label">06 · Content · reach &amp; disposal</p>
  <h2>What the terminal can reach, and when it dies</h2>
  <ul class="talk-oneliners talk-oneliners--logos">
    <li>
      <img class="talk-logo" src="{{ '/assets/talks/logos/docker.svg' | relative_url }}" alt="" width="28" height="28" />
      <span><strong>Shell = network endpoint</strong> - peer traffic, metadata, HTTPS, DNS, demo ports.</span>
    </li>
    <li>
      <span class="talk-logo talk-logo--text">NET</span>
      <span><strong>Egress modes</strong> - none · allowlist · full (you accepted the leak).</span>
    </li>
    <li>
      <img class="talk-logo" src="{{ '/assets/talks/logos/docker.svg' | relative_url }}" alt="" width="28" height="28" />
      <span><strong>ICC off</strong> - stops sandbox-to-sandbox on a Docker bridge; not “no internet.”</span>
    </li>
    <li>
      <span class="talk-logo talk-logo--text">TTL</span>
      <span><strong>Lifecycle</strong> - create → short-lived secrets → run → attach → <strong>delete</strong>.</span>
    </li>
    <li>
      <img class="talk-logo" src="{{ '/assets/talks/logos/linux.svg' | relative_url }}" alt="" width="28" height="28" />
      <span><strong>Long-lived sandboxes</strong> - become bastions with worse accountability.</span>
    </li>
  </ul>
</section>

<section class="talk-slide" id="s07" data-slide="7">
  <p class="talk-slide__label">07 · Content · components</p>
  <h2>Stack</h2>
  <ul class="talk-oneliners talk-oneliners--logos">
    <li>
      <span class="talk-logo talk-logo--text">UI</span>
      <span><strong>Browser / CLI</strong> - where humans and agents attach (xterm.js, API clients).</span>
    </li>
    <li>
      <span class="talk-logo talk-logo--text">API</span>
      <span><strong>Control API</strong> - auth, policy, create / exec / delete, WebSocket sessions.</span>
    </li>
    <li>
      <img class="talk-logo" src="{{ '/assets/talks/logos/postgresql.svg' | relative_url }}" alt="" width="28" height="28" />
      <span><strong>PostgreSQL</strong> - users, agents, session metadata.</span>
    </li>
    <li>
      <img class="talk-logo" src="{{ '/assets/talks/logos/docker.svg' | relative_url }}" alt="" width="28" height="28" />
      <span><strong>Container Manager → Docker</strong> - disposable cloud sandboxes (limits, network, runtime).</span>
    </li>
    <li>
      <img class="talk-logo" src="{{ '/assets/talks/logos/websocket.svg' | relative_url }}" alt="" width="28" height="28" />
      <span><strong>Agent Handler → BYOS</strong> - outbound WebSocket to your machine; no inbound SSH.</span>
    </li>
  </ul>
</section>

<!-- 07 Content: architecture dataflow -->
<section class="talk-slide" id="s08" data-slide="8">
  <p class="talk-slide__label">08 · Content · dataflow</p>
  <h2>What happens when you send a request</h2>
  <figure class="talk-diagram talk-diagram--flow">
    {% include talk-rexec-dataflow.svg %}
  </figure>
  <p>Input → API (auth/route) → persist → <strong>Docker sandbox</strong> or <strong>BYOS agent</strong> → stream output back.</p>
</section>

<!-- 08 Demo -->
<section class="talk-slide" id="s09" data-slide="9">
  <p class="talk-slide__label">09 · Content · demo</p>
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
<section class="talk-slide" id="s10" data-slide="10">
  <p class="talk-slide__label">10 · Conclusion</p>
  <h2>Build the agent a terminal.<br>Don’t share the one you live in.</h2>
  <ol>
    <li>Secrets and prod never meet an agent on your laptop</li>
    <li>One sandbox per task. Then delete it</li>
    <li>Untrusted agent code → gVisor or stronger</li>
    <li>Egress is a decision. DNS is data</li>
    <li>Hard caps + TTL. Outbound agents, not inbound SSH</li>
  </ol>
  <p class="ok">No Rexec? Same controls with Kubernetes <strong>Jobs</strong> + <strong>RuntimeClass</strong> + <strong>NetworkPolicy</strong>.</p>
</section>

<!-- 10 Resources -->
<section class="talk-slide" id="s11" data-slide="11">
  <p class="talk-slide__label">11 · Resources</p>
  <h2>Resources</h2>
  <div class="talk-resources">
    <div>
      <p class="talk-resources__heading">This talk</p>
      <ul class="talk-oneliners talk-oneliners--compact">
        <li><strong>Rexec</strong> - <a href="https://github.com/PipeOpsHQ/Rexec">github.com/PipeOpsHQ/Rexec</a></li>
        <li><strong>Docs</strong> - <a href="https://rexec.sh/docs">rexec.sh/docs</a></li>
        <li><strong>Field notes</strong> - <a href="/blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal">nitrocode.sh/blog/…</a></li>
        <li><strong>Deck</strong> - <a href="/talks/sysconf-2026/">nitrocode.sh/talks/sysconf-2026</a></li>
      </ul>
    </div>
    <div>
      <p class="talk-resources__heading">Isolation &amp; runtimes</p>
      <ul class="talk-oneliners talk-oneliners--compact">
        <li><strong>gVisor</strong> - <a href="https://gvisor.dev/">gvisor.dev</a> · <a href="https://github.com/google/gvisor">github.com/google/gvisor</a></li>
        <li><strong>Firecracker</strong> - <a href="https://firecracker-microvm.github.io/">firecracker-microvm.github.io</a></li>
        <li><strong>runc</strong> - <a href="https://github.com/opencontainers/runc">github.com/opencontainers/runc</a></li>
        <li><strong>cgroup v2</strong> - <a href="https://docs.kernel.org/admin-guide/cgroup-v2.html">kernel docs</a></li>
        <li><strong>capabilities</strong> - <a href="https://man7.org/linux/man-pages/man7/capabilities.7.html">capabilities(7)</a></li>
      </ul>
    </div>
    <div>
      <p class="talk-resources__heading">Platform building blocks</p>
      <ul class="talk-oneliners talk-oneliners--compact">
        <li><strong>Docker</strong> - <a href="https://docs.docker.com/">docs.docker.com</a></li>
        <li><strong>PostgreSQL</strong> - <a href="https://www.postgresql.org/docs/">postgresql.org/docs</a></li>
        <li><strong>Jobs</strong> - <a href="https://kubernetes.io/docs/concepts/workloads/controllers/job/">Kubernetes Jobs</a></li>
        <li><strong>RuntimeClass</strong> - <a href="https://kubernetes.io/docs/concepts/containers/runtime-class/">RuntimeClass</a></li>
        <li><strong>NetworkPolicy</strong> - <a href="https://kubernetes.io/docs/concepts/services-networking/network-policies/">NetworkPolicy</a></li>
      </ul>
    </div>
  </div>
  <p>Questions? · @nitrocode · Lagos</p>
</section>
