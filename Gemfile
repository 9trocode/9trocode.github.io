source "https://rubygems.org"

# Portable Jekyll stack (works in Docker, Railpack, GH Actions, local).
# Avoids the ancient github-pages meta-gem, which breaks on Ruby 3.x
# (rexml missing, Faraday::Error::ConnectionFailed with jekyll-github-metadata).
gem "jekyll", "~> 4.3"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-seo-tag", "~> 2.8"
  gem "jekyll-sitemap", "~> 1.4"
end

gem "webrick", "~> 1.8"
gem "rexml", "~> 3.2"
