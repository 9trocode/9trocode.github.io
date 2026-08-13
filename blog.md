---
layout: default
title: Writing
permalink: /blog/
description: >-
  Field notes on platform engineering and cloud-native security: multi-tenant
  Kubernetes, agent sandboxes, gVisor, deploy pipelines, and production failure
  modes. By Alex Idowu (Co-founder & CTO, PipeOps).
image: /assets/images/nitrocode-og-v2.png
---

<header class="page-hero">
 <p class="eyebrow">Writing</p>
 <h1>Field notes</h1>
 <p>Platform engineering, cloud-native security, and production systems - architecture, tradeoffs, and failure modes.</p>
</header>

<ul class="write-list">
{% for post in site.posts %}
 <li class="write-item">
 <time class="write-date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %Y" }}</time>
 <div>
 <a class="write-title" href="{{ post.url }}">{{ post.title }}</a>
 {% if post.description %}<p class="write-desc">{{ post.description }}</p>{% endif %}
 {% if post.tags and post.tags.size > 0 %}
 <div class="write-tags">
 {% for tag in post.tags %}<span class="tag">{{ tag }}</span>{% endfor %}
 </div>
 {% endif %}
 </div>
 </li>
{% endfor %}
</ul>
