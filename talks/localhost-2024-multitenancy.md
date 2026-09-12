---
layout: default
title: Multi-Tenancy in Kubernetes (Localhost)
description: >-
  Soft vs virtual multi-tenancy on localhost - Capsule, vCluster, and friends.
  Localhost Conference 2024 deck and lab repo.
permalink: /talks/localhost-2024-multitenancy/
event: Localhost Conference 2024
slot: "26 Oct 2024"
talk_date: 2024-10-26
pdf: /assets/talks/multitenancy-k8s-localhost.pdf
repo: https://github.com/9trocode/localhost-multi-tenancy-in-kubernetes
image: /assets/images/nitrocode-og-v2.png
---

<header class="page-hero">
  <p class="eyebrow">{{ page.event }}</p>
  <h1>{{ page.title }}</h1>
  <p>{{ page.description }}</p>
</header>

<div class="about-content" style="max-width: 42rem;">
  <p><strong>{{ page.slot }}</strong> · Alex Idowu</p>
  <p>
    Namespace-based soft multi-tenancy and virtual / multi-cluster approaches - 
    Capsule, Kiosk, KubeZoo, Capsule Proxy, Gardener, Kamaji, vCluster - with a
    localhost lab you can run on kind / k3s.
  </p>
  <p class="hero__actions" style="display:flex;flex-wrap:wrap;gap:0.75rem;">
    <a class="btn btn--solid" href="{{ page.pdf | relative_url }}" target="_blank" rel="noopener">Open PDF</a>
    <a class="btn btn--ghost" href="{{ page.pdf | relative_url }}" download>Download PDF</a>
    <a class="btn btn--ghost" href="{{ page.repo }}" target="_blank" rel="noopener">Lab repo</a>
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
