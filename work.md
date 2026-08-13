---
layout: default
title: Work
permalink: /work/
description: Catalogue of platforms, Kubernetes tooling, isolation work, and open source by Alex Idowu.
image: /assets/images/nitrocode-og-v2.png
---

<header class="page-hero">
  <p class="eyebrow">Work</p>
  <h1>Catalogue</h1>
  <p>Things I’ve built or shipped: products, senior/lead roles (companies as projects), Kubernetes tooling, isolation, and open source. Growing list - not exhaustive.</p>
</header>

{% assign kinds = "Company,Roles,Open source,Dream project,Security" | split: "," %}
{% for kind in kinds %}
  {% assign group = site.data.work | where: "kind", kind %}
  {% if group.size > 0 %}
  <section class="block work-group">
    <div class="block__head">
      <p class="block__num">{{ forloop.index | prepend: "0" | slice: -2, 2 }}</p>
      <div>
        <h2 class="block__title">{% if kind == "Roles" %}Roles (senior &amp; lead){% else %}{{ kind }}{% endif %}</h2>
        {% if kind == "Roles" %}
        <p class="block__sub">Employers where the work was senior or lead-level. Each company is also a project context.</p>
        {% endif %}
      </div>
    </div>
    <ul class="project-list project-list--full">
      {% for item in group %}
      <li class="project">
        <span class="project__kind">{% if item.role %}{{ item.role }}{% else %}{{ item.kind }}{% endif %}</span>
        <div class="project__body">
          <h3>{% if item.url and item.url != "" %}<a href="{{ item.url }}"{% if item.url contains "http" %} target="_blank" rel="noopener"{% endif %}>{{ item.name }}</a>{% else %}{{ item.name }}{% endif %}</h3>
          {% if item.period %}<p class="project__period">{{ item.period }}</p>{% endif %}
          <p>{{ item.summary }}</p>
          {% if item.tags %}
          <div class="write-tags">
            {% for tag in item.tags %}<span class="tag">{{ tag }}</span>{% endfor %}
          </div>
          {% endif %}
        </div>
        {% if item.url and item.url != "" %}
        <a class="project__go" href="{{ item.url }}"{% if item.url contains "http" %} target="_blank" rel="noopener"{% endif %}>{{ item.link_label | default: "Link" }} ↗</a>
        {% else %}
        <span class="project__go">{{ item.link_label | default: "In progress" }}</span>
        {% endif %}
      </li>
      {% endfor %}
    </ul>
  </section>
  {% endif %}
{% endfor %}

<p class="work-foot">
  <a class="btn btn--ghost" href="{{ '/about/' | relative_url }}">About</a>
  <a class="btn btn--ghost" href="https://github.com/9trocode" target="_blank" rel="noopener">GitHub</a>
  <a class="btn btn--ghost" href="https://github.com/PipeOpsHQ" target="_blank" rel="noopener">PipeOpsHQ</a>
</p>
