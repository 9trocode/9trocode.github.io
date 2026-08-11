---
layout: default
title: Alex Idowu - Platform Engineering & Cloud-Native Security
description: Founder & CTO at PipeOps. I build cloud deployment platforms, terminal sandboxes, and security systems, and write about Kubernetes, multi-tenancy, and production infrastructure.
image: /assets/images/nitrocode-og.png
---

<section class="hero">
 <div class="hero__copy">
 <p class="hero__index">Founder &amp; CTO · Lagos</p>
 <h1 class="hero__title">Platforms that make infrastructure <em>disappear.</em></h1>
 <p class="hero__lede">I’m Alex Idowu. I design multi-cloud deploy systems, secure terminal sandboxes, and open tools at the edge of platform engineering and cloud-native security - then write down what actually survives production.</p>
 <ul class="hero__meta">
 <li>PipeOps</li>
 <li>Igris</li>
 <li>Rexec</li>
 <li>Aeon</li>
 </ul>
 <p class="hero__actions">
 <a class="btn btn--solid" href="/blog/">Read writing</a>
 <a class="btn btn--ghost" href="/about/">About</a>
 <a class="btn btn--ghost" href="https://github.com/9trocode" target="_blank" rel="noopener">GitHub</a>
 </p>
 </div>
 <div class="hero__visual">
 <div class="hero__orbit" aria-hidden="true"><span>Est.<br />2012</span></div>
 <div class="hero__frame">
 <img src="/assets/images/alex-idowu.png" width="480" height="600" alt="Alex Idowu" />
 <span class="hero__badge">@nitrocode</span>
 </div>
 </div>
</section>

<section class="block">
 <div class="block__head">
 <p class="block__num">01 - Work</p>
 <div>
 <h2 class="block__title">What I’m building</h2>
 <p class="block__sub">Company product, a long-running personal agent dream, security systems, and isolation tooling.</p>
 </div>
 </div>
 <ul class="project-list">
 <li class="project">
 <span class="project__kind">Company</span>
 <div class="project__body">
 <h3><a href="https://pipeops.io">PipeOps</a></h3>
 <p>Code-to-cloud deployment platform: multi-cloud provisioning, BuildKit, Kubernetes runtime, BYOS agents - Go services in production.</p>
 </div>
 <a class="project__go" href="https://pipeops.io" target="_blank" rel="noopener">Visit ↗</a>
 </li>
 <li class="project">
 <span class="project__kind">Dream project</span>
 <div class="project__body">
 <h3><a href="https://github.com/9trocode/Igris">Igris</a></h3>
 <p>Voice-only personal AI agent - Go brain, Apple clients, arc-reactor UI. The grown-up return of a 2014/15 OAU prototype that answered “hey Jarvis,” opened apps, and shut down the PC before the world was ready.</p>
 </div>
 <a class="project__go" href="https://github.com/9trocode/Igris" target="_blank" rel="noopener">Repo ↗</a>
 </li>
 <li class="project">
 <span class="project__kind">Open source</span>
 <div class="project__body">
 <h3><a href="https://github.com/PipeOpsHQ/Rexec">Rexec</a></h3>
 <p>Terminal control room - network-isolated cloud terminals, outbound agents, recordings, sandboxes for CLIs and AI agents.</p>
 </div>
 <a class="project__go" href="https://github.com/PipeOpsHQ/Rexec" target="_blank" rel="noopener">Repo ↗</a>
 </li>
 <li class="project">
 <span class="project__kind">Security</span>
 <div class="project__body">
 <h3>Aeon</h3>
 <p>Security software for high-trust orgs: discovery, remediation, policy, compliance across cloud, on-prem, and hybrid.</p>
 </div>
 <span class="project__go">In progress</span>
 </li>
 <li class="project">
 <span class="project__kind">Open source</span>
 <div class="project__body">
 <h3><a href="https://github.com/9trocode/OpenFing">OpenFing</a></h3>
 <p>Privacy-first network scanner in Zig. Local discovery only - no accounts, no topology leaving your machine.</p>
 </div>
 <a class="project__go" href="https://github.com/9trocode/OpenFing" target="_blank" rel="noopener">Repo ↗</a>
 </li>
 </ul>
</section>

<section class="block">
 <div class="block__head">
 <p class="block__num">02 - Patterns</p>
 <div>
 <h2 class="block__title">Systems I’ve shipped</h2>
 <p class="block__sub">Isolation, deploy pipelines, and secure access under product pressure.</p>
 </div>
 </div>
 <div class="pattern-grid">
 <div class="pattern">
 <strong>Multi-tenant Kubernetes</strong>
 <span>Capsule, NetworkPolicy, API proxy, and gVisor for tenant workloads. </span>
 <a href="/blog/2026/08/11/multi-tenant-kubernetes-namespaces-arent-enough">Deep dive →</a>
 </div>
 <div class="pattern">
 <strong>Deploy architecture</strong>
 <span>BuildKit, RabbitMQ queues, Go runners end-to-end. </span>
 <a href="/blog/2024/10/31/how-pipeops-deploys">Deep dive →</a>
 </div>
 <div class="pattern">
 <strong>Multi-cloud runners</strong>
 <span>Terraform provisioning across AWS, GCP, Azure. </span>
 <a href="/blog/2024/10/31/runner-terraform-provisioning">The Runner →</a>
 </div>
 <div class="pattern">
 <strong>BYOS + gVisor sandboxes</strong>
 <span>Outbound agents; disposable terminals isolated with runsc. </span>
 <a href="/blog/2026/08/11/agent-terminal-sandboxes-isolation">Agent sandboxes →</a>
 </div>
 </div>
</section>

<section class="block">
 <div class="block__head">
 <p class="block__num">03 - Writing</p>
 <div>
 <h2 class="block__title">Recent essays</h2>
 <p class="block__sub">Engineer-to-engineer notes: architecture, failure modes, production lessons.</p>
 </div>
 </div>
 <ul class="write-list">
 {% for post in site.posts limit:5 %}
 <li class="write-item">
 <time class="write-date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %Y" }}</time>
 <div>
 <a class="write-title" href="{{ post.url }}">{{ post.title }}</a>
 {% if post.description %}<p class="write-desc">{{ post.description }}</p>{% endif %}
 </div>
 </li>
 {% endfor %}
 </ul>
 <p class="block__more"><a href="/blog/">Full index of writing →</a></p>
</section>

<section class="connect">
 <div>
 <h2>Elsewhere</h2>
 <p>Building in public. Open to hard infrastructure problems and thoughtful collaboration.</p>
 </div>
 <ul class="connect__links">
 <li><a href="https://twitter.com/nitrocode" target="_blank" rel="noopener">X / Twitter</a></li>
 <li><a href="https://www.linkedin.com/in/nitrocode/" target="_blank" rel="noopener">LinkedIn</a></li>
 <li><a href="https://github.com/9trocode" target="_blank" rel="noopener">GitHub</a></li>
 <li><a href="https://pipeops.io" target="_blank" rel="noopener">PipeOps</a></li>
 <li><a href="/blog/">Writing</a></li>
 </ul>
</section>
