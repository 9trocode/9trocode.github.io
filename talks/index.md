---
layout: default
title: Talks
permalink: /talks/
description: >-
  Conference talks by Alex Idowu — agent sandboxes, isolation, and production
  systems. Presentable decks and field notes.
image: /assets/images/nitrocode-og-v2.png
---

<header class="page-hero">
  <p class="eyebrow">Talks</p>
  <h1>On stage</h1>
  <p>Isolation, agent sandboxes, and production systems — decks you can open and present.</p>
</header>

{% assign talk_pages = site.pages | where: "layout", "talk" %}
{% assign talk_pages = talk_pages | sort: "talk_date" | reverse %}

{% if talk_pages.size == 0 %}
<p>No talks listed yet.</p>
{% else %}
<ul class="write-list">
  {% for talk in talk_pages %}
  <li class="write-item">
    <time class="write-date" datetime="{{ talk.talk_date }}">{% if talk.talk_date %}{{ talk.talk_date | date: "%b %Y" }}{% else %}TBD{% endif %}</time>
    <div>
      <a class="write-title" href="{{ talk.url | relative_url }}">{{ talk.title }}</a>
      {% if talk.event %}<p class="write-desc"><strong>{{ talk.event }}</strong>{% if talk.slot %} · {{ talk.slot }}{% endif %}</p>{% endif %}
      {% if talk.description %}<p class="write-desc">{{ talk.description }}</p>{% endif %}
      <p class="write-desc">
        <a href="{{ talk.url | relative_url }}">Deck</a>
        ·
        <a href="{{ talk.url | relative_url }}?present=1">Present</a>
        {% if talk.blog %}
        ·
        <a href="{{ talk.blog | relative_url }}">Field notes</a>
        {% endif %}
      </p>
    </div>
  </li>
  {% endfor %}
</ul>
{% endif %}
