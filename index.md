---
layout: default
title: Alex Idowu — Platform Engineering & Cloud-Native Security
description: Founder & CTO at PipeOps. Building cloud deployment platforms, terminal sandboxes, and security systems. Writing on Kubernetes, multi-tenancy, and production infrastructure.
image: /assets/images/nitrocode-og.png
---

<div class="home-hero">

<p class="home-kicker">Alex Idowu · Lagos · <a href="https://twitter.com/nitrocode">@nitrocode</a></p>

# I build platforms that make infrastructure disappear.

I'm the **Founder & CTO of [PipeOps](https://pipeops.io)** — a cloud deployment platform that takes teams from code to production without a full DevOps org. I also build open source infrastructure tools and security systems, and write about what actually works in production.

**Focus:** platform engineering · multi-tenant Kubernetes · cloud-native security · agent sandboxes · multi-cloud automation

<p class="home-cta">
  <a class="btn-cta" href="/blog/">Read the writing</a>
  <a class="btn-cta btn-cta-ghost" href="/about/">About me</a>
  <a class="btn-cta btn-cta-ghost" href="https://github.com/9trocode" target="_blank" rel="noopener">GitHub</a>
</p>

</div>

---

## What I'm building

<div class="card-grid">

<div class="card">

### [PipeOps](https://pipeops.io)

Deployment platform for startups and engineering teams. Multi-cloud provisioning, BuildKit builds, Kubernetes runtime, BYOS agents — Go services in production.

</div>

<div class="card">

### [Rexec](https://github.com/PipeOpsHQ/Rexec)

Terminal control room: network-isolated cloud terminals, BYOS agents, session recording, sandboxes for CLI and AI agent testing. Open source.

</div>

<div class="card">

### Aeon

Security software for high-trust organizations — risk discovery, remediation, policy, and compliance across cloud, on-prem, and hybrid.

</div>

<div class="card">

### [OpenFing](https://github.com/9trocode/OpenFing)

Privacy-first network scanner in Zig. Local-only discovery — no accounts, no cloud upload of your topology.

</div>

</div>

---

## Selected technical work

Patterns I design and ship — isolation, deploy pipelines, and secure access:

- **Multi-tenant Kubernetes** — Capsule, network policies, and proxy boundaries for shared clusters ([Nova](/blog/2024/11/01/nova-multitenancy))
- **Deploy architecture** — BuildKit, RabbitMQ job queues, Go runners ([How PipeOps deploys](/blog/2024/10/31/how-pipeops-deploys))
- **Multi-cloud Terraform runners** — AWS, GCP, Azure provisioning at product scale ([The Runner](/blog/2024/10/31/runner-terraform-provisioning))
- **BYOS agents** — manage hosts without exposing the Kubernetes API ([PipeOps agent](/blog/2024/11/01/pipeops-agent-installer))
- **Terminal sandboxes** — disposable, isolated environments for tools and agents ([Rexec](/blog/2026/02/27/rexec-terminal-control-room))

---

## Recent writing

I write engineer-to-engineer: architecture, failure modes, and production lessons. No marketing fluff.

<ul class="post-list">
{% for post in site.posts limit:5 %}
  <li class="post-list-item">
    <a class="post-list-title" href="{{ post.url }}">{{ post.title }}</a>
    <span class="post-list-meta">{{ post.date | date: "%b %d, %Y" }}</span>
    {% if post.description %}
    <p class="post-list-desc">{{ post.description }}</p>
    {% endif %}
  </li>
{% endfor %}
</ul>

<p class="home-more"><a href="/blog/">All writing →</a></p>

---

## Connect

| | |
|---|---|
| **X / Twitter** | [@nitrocode](https://twitter.com/nitrocode) |
| **LinkedIn** | [linkedin.com/in/nitrocode](https://www.linkedin.com/in/nitrocode/) |
| **GitHub** | [@9trocode](https://github.com/9trocode) |
| **Company** | [pipeops.io](https://pipeops.io) |
| **Writing** | [nitrocode.sh/blog](/blog/) |
