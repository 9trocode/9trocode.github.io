# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website and technical blog built with Jekyll and the Hacker theme, hosted on GitHub Pages. The site focuses on cloud infrastructure, DevOps, and software engineering content by Alex Idowu.

## Development Commands

### Local Development
```bash
# Install dependencies
bundle install

# Serve the site locally
bundle exec jekyll serve

# Site will be available at http://127.0.0.1:4000
```

### Content Management
- Blog posts are in `_posts/` with naming convention: `YYYY-MM-DD-title.md`
- Posts require frontmatter with layout, date, and optional tags
- Deployment is automated via GitHub Actions on push to `main` branch

## Site Architecture

### Key Directories
- `_posts/`: Blog articles in markdown format
- `_layouts/`: Jekyll layout templates (notably `post.html` with social features)
- `_includes/`: Reusable HTML components (head-custom.html for meta tags)
- `assets/`: Static files including CSS overrides and images
- `agents/`: Contains AI-related tooling

### Configuration Files
- `_config.yml`: Main Jekyll configuration with SEO, social media, and plugin settings
- `Gemfile`: Ruby dependencies for Jekyll and GitHub Pages
- `.github/workflows/deploy.yml`: Automated deployment pipeline

### Custom Features
- Newsletter subscription integration (Buttondown)
- Social sharing buttons (Twitter, LinkedIn, Hacker News)
- Comments system (Giscus via GitHub Discussions)
- GitHub Sponsors integration
- Analytics (Umami)
- SEO optimization with Open Graph and Twitter Card meta tags

### Content Structure
- Homepage (`index.md`): Lists all blog posts with author intro
- About page (`about.md`): Professional background and contact info
- Custom post layout includes social sharing, newsletter signup, and comments
- Responsive design with terminal/hacker aesthetic using green accent color (#00ff41)

## Important Notes
- Site uses remote theme `pages-themes/hacker@v0.2.0`
- Custom styling in `assets/css/style.scss`
- URLs follow pattern: `/blog/YYYY/MM/DD/title`
- Social media metadata configured for Twitter (@nitrocode) and LinkedIn