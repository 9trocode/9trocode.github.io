---
layout: talk
title: How to Safely Give AI Agents a Terminal
description: >-
  If your agent (or someone else's) gets a shell on a machine you care about,
  this is the isolation pattern I ship - disposable terminals, limits, network,
  gVisor, outbound BYOS. Live Rexec demo. Not a prompting talk.
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
  <p class="talk-slide__label">02 · Who this is for</p>
  <h2>Who this is for</h2>
  <p>Anyone giving an agent a <strong>shell</strong> on infra you care about.</p>
  <ul>
    <li>You <strong>use</strong> coding agents on a laptop, bastion, or CI runner</li>
    <li>You <strong>build</strong> products where agents exec commands for users</li>
    <li>Platform / SRE / security owning the blast radius</li>
  </ul>
  <p class="punch">Not a prompting talk. Not “how to build an agent.”</p>
  <p>Sandbox and lifecycle. I hit this building Rexec and shipping multi-tenant platforms.</p>
</section>

<section class="talk-slide" id="s03" data-slide="3">
  <p class="talk-slide__label">03 · The claim</p>
  <h2>AI agents need a terminal to be useful.<br>Giving them yours is a bad idea.</h2>
  <p>The moment the model runs <code>npm install</code>, <code>curl | bash</code>, or “explore the filesystem,” you left chat.</p>
  <p class="punch">Untrusted remote code execution with a friendly UI.</p>
</section>

<section class="talk-slide" id="s04" data-slide="4">
  <p class="talk-slide__label">04 · What people actually do</p>
  <h2>What people actually do</h2>
  <ol>
    <li>Install Cursor / Claude Code / some agent CLI on a laptop</li>
    <li>Point it at a real repo</li>
    <li>Leave network + package install on</li>
    <li>Trust system prompts and “approve tool use”</li>
  </ol>
  <p>Same pattern on a bastion or shared runner - just a bigger blast radius.</p>
  <p class="punch">Hope is not a control.</p>
</section>

<section class="talk-slide" id="s05" data-slide="5">
  <p class="talk-slide__label">05 · What breaks</p>
  <h2>What breaks (no jailbreak required)</h2>
  <ul>
    <li>Secrets written to world-readable files</li>
    <li><code>rm -rf</code> with a creative path expansion</li>
    <li>Env vars leaving over HTTPS <em>or</em> DNS</li>
    <li>Packages that phone home</li>
    <li>Production kubeconfigs sitting in <code>~/.kube</code></li>
    <li>Three package managers, half-broken state, “works in the agent’s world”</li>
  </ul>
  <p>Models sound careful. They still thrash. Blast radius = that machine.</p>
</section>

<section class="talk-slide" id="s06" data-slide="6">
  <p class="talk-slide__label">06 · Why human SSH habits fail</p>
  <h2>Why “I SSH carefully” is not enough</h2>
  <table class="talk-table">
    <thead>
      <tr><th></th><th>You</th><th>The agent</th></tr>
    </thead>
    <tbody>
      <tr><td>Pace</td><td>One command, think</td><td>Burst of tool calls</td></tr>
      <tr><td>Intent</td><td>Usually deliberate</td><td>Explores and retries</td></tr>
      <tr><td>Network</td><td>You decide outbound</td><td>It will try outbound</td></tr>
      <tr><td>Lifetime</td><td>Hours is fine</td><td>Should die in minutes</td></tr>
    </tbody>
  </table>
  <p>Same Docker host. Different threat model.</p>
</section>

<section class="talk-slide" id="s07" data-slide="7">
  <p class="talk-slide__label">07 · What I mean by sandbox</p>
  <h2>What I mean by sandbox</h2>
  <p>Not a system prompt. Not a longer “be careful” instruction.</p>
  <p><strong>Create → hard limits → network mode → run → delete.</strong></p>
  <p>Optional: record the session when the risk is high.</p>
  <p class="punch">“Approve tool use” on your laptop is still RCE with a dialog.</p>
</section>

<section class="talk-slide" id="s08" data-slide="8">
  <p class="talk-slide__label">08 · Checklist I actually use</p>
  <h2>Checklist I actually use</h2>
  <ol>
    <li>Disposable - no leftover container from Tuesday</li>
    <li>CPU / memory / PID caps (disk if the host can)</li>
    <li>Network chosen at create time - not “we’ll lock it later”</li>
    <li>API / headless attach - agents don’t click xterm</li>
    <li>Prefer outbound tunnels for real machines - not open port 22</li>
  </ol>
  <p>Platform engineering: terminals as create/delete primitives.</p>
</section>

<section class="talk-slide" id="s09" data-slide="9">
  <p class="talk-slide__label">09 · Two shapes I ship</p>
  <h2>Two shapes I ship in Rexec</h2>
  <div class="talk-grid">
    <div class="talk-card">
      <strong>1 · Disposable cloud terminal</strong>
      <span>Fresh Linux box. Strong isolation. Weak access to weird iron (GPU lab, that one Hetzner).</span>
    </div>
    <div class="talk-card">
      <strong>2 · BYOS outbound agent</strong>
      <span>Process on your machine opens an outbound WebSocket. Real hardware. Mediated access - not a jail.</span>
    </div>
  </div>
  <p>Don’t confuse them. Most teams eventually need both.</p>
</section>

<section class="talk-slide" id="s10" data-slide="10">
  <p class="talk-slide__label">10 · What the container looks like</p>
  <h2>What the container looks like</h2>
  <ul>
    <li>Docker / Podman with hard CPU, memory, PID limits</li>
    <li>Capabilities dropped + <code>no-new-privileges</code></li>
    <li>Bridge with ICC off (<code>rexec-isolated</code> in our stack)</li>
    <li>OCI runtime <code>runsc</code> - gVisor, not stock runc by default</li>
    <li>Attach over API / WebSocket - no published SSH into the sandbox</li>
  </ul>
  <p>Copy the shape even if you never run Rexec. Jobs + RuntimeClass + NetworkPolicy gets you most of the way.</p>
</section>

<section class="talk-slide" id="s11" data-slide="11">
  <p class="talk-slide__label">11 · Live demo</p>
  <h2>Live: create → prove isolation → delete</h2>
  <ol>
    <li>Create a sandbox with network locked down</li>
    <li>Show the block (egress or peer) - not a slide claim</li>
    <li>Run something agent-shaped</li>
    <li><strong>Delete.</strong> Treat disk and memory as gone</li>
  </ol>
  <div class="talk-code"># your real Rexec flow - not scripture
rexec sandbox create --network none
# show the failure / block
rexec sandbox delete</div>
  <p>Wifi bad? Screenshots of the same four steps. Don’t fight the venue network.</p>
</section>

<section class="talk-slide" id="s12" data-slide="12">
  <p class="talk-slide__label">12 · How hard is hard enough</p>
  <h2>How hard is hard enough</h2>
  <ol>
    <li><strong>cgroup + caps + network</strong> - baseline hygiene</li>
    <li><strong>gVisor (<code>runsc</code>)</strong> - smaller host syscall surface (what I default for agents)</li>
    <li><strong>Firecracker / microVM</strong> - when the threat model or compliance says so</li>
    <li><strong>Dedicated node / account</strong> - real isolation budget, not cosplay</li>
  </ol>
  <p>Same honesty as soft vs hard multi-tenancy: containers alone are not a hostile multi-tenant boundary. Name the rung you’re buying.</p>
</section>

<section class="talk-slide" id="s13" data-slide="13">
  <p class="talk-slide__label">13 · Network (the part people skip)</p>
  <h2>Network is where this usually fails</h2>
  <p>A sandbox with a shell is a network endpoint. If you only isolate the filesystem, you left the door open.</p>
  <ul>
    <li>Sandbox talking to another sandbox</li>
    <li>Hitting the host / cloud metadata</li>
    <li>Exfil over normal HTTPS</li>
    <li>Exfil over DNS</li>
    <li>Published ports “just for the demo”</li>
  </ul>
  <p>Pick egress at create time: <strong>none</strong>, <strong>allowlist</strong>, or <strong>full</strong> (you accepted the leak).</p>
  <p class="punch">ICC off is not “no internet.” Say that in the design review.</p>
</section>

<section class="talk-slide" id="s14" data-slide="14">
  <p class="talk-slide__label">14 · Session lifecycle</p>
  <h2>Session lifecycle</h2>
  <ol>
    <li><strong>Create</strong> - image, limits, network mode</li>
    <li><strong>Inject secrets</strong> - short-lived only</li>
    <li><strong>Run</strong> - headless by default</li>
    <li><strong>Attach</strong> - only if a human must intervene</li>
    <li><strong>Delete</strong> - the security feature people forget</li>
  </ol>
  <p>Long-lived “dev sandboxes” become bastions with worse accountability.</p>
</section>

<section class="talk-slide" id="s15" data-slide="15">
  <p class="talk-slide__label">15 · When you need the real box</p>
  <h2>When you need the real box (BYOS)</h2>
  <p>GPU box. Lab server. That machine with the special NIC.</p>
  <p>Outbound WebSocket from the host. No inbound SSH for the demo.</p>
  <table class="talk-table">
    <thead><tr><th>Need</th><th>What I prefer</th></tr></thead>
    <tbody>
      <tr><td>Untrusted model code</td><td>Disposable terminal + gVisor</td></tr>
      <tr><td>Real GPU / lab hardware</td><td>BYOS - treat it like prod access</td></tr>
      <tr><td>Shared expensive machine</td><td>BYOS + identity + session recording</td></tr>
    </tbody>
  </table>
  <p>Mediated access is not a jail. Don’t market it as one.</p>
</section>

<section class="talk-slide" id="s16" data-slide="16">
  <p class="talk-slide__label">16 · Failures I’ve shipped into</p>
  <h2>Failures I’ve shipped into</h2>
  <ul>
    <li><strong>Docker socket in the “sandbox”</strong> - you moved the gate, you didn’t close it</li>
    <li><strong>Full egress by default</strong> - agents phone home; you can’t say which session left</li>
    <li><strong>No concurrency / TTL caps</strong> - one thrashing agent OOMs the host</li>
    <li><strong>Prompt as the boundary</strong> - UX, not isolation</li>
    <li><strong>gVisor in the README, runc in prod</strong> - RuntimeClass theater</li>
  </ul>
</section>

<section class="talk-slide" id="s17" data-slide="17">
  <p class="talk-slide__label">17 · Steal this</p>
  <h2>Steal this</h2>
  <ol>
    <li>No agent shell on laptops for secrets / prod paths</li>
    <li>One sandbox per task (or per PR) - then delete</li>
    <li>gVisor or stronger for untrusted agent code</li>
    <li>Egress on purpose; treat DNS as data</li>
    <li>CPU / memory / PID caps + a hard TTL</li>
    <li>Outbound agents over inbound SSH for fleet boxes</li>
    <li>Assume breakout; escalate the rung when the threat model says so</li>
  </ol>
</section>

<section class="talk-slide" id="s18" data-slide="18">
  <p class="talk-slide__label">18 · If you remember five things</p>
  <h2>If you remember five things</h2>
  <ol>
    <li>Agent + shell = untrusted RCE with better UX</li>
    <li>Sandbox = create, limit, network, delete - not a system prompt</li>
    <li>Stock containers are not hostile multi-tenant isolation by themselves</li>
    <li>Outbound tunnels beat inbound SSH for real hardware</li>
    <li>TTL and concurrency caps are security features when models thrash</li>
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
