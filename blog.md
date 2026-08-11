---
layout: default
title: Writing
permalink: /blog/
description: Technical writing by Alex Idowu on platform engineering, Kubernetes, cloud-native security, multi-tenancy, Terraform, and production systems.
image: /assets/images/nitrocode-og.png
---

<header class="page-hero">
  <p class="section-label">Writing</p>
  <h1>Essays &amp; deep dives</h1>
  <p>Platform engineering, cloud-native security, and production infrastructure — architecture, tradeoffs, and failure modes. No fluff.</p>
</header>

<ul class="post-list post-list-full">
{% for post in site.posts %}
  <li class="post-list-item">
    <a class="post-list-title" href="{{ post.url }}">{{ post.title }}</a>
    <div class="post-list-meta">
      <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %d, %Y" }}</time>
      {% if post.tags and post.tags.size > 0 %}
        <span class="post-list-tags">
          {% for tag in post.tags %}
            <span class="tag">{{ tag }}</span>
          {% endfor %}
        </span>
      {% endif %}
    </div>
    {% if post.description %}
    <p class="post-list-desc">{{ post.description }}</p>
    {% endif %}
  </li>
{% endfor %}
</ul>
