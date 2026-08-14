# Alex Idowu - Personal Website & Blog

[![Deploy Jekyll to GitHub Pages](https://github.com/9trocode/9trocode.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/9trocode/9trocode.github.io/actions/workflows/deploy.yml)

Personal brand site and technical writing for Alex Idowu (nitrocode) - platform engineering, cloud-native security, and production infrastructure.

🌐 **Live Site**: [https://nitrocode.sh](https://nitrocode.sh)

### Site map

| Path | Purpose |
|---|---|
| `/` | Personal brand home |
| `/blog/` | All writing |
| `/blog/:year/:month/:day/:title` | Individual posts |
| `/about/` | Bio and background |

## 🚀 Tech Stack

- **Jekyll** - Static site generator
- **Hacker Theme** - GitHub Pages theme
- **GitHub Pages** - Hosting

## 🛠️ Local Development

### Prerequisites

- Ruby 3.x
- Bundler

### Setup

```bash
# Clone the repository
git clone https://github.com/9trocode/9trocode.github.io.git
cd 9trocode.github.io

# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve
```

Visit `http://127.0.0.1:4000` to view the site.

## 📝 Writing Blog Posts

Blog posts are located in `_posts/`. To create a new post:

1. Create a new markdown file in `_posts/` with the naming convention: `YYYY-MM-DD-title.md`
2. Add frontmatter:

```markdown
---
layout: post
date: 2025-11-01
tags:
- Cloud
- DevOps
---

# Your Post Title

Post content here...
```

## 📦 Deployment

### GitHub Pages (default)

The site deploys to GitHub Pages on push to `main` via GitHub Actions. Live: [nitrocode.sh](https://nitrocode.sh).

### Portable artifact

```bash
bundle install
JEKYLL_ENV=production bundle exec jekyll build
# → _site/ is the full static website (serve with any static host or nginx)
```

### Docker / nginx

```bash
docker build -t nitrocode-site .
docker run --rm -p 8080:8080 nitrocode-site
# HTML:  curl -sI http://127.0.0.1:8080/
# MD:    curl -sI -H 'Accept: text/markdown' http://127.0.0.1:8080/
```

## 🤖 Markdown for Agents

Requests with `Accept: text/markdown` get a clean Markdown representation of the same URL. HTML stays the default for browsers.

| Layer | What it does |
|---|---|
| `_plugins/markdown_for_agents.rb` | Build-time: emit `.md` siblings next to every HTML page/post |
| `docker/nginx.conf` | Origin negotiation for Docker/portable deploys |
| `cloudflare/markdown-negotiation/` | Worker for GitHub Pages (Accept → fetch `.md`, set `Content-Type` + `x-markdown-tokens`) |
| Cloudflare Pro+ | Optional: AI Crawl Control → **Markdown for Agents** (edge HTML→MD, no worker) |

```bash
# After deploy + worker (or CF Markdown for Agents) is on:
curl -sI -H 'Accept: text/markdown' https://nitrocode.sh/
# expect: content-type: text/markdown

curl -s -H 'Accept: text/markdown' https://nitrocode.sh/blog/2026/08/11/namespaces-arent-isolation | head
```

Deploy the Worker (once per account/zone):

```bash
cd cloudflare/markdown-negotiation
npx wrangler deploy
# then attach route nitrocode.sh/* in the Cloudflare dashboard
```

Also published: [`/llms.txt`](https://nitrocode.sh/llms.txt).

### Docker (anywhere with a container runtime)

```bash
docker compose up --build
# http://localhost:8080

# or
docker build -t nitrocode-site .
docker run --rm -p 8080:8080 -e PORT=8080 nitrocode-site
```

Multi-stage image: **Ruby builds Jekyll → nginx serves `_site`**. Works on Docker, Railway, Fly, K8s, a VPS, etc.

### Railpack / Railway

[`railpack.json`](railpack.json) lets the Ruby provider install gems (with `Gemfile` present), then runs `jekyll build` and serves `_site` on `$PORT`.

**Important:** Do not replace the install step with bare `bundle install` only - that drops the auto copy of `Gemfile` into `/app` and fails with `No such file or directory @ rb_sysopen - /app/Gemfile`. Keep install as `"..."` (provider defaults) or copy source before `bundle install`.

```bash
# With Railpack CLI (optional local check)
railpack build .

# On Railway: connect this repo; Railpack reads railpack.json automatically.
# If a Dockerfile is present, Railway may prefer it over Railpack - pick one builder per service.
# Custom domain: set in Railway (CNAME file is for GitHub Pages only).
```

| Target | How |
|---|---|
| GitHub Pages | Existing `.github/workflows/deploy.yml` |
| Docker / K8s | `Dockerfile` |
| Railway | `railpack.json` (or Dockerfile if present - prefer one builder) |
| Netlify / Cloudflare Pages | Build: `bundle exec jekyll build`, publish: `_site` |

## 📄 License

Content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## 📧 Contact

- **GitHub**: [@9trocode](https://github.com/9trocode)
- **Twitter**: [@nitrocode](https://twitter.com/nitrocode)
- **LinkedIn**: [Alex Idowu](https://www.linkedin.com/in/nitrocode/)
- **Email**: alexidowu25@gmail.com

---

Built with Jekyll & Hacker theme
