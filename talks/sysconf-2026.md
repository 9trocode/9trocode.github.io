---
layout: talk
title: How to Safely Give AI Agents a Terminal
description: >-
  Agents with a shell are untrusted RCE - isolation and lifecycle, not prompts.
  Live Rexec sandbox demo. Standard 30m (25 + 5 Q&A).
permalink: /talks/sysconf-2026/
event: SysConf 2026
slot: "Sat 3 Oct · 12:25-12:55 WAT · Room 1 · Standard 30m"
talk_date: 2026-10-03
# Public teaser while talk_date is in the future. Speaker: ?key= or unlock form.
# Set locked: false to make the deck public early.
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
  <p class="talk-slide__label">02 · Claim</p>
  <h2>AI agents need a terminal to be useful.<br>Giving them yours is a bad idea.</h2>
  <p>Isolation problem. Not a prompt problem.</p>
  <p>Rexec is one shape. Jobs + RuntimeClass works too.</p>
</section>

<section class="talk-slide" id="s03" data-slide="3">
  <p class="talk-slide__label">03 · Scene</p>
  <h2>Laptop. Dev VM. Shared CI runner.<br>Sometimes worse.</h2>
  <div class="talk-code">curl | bash
secrets in the environment
kubeconfig in ~/.kube</div>
  <p class="punch">You’re not doing chat. You’re doing untrusted RCE with a friendly UI.</p>
</section>

<section class="talk-slide" id="s04" data-slide="4">
  <p class="talk-slide__label">04 · Wrong default</p>
  <h2>The wrong default</h2>
  <ol>
    <li>Install the agent CLI on a machine you care about</li>
    <li>Point it at a repo</li>
    <li>Grant shell / network / package install</li>
    <li>Hope system prompts and “approve tool use” are enough</li>
  </ol>
  <p class="punch">Hope is not a control.</p>
</section>

<section class="talk-slide" id="s05" data-slide="5">
  <p class="talk-slide__label">05 · Without malice</p>
  <h2>Even without malice</h2>
  <div class="talk-grid">
    <div class="talk-card"><strong>Secrets on disk</strong><span>World-readable files</span></div>
    <div class="talk-card"><strong>Creative rm</strong><span>Path expansion surprises</span></div>
    <div class="talk-card"><strong>Exfil</strong><span>HTTPS or DNS</span></div>
    <div class="talk-card"><strong>Phone home</strong><span>Packages + thrash</span></div>
  </div>
  <p>Blast radius = the machine you care about.</p>
</section>

<section class="talk-slide" id="s06" data-slide="6">
  <p class="talk-slide__label">06 · Contrast</p>
  <h2>Human terminal vs agent terminal</h2>
  <table class="talk-table">
    <thead>
      <tr><th></th><th>Human</th><th>Agent</th></tr>
    </thead>
    <tbody>
      <tr><td>Intent</td><td>Usually intentional</td><td>Exploratory, error-prone</td></tr>
      <tr><td>Speed</td><td>Seconds between commands</td><td>Bursts of tool calls</td></tr>
      <tr><td>Oversight</td><td>Eyes on the glass</td><td>Often headless</td></tr>
      <tr><td>Network</td><td>Expects outbound</td><td>Will try outbound</td></tr>
      <tr><td>Lifecycle</td><td>Hours to days</td><td>Minutes, then delete</td></tr>
    </tbody>
  </table>
</section>

<section class="talk-slide" id="s07" data-slide="7">
  <p class="talk-slide__label">07 · Reframe</p>
  <h2>Treat it as isolation</h2>
  <p>Not a prompt problem.</p>
  <p><strong>Sandbox = create / delete + quotas + network policy + audit.</strong><br>Not a system prompt.</p>
  <p class="punch">“Approve tool use” on a machine you care about is still RCE with a dialog.</p>
</section>

<section class="talk-slide" id="s08" data-slide="8">
  <p class="talk-slide__label">08 · Requirements</p>
  <h2>What “sandbox the agent” has to mean</h2>
  <ol>
    <li>Disposable by default</li>
    <li>Hard CPU / memory / PIDs</li>
    <li>Network isolation as a first-class switch</li>
    <li>API / headless entry</li>
    <li>Audit when it matters</li>
    <li>Outbound tunnels for real metal - not open 22</li>
  </ol>
</section>

<section class="talk-slide" id="s09" data-slide="9">
  <p class="talk-slide__label">09 · Architecture</p>
  <h2>Two primitives</h2>
  <div class="talk-code">Agent / CLI / UI
        │  API or WebSocket
        ▼
Control plane - create / exec / delete
        │
        ├── Cloud terminal  (container + gVisor + limits + isolated net)
        └── BYOS agent      (outbound WebSocket → real hardware)</div>
  <p>Strong isolation ≠ strong access to weird iron. Don’t confuse them.</p>
</section>

<section class="talk-slide" id="s10" data-slide="10">
  <p class="talk-slide__label">10 · Cloud terminal</p>
  <h2>Cloud terminal</h2>
  <ul>
    <li>Docker / Podman with hard limits</li>
    <li>Cap drop + <code>no-new-privileges</code></li>
    <li>Isolated bridge, ICC off</li>
    <li>OCI runtime <code>runsc</code> (gVisor)</li>
    <li>Attach via API / WebSocket - not published SSH</li>
  </ul>
  <p class="ok">That model is what I designed into Rexec. Steal the shape.</p>
</section>

