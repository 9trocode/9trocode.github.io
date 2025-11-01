# Alex Idowu - Personal Website & Blog

[![Deploy MkDocs to GitHub Pages](https://github.com/9trocode/9trocode.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/9trocode/9trocode.github.io/actions/workflows/deploy.yml)

My personal website and blog built with MkDocs Material, featuring articles on cloud infrastructure, DevOps, and software engineering.

🌐 **Live Site**: [https://9trocode.github.io](https://9trocode.github.io)

## 🚀 Tech Stack

- **MkDocs** - Static site generator
- **Material for MkDocs** - Beautiful theme
- **MkDocs Blog Plugin** - Blog functionality
- **GitHub Pages** - Hosting

## 🛠️ Local Development

### Prerequisites

- Python 3.x
- pip

### Setup

```bash
# Clone the repository
git clone https://github.com/9trocode/9trocode.github.io.git
cd 9trocode.github.io

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install mkdocs mkdocs-material mkdocs-blog-plugin

# Serve locally
mkdocs serve
```

Visit `http://127.0.0.1:8000` to view the site.

## 📝 Writing Blog Posts

Blog posts are located in `docs/blog/posts/`. To create a new post:

1. Create a new markdown file in `docs/blog/posts/`
2. Add frontmatter with date, authors, and categories:

```markdown
---
date: 2025-11-01
authors:
  - alex
categories:
  - Cloud
  - DevOps
---

# Your Post Title

Post excerpt here...

<!-- more -->

Full post content...
```

## 📦 Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch via GitHub Actions.

To manually build:

```bash
mkdocs build
```

## 📄 License

Content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## 📧 Contact

- **GitHub**: [@9trocode](https://github.com/9trocode)
- **Twitter**: [@nitrocode](https://twitter.com/nitrocode)
- **LinkedIn**: [Alex Idowu](https://www.linkedin.com/in/nitrocode/)
- **Email**: alexidowu25@gmail.com

---

Built with ❤️ using MkDocs Material
