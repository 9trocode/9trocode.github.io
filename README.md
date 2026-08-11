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

The site automatically deploys to GitHub Pages when you push to the `main` branch via GitHub Actions.

## 📄 License

Content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## 📧 Contact

- **GitHub**: [@9trocode](https://github.com/9trocode)
- **Twitter**: [@nitrocode](https://twitter.com/nitrocode)
- **LinkedIn**: [Alex Idowu](https://www.linkedin.com/in/nitrocode/)
- **Email**: alexidowu25@gmail.com

---

Built with Jekyll & Hacker theme
