---
layout: default
title: Alex Idowu — Platform Engineering & Cloud-Native Security
description: Founder & CTO at PipeOps. Building cloud deployment platforms, terminal sandboxes, and security systems. Writing on Kubernetes, multi-tenancy, and production infrastructure.
image: /assets/images/nitrocode-og.png
wide: true
---

<section class="home-hero reveal">
  <div class="portrait portrait--lg">
    <img src="/assets/images/alex-idowu.png" width="140" height="140" alt="Portrait of Alex Idowu" />
  </div>
  <p class="home-kicker">Alex Idowu · Lagos · <a href="https://twitter.com/nitrocode">@nitrocode</a></p>
  <h1>I build platforms that make infrastructure disappear.</h1>
  <p class="home-lede">Founder &amp; CTO of <a href="https://pipeops.io">PipeOps</a>. I design cloud deployment systems, secure sandboxes, and open source infrastructure tools — and write about what works in production.</p>
  <p class="home-focus">Platform engineering · Multi-tenant Kubernetes · Cloud-native security · Agent sandboxes</p>
  <p class="home-cta">
    <a class="btn btn--primary" href="/blog/">Read the writing</a>
    <a class="btn btn--secondary" href="/about/">About me</a>
    <a class="btn btn--secondary" href="https://github.com/9trocode" target="_blank" rel="noopener">GitHub</a>
  </p>
</section>

<section class="section">
  <p class="section-label">Selected work</p>
  <h2 class="section-title">What I’m building</h2>
  <p class="section-intro">Production platforms and open tools at the intersection of developer experience and security.</p>

  <div class="card-grid">
    <div class="card">
      <span class="card-eyebrow">Company</span>
      <h3><a href="https://pipeops.io">PipeOps</a></h3>
      <p>Deployment platform for startups and engineering teams. Multi-cloud provisioning, BuildKit builds, Kubernetes runtime, BYOS agents — Go services in production.</p>
    </div>
    <div class="card">
      <span class="card-eyebrow">Open source</span>
      <h3><a href="https://github.com/PipeOpsHQ/Rexec">Rexec</a></h3>
      <p>Terminal control room: network-isolated cloud terminals, BYOS agents, session recording, and sandboxes for CLI and AI agent testing.</p>
    </div>
    <div class="card">
      <span class="card-eyebrow">Security</span>
      <h3>Aeon</h3>
      <p>Security software for high-trust organizations — risk discovery, remediation, policy, and compliance across cloud, on-prem, and hybrid.</p>
    </div>
    <div class="card">
      <span class="card-eyebrow">Open source</span>
      <h3><a href="https://github.com/9trocode/OpenFing">OpenFing</a></h3>
      <p>Privacy-first network scanner in Zig. Local-only discovery — no accounts, no cloud upload of your topology.</p>
    </div>
  </div>
</section>

<section class="section">
  <p class="section-label">Engineering</p>
  <h2 class="section-title">Patterns I ship</h2>
  <p class="section-intro">Isolation, deploy pipelines, and secure access — designed under real product constraints.</p>
  <ul class="work-list">
    <li><strong>Multi-tenant Kubernetes</strong> Capsule, network policies, and proxy boundaries for shared clusters. <a href="/blog/2024/11/01/nova-multitenancy">Nova →</a></li>
    <li><strong>Deploy architecture</strong> BuildKit, RabbitMQ job queues, Go runners. <a href="/blog/2024/10/31/how-pipeops-deploys">How PipeOps deploys →</a></li>
    <li><strong>Multi-cloud Terraform runners</strong> AWS, GCP, Azure at product scale. <a href="/blog/2024/10/31/runner-terraform-provisioning">The Runner →</a></li>
    <li><strong>BYOS agents</strong> Manage hosts without exposing the Kubernetes API. <a href="/blog/2024/11/01/pipeops-agent-installer">PipeOps agent →</a></li>
    <li><strong>Terminal sandboxes</strong> Disposable, isolated environments for tools and agents. <a href="/blog/2026/02/27/rexec-terminal-control-room">Rexec →</a></li>
  </ul>
</section>

<section class="section">
  <p class="section-label">Writing</p>
  <h2 class="section-title">Recent essays</h2>
  <p class="section-intro">Engineer-to-engineer: architecture, failure modes, and production lessons.</p>
  <ul class="post-list">
  {% for post in site.posts limit:5 %}
    <li class="post-list-item">
      <a class="post-list-title" href="{{ post.url }}">{{ post.title }}</a>
      <span class="post-list-meta">{{ post.date | date: "%b %d, %Y" }}</span>
      {% if post.description %}<p class="post-list-desc">{{ post.description }}</p>{% endif %}
    </li>
  {% endfor %}
  </ul>
  <p class="home-more"><a href="/blog/">View all writing →</a></p>
</section>

<section class="connect-strip">
  <h2>Let’s connect</h2>
  <p>Building in public. Open to thoughtful collaboration and hard infrastructure problems.</p>
  <ul class="connect-links">
    <li><a href="https://twitter.com/nitrocode" target="_blank" rel="noopener">X / Twitter</a></li>
    <li><a href="https://www.linkedin.com/in/nitrocode/" target="_blank" rel="noopener">LinkedIn</a></li>
    <li><a href="https://github.com/9trocode" target="_blank" rel="noopener">GitHub</a></li>
    <li><a href="https://pipeops.io" target="_blank" rel="noopener">PipeOps</a></li>
    <li><a href="/blog/">Writing</a></li>
  </ul>
</section>
