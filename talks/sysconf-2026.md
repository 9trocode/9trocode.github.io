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
  <p class="talk-slide__label">02 · The problem</p>
  <h2>Agents that run commands are common.<br>Unrestricted shell access is still the default.</h2>
  <p>Laptop. Bastion. Shared CI runner.</p>
  <p>Most setups still hand the model a real shell on a machine you care about - and call system prompts + “approve tool use” the control plane.</p>
</section>

<section class="talk-slide" id="s03" data-slide="3">
  <p class="talk-slide__label">03 · The claim</p>
  <h2>Giving an agent a shell is useful.<br>Giving it your machine is not.</h2>
  <p>Useful agents shell out. That’s fine.</p>
  <p class="punch">The mistake is the blast radius - not the shell.</p>
</section>

<section class="talk-slide" id="s04" data-slide="4">
  <p class="talk-slide__label">04 · Reframe</p>
  <h2>Isolation and lifecycle.<br>Not a prompting problem.</h2>
  <p>This talk answers four questions from building <strong>Rexec</strong>:</p>
  <ol>
    <li>How do you reason about security?</li>
    <li>How do you enforce resource limits?</li>
    <li>How do you control network access?</li>
    <li>How do you build disposable terminals (cloud or your own machines)?</li>
  </ol>
</section>

<section class="talk-slide" id="s05" data-slide="5">
  <p class="talk-slide__label">05 · Why the default fails</p>
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

<section class="talk-slide" id="s06" data-slide="6">
  <p class="talk-slide__label">06 · Four controls</p>
  <h2>Four controls</h2>
  <div class="talk-grid">
    <div class="talk-card"><strong>1 · Isolation</strong><span>What can it touch? Host, peers, kernel surface.</span></div>
    <div class="talk-card"><strong>2 · Lifecycle</strong><span>Create → run → delete. No leftover Tuesday containers.</span></div>
    <div class="talk-card"><strong>3 · Network</strong><span>Egress and peer traffic chosen at create time.</span></div>
    <div class="talk-card"><strong>4 · Limits</strong><span>CPU, memory, PIDs - hard caps, not vibes.</span></div>
  </div>
  <p>That’s the product. Not a longer system prompt.</p>
</section>

<section class="talk-slide" id="s07" data-slide="7">
  <p class="talk-slide__label">07 · Isolation</p>
  <h2>How I reason about isolation</h2>
  <ol>
    <li><strong>cgroup + caps + network</strong> - baseline</li>
    <li><strong>gVisor (<code>runsc</code>)</strong> - smaller host syscall surface (my default for agents)</li>
    <li><strong>Firecracker / microVM</strong> - when the threat model demands it</li>
    <li><strong>Dedicated node / account</strong> - real budget, not cosplay</li>
  </ol>
  <p>Stock containers share the host kernel. Name the rung you’re buying.</p>
</section>

<section class="talk-slide" id="s08" data-slide="8">
  <p class="talk-slide__label">08 · Resource limits</p>
  <h2>How you enforce resource limits</h2>
  <ul>
    <li>Hard CPU / memory / PID caps on every sandbox</li>
    <li>Disk quotas when the host can enforce them</li>
    <li>Concurrency caps + TTL - thrashing agents are a DoS on yourself</li>
  </ul>
  <p class="punch">Limits are a security control, not just FinOps.</p>
</section>

<section class="talk-slide" id="s09" data-slide="9">
  <p class="talk-slide__label">09 · Network control</p>
  <h2>How you control network access</h2>
  <p>A terminal with a shell is a network endpoint.</p>
  <ul>
    <li>Peer-to-peer between sandboxes</li>
    <li>Host / cloud metadata</li>
    <li>Exfil over HTTPS</li>
    <li>Exfil over DNS</li>
    <li>“Just for the demo” published ports</li>
  </ul>
  <p>Pick at create time: <strong>none</strong> · <strong>allowlist</strong> · <strong>full</strong> (you accepted the leak).</p>
  <p class="punch">ICC off ≠ no internet.</p>
</section>

<section class="talk-slide" id="s10" data-slide="10">
  <p class="talk-slide__label">10 · Lifecycle</p>
  <h2>Lifecycle is the other half of isolation</h2>
  <ol>
    <li><strong>Create</strong> - image, limits, network mode</li>
    <li><strong>Inject secrets</strong> - short-lived only</li>
    <li><strong>Run</strong> - headless by default</li>
    <li><strong>Attach</strong> - only if a human must intervene</li>
    <li><strong>Delete</strong> - assume disk and memory are gone</li>
  </ol>
  <p>Long-lived “dev sandboxes” become bastions with worse accountability.</p>
</section>

<section class="talk-slide" id="s11" data-slide="11">
  <p class="talk-slide__label">11 · Building it (Rexec)</p>
  <h2>How you build something like Rexec</h2>
  <div class="talk-grid">
    <div class="talk-card">
      <strong>Cloud terminal</strong>
      <span>Disposable Linux in Docker/Podman. Caps, ICC off, <code>runsc</code>. Attach via API/WebSocket - not published SSH.</span>
    </div>
    <div class="talk-card">
      <strong>BYOS</strong>
      <span>Outbound WebSocket from your machine. Real GPU/lab box. Mediated access - not a jail. No open 22 for the demo.</span>
    </div>
  </div>
  <p>Steal the shape with Jobs + RuntimeClass + NetworkPolicy if you never run our code.</p>
</section>

<section class="talk-slide" id="s12" data-slide="12">
  <p class="talk-slide__label">12 · Live demo</p>
  <h2>Live: create → prove controls → delete</h2>
  <ol>
    <li>Create a sandbox (limits + network mode)</li>
    <li>Show the block - egress or peer</li>
    <li>Run something agent-shaped</li>
    <li><strong>Delete</strong></li>
  </ol>
  <div class="talk-code">rexec sandbox create --network none
# show the failure / block
rexec sandbox delete</div>
  <p>Wifi bad? Same four steps on screenshots.</p>
</section>

<section class="talk-slide" id="s13" data-slide="13">
  <p class="talk-slide__label">13 · Failures I’ve hit</p>
  <h2>Failures I’ve hit</h2>
  <ul>
    <li><strong>Docker socket in the sandbox</strong> - moved the gate, didn’t close it</li>
    <li><strong>Full egress by default</strong> - agents phone home</li>
    <li><strong>No TTL / concurrency caps</strong> - one thrash OOMs the host</li>
    <li><strong>Prompt as the boundary</strong> - UX, not isolation</li>
    <li><strong>gVisor in the README, runc in prod</strong> - runtime theater</li>
  </ul>
</section>

<section class="talk-slide" id="s14" data-slide="14">
  <p class="talk-slide__label">14 · Steal this</p>
  <h2>Steal this</h2>
  <ol>
    <li>No agent shell on laptops for secrets / prod</li>
    <li>One sandbox per task - then delete</li>
    <li>gVisor or stronger for untrusted agent code</li>
    <li>Egress on purpose; treat DNS as data</li>
    <li>Hard CPU / memory / PID + TTL</li>
    <li>Outbound agents over inbound SSH for real boxes</li>
    <li>Assume breakout; escalate the rung when you must</li>
  </ol>
</section>

<section class="talk-slide" id="s15" data-slide="15">
  <p class="talk-slide__label">15 · Close</p>
  <h2>Questions?</h2>
  <p>Giving an agent a shell is useful. Giving it your machine is not.</p>
  <div class="talk-code">/blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal
github.com/PipeOpsHQ/Rexec
/talks/sysconf-2026</div>
  <p>Alex Idowu · @nitrocode · Lagos</p>
</section>