<section class="talk-slide" id="s11" data-slide="11">
  <p class="talk-slide__label">11 · Demo · Rexec</p>
  <h2>Live: disposable sandbox</h2>
  <ol>
    <li>Create a sandbox (limits + network mode)</li>
    <li>Show the isolation you asked for (egress / peer)</li>
    <li>Run something agent-shaped</li>
    <li><strong>Delete.</strong> Assume disk is gone.</li>
  </ol>
  <div class="talk-code"># shape, not scripture - use your real Rexec flow
rexec sandbox create --network none
# …attempt / show block…
rexec sandbox delete</div>
  <p class="punch">If AV fights you: screenshots. Don’t fight conference wifi.</p>
</section>

<section class="talk-slide" id="s12" data-slide="12">
  <p class="talk-slide__label">12 · Ladder</p>
  <h2>Isolation ladder</h2>
  <ol>
    <li>cgroup + caps + network - baseline</li>
    <li>gVisor (<code>runsc</code>) - smaller host syscall surface</li>
    <li>MicroVMs (Firecracker) - when the threat model demands it</li>
    <li>Dedicated nodes / accounts - compliance, not cosplay</li>
  </ol>
  <p>Containers alone aren’t a hostile multi-tenant boundary. Name the rung you’re buying.</p>
</section>

<section class="talk-slide" id="s13" data-slide="13">
  <p class="talk-slide__label">13 · Network</p>
  <h2>Network is the product</h2>
  <p>A cloud terminal is a network endpoint that happens to have a shell.</p>
  <div class="talk-grid">
    <div class="talk-card"><strong>T1</strong><span>Peer to peer</span></div>
    <div class="talk-card"><strong>T2</strong><span>Host / metadata</span></div>
    <div class="talk-card"><strong>T3</strong><span>Egress exfil</span></div>
    <div class="talk-card"><strong>T4</strong><span>Published ports</span></div>
    <div class="talk-card"><strong>T5</strong><span>Confused deputy</span></div>
  </div>
  <p>Egress: <strong>none</strong> · <strong>allowlist</strong> · <strong>full</strong> (you accepted the leak).</p>
  <p class="punch">ICC off ≠ no internet. Say it out loud.</p>
</section>

<section class="talk-slide" id="s14" data-slide="14">
  <p class="talk-slide__label">14 · Flow</p>
  <h2>Agent flow</h2>
  <div class="talk-grid">
    <div class="talk-card"><strong>1 · Create</strong><span>Image + class + network</span></div>
    <div class="talk-card"><strong>2 · Secrets</strong><span>Short-lived only</span></div>
    <div class="talk-card"><strong>3 · Run</strong><span>Headless by default</span></div>
    <div class="talk-card"><strong>4 · Attach</strong><span>Human if needed</span></div>
    <div class="talk-card"><strong>5 · Delete</strong><span>Disk + memory gone</span></div>
  </div>
</section>

<section class="talk-slide" id="s15" data-slide="15">
  <p class="talk-slide__label">15 · BYOS</p>
  <h2>BYOS: mediated access, not a jail</h2>
  <p>Outbound WebSocket. No inbound SSH for the demo.</p>
  <table class="talk-table">
    <thead><tr><th>Need</th><th>Prefer</th></tr></thead>
    <tbody>
      <tr><td>Untrusted model code</td><td>Cloud terminal + gVisor</td></tr>
      <tr><td>Real GPU / lab box</td><td>BYOS - treat like prod access</td></tr>
      <tr><td>Shared expensive machine</td><td>BYOS + identity + recording</td></tr>
    </tbody>
  </table>
</section>

<section class="talk-slide" id="s16" data-slide="16">
  <p class="talk-slide__label">16 · Failures</p>
  <h2>Failure modes I’ve hit</h2>
  <ul>
    <li><strong>Docker socket</strong> - relocates the gate</li>
    <li><strong>Open egress</strong> - agents phone home</li>
    <li><strong>Thrash</strong> - quotas / TTLs are security features</li>
    <li><strong>Prompt as security</strong> - UX, not a boundary</li>
    <li><strong>Runtime theater</strong> - gVisor on paper, runc in prod</li>
  </ul>
</section>

<section class="talk-slide" id="s17" data-slide="17">
  <p class="talk-slide__label">17 · Checklist</p>
  <h2>Field checklist</h2>
  <ol>
    <li>Ban agent shell on laptops for secrets / prod</li>
    <li>Create / delete per task (or per PR)</li>
    <li>Run agent sandboxes on gVisor or stronger</li>
    <li>Set egress deliberately; treat DNS as data</li>
    <li>Cap CPU / memory / PIDs; kill on a timer</li>
    <li>Prefer outbound agents over inbound SSH</li>
    <li>Assume breakout; escalate when the threat model says so</li>
  </ol>
</section>

<section class="talk-slide" id="s18" data-slide="18">
  <p class="talk-slide__label">18 · Takeaways</p>
  <h2>Takeaways</h2>
  <ol>
    <li>Agents are remote code execution with better UX</li>
    <li>Sandbox = create/delete + quotas + network + audit</li>
    <li>Containers alone ≠ hostile multi-tenant boundary</li>
    <li>Prefer outbound tunnels over inbound SSH</li>
    <li>TTL and concurrency caps are security features</li>
  </ol>
</section>

<section class="talk-slide" id="s19" data-slide="19">
  <p class="talk-slide__label">19 · Close</p>
  <h2>Questions?</h2>
  <div class="talk-code">/blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal
/talks/sysconf-2026
github.com/PipeOpsHQ/Rexec</div>
  <p>Alex Idowu · @nitrocode · Lagos</p>
</section>
