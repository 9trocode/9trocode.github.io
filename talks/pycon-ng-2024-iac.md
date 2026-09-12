---
layout: default
title: Infrastructure as Code with Python
description: >-
  AWS CDK, Terraform, CDKTF, and Pulumi - when to use which. PyCon Nigeria 2024
  talk with deck and demo repo.
permalink: /talks/pycon-ng-2024-iac/
event: PyCon Nigeria 2024
slot: "2024"
talk_date: 2024-11-01
pdf: /assets/talks/pycon-iac.pdf
repo: https://github.com/9trocode/pycon-iac
video: https://www.youtube.com/watch?v=jW-u9AlcDTU
schedule: https://ng.pycon.org/schedule/presentation/104/
image: /assets/images/nitrocode-og-v2.png
---

<header class="page-hero">
  <p class="eyebrow">{{ page.event }}</p>
  <h1>{{ page.title }}</h1>
  <p>{{ page.description }}</p>
</header>

<div class="about-content" style="max-width: 42rem;">
  <p><strong>{{ page.event }}</strong> · Alex Idowu</p>
  <p>
    IaC without learning a new dialect for every cloud click-path - CDK, Terraform,
    CDKTF, and Pulumi, with demos in the companion repo.
  </p>
  <p class="hero__actions" style="display:flex;flex-wrap:wrap;gap:0.75rem;">
    <a class="btn btn--solid" href="{{ page.pdf | relative_url }}" target="_blank" rel="noopener">Open PDF</a>
    <a class="btn btn--ghost" href="{{ page.pdf | relative_url }}" download>Download PDF</a>
    <a class="btn btn--ghost" href="{{ page.repo }}" target="_blank" rel="noopener">Demo repo</a>
    {% if page.video %}<a class="btn btn--ghost" href="{{ page.video }}" target="_blank" rel="noopener">Recording</a>{% endif %}
    <a class="btn btn--ghost" href="{{ '/talks/' | relative_url }}">All talks</a>
  </p>
</div>

<div class="talk-pdf-frame" style="margin:2rem 0 3rem;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--surface);min-height:70vh;">
  <iframe
    title="{{ page.title }} PDF"
    src="{{ page.pdf | relative_url }}#view=FitH"
    style="width:100%;height:75vh;border:0;display:block;"
  ></iframe>
</div>
