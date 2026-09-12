---
layout: default
title: Talks
permalink: /talks/
description: >-
  Conference talks by Alex Idowu — agent sandboxes, isolation, IaC, and
  production systems. Decks, PDFs, and field notes.
image: /assets/images/nitrocode-og-v2.png
---

<header class="page-hero">
  <p class="eyebrow">Talks</p>
  <h1>On stage</h1>
  <p>Isolation, agent sandboxes, IaC, and production systems — decks and PDFs.</p>
</header>

{% assign talk_pages = site.pages | where_exp: "p", "p.talk_date != nil" %}
{% assign talk_pages = talk_pages | sort: "talk_date" | reverse %}

{% if talk_pages.size == 0 %}
<p>No talks listed yet.</p>
{% else %}
<ul class="write-list">
  {% for talk in talk_pages %}
  <li class="write-item">
    <time class="write-date" datetime="{{ talk.talk_date }}">{{ talk.talk_date | date: "%b %Y" }}</time>
    <div>
      <a class="write-title" href="{{ talk.url | relative_url }}">{{ talk.title }}</a>
      {% if talk.event %}<p class="write-desc"><strong>{{ talk.event }}</strong>{% if talk.slot %} · {{ talk.slot }}{% endif %}</p>{% endif %}
      {% if talk.description %}<p class="write-desc">{{ talk.description }}</p>{% endif %}
      <p class="write-desc">
        <a href="{{ talk.url | relative_url }}">Page</a>
        {% if talk.layout == "talk" %}
        ·
        <a href="{{ talk.url | relative_url }}?present=1">Present</a>
        {% endif %}
        {% if talk.pdf %}
        ·
        <a href="{{ talk.pdf | relative_url }}" target="_blank" rel="noopener">PDF</a>
        {% endif %}
        {% if talk.blog %}
        ·
        <a href="{{ talk.blog | relative_url }}">Field notes</a>
        {% endif %}
        {% if talk.repo %}
        ·
        <a href="{{ talk.repo }}" target="_blank" rel="noopener">Repo</a>
        {% endif %}
        {% if talk.video %}
        ·
        <a href="{{ talk.video }}" target="_blank" rel="noopener">Recording</a>
        {% endif %}
      </p>
    </div>
  </li>
  {% endfor %}
</ul>
{% endif %}
