---
layout: default
title: Platform engineering, multi-tenant isolation & cloud-native security
description: >-
  Co-founder & CTO at PipeOps. Field notes on Kubernetes platforms, multi-tenant
  isolation, agent sandboxes, gVisor, and cloud-native security. Building Aeon.
  Lagos.
image: /assets/images/nitrocode-og-v2.png
---

<section class="hero">
 <div class="hero__copy">
 <p class="hero__index">Co-founder &amp; CTO · Lagos</p>
 <h1 class="hero__title">
  <span class="hero__title-fixed">I</span>
  <span class="hero__verb-slot" aria-hidden="true">
   <span class="hero__verb" id="hero-verb" data-words="build,operate,ship">build</span>
  </span>
  <span class="hero__title-fixed">systems.</span>
  <span class="visually-hidden">I build, operate, and ship systems.</span>
 </h1>
 <p class="hero__lede">Hi. If you care how Kubernetes actually works - operators, shims, CSI, agents, multi-tenant isolation, sandboxes, self-hosted gateways - pull up a chair. Field notes from production.</p>
 <ul class="hero__meta">
 <li>PipeOps</li>
 <li>K8s Agent</li>
 <li>Rexec</li>
 <li>firecracker-shim</li>
 <li>Igris</li>
 <li>Aeon</li>
 </ul>
 <p class="hero__actions">
 <a class="btn btn--solid" href="/blog/">Read writing</a>
 <a class="btn btn--ghost" href="/work/">Work</a>
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
 <p class="block__sub">A short cut of the catalogue. Full list on <a href="/work/">Work</a>.</p>
 </div>
 </div>
 <ul class="project-list">
 {% assign home_work = site.data.work | where: "home", true %}
 {% for item in home_work %}
 <li class="project">
 <span class="project__kind">{{ item.kind }}</span>
 <div class="project__body">
 <h3>{% if item.url and item.url != "" %}<a href="{{ item.url }}"{% if item.url contains "http" %} target="_blank" rel="noopener"{% endif %}>{{ item.name }}</a>{% else %}{{ item.name }}{% endif %}</h3>
 <p>{{ item.summary }}</p>
 </div>
 {% if item.url and item.url != "" %}
 <a class="project__go" href="{{ item.url }}"{% if item.url contains "http" %} target="_blank" rel="noopener"{% endif %}>{{ item.link_label | default: "Link" }} ↗</a>
 {% else %}
 <span class="project__go">{{ item.link_label | default: "In progress" }}</span>
 {% endif %}
 </li>
 {% endfor %}
 </ul>
 <p class="project-list__more">
 <a class="btn btn--ghost" href="{{ '/work/' | relative_url }}">See full catalogue →</a>
 </p>
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
 <a href="/blog/2026/08/11/namespaces-arent-isolation">Deep dive →</a>
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
 <a href="/blog/2026/08/11/how-to-safely-give-ai-agents-a-terminal">Safe agent terminals →</a>
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
 <li><a href="/work/">Work catalogue</a></li>
 <li><a href="/blog/">Writing</a></li>
 </ul>
</section>
