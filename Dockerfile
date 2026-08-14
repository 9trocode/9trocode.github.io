# Portable static site: Jekyll build → nginx serves _site.
# Works on Docker, Railway, Fly, K8s, any container host.
#
# Railway uses Dockerfile when present (overrides Railpack).

# -----------------------------------------------------------------------------
# Build
# -----------------------------------------------------------------------------
FROM ruby:3.1-bookworm AS build

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/*

# Prefer lockfile when present (committed). Optional glob so a missing lock
# does not fail COPY on remote clones that never received Gemfile.lock.
COPY Gemfile ./
COPY Gemfile.loc[k] ./
RUN bundle install --jobs 4 --retry 3

COPY . .

ENV JEKYLL_ENV=production
ENV PAGES_REPO_NWO=9trocode/9trocode.github.io

RUN bundle exec jekyll build \
  && test -f _site/index.html \
  && test -d _site/blog \
  && test -d _site/work

# -----------------------------------------------------------------------------
# Runtime
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine

ENV PORT=8080

COPY docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY docker/docker-entrypoint.sh /docker-entrypoint-custom.sh
COPY --from=build /app/_site /usr/share/nginx/html

RUN chmod +x /docker-entrypoint-custom.sh \
  && chown -R nginx:nginx /usr/share/nginx/html \
  && rm -f /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Bypass stock envsubst entrypoint (breaks $uri). Our script only swaps PORT.
ENTRYPOINT ["/docker-entrypoint-custom.sh"]
