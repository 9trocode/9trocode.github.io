# Portable static site image: build with Jekyll, serve with nginx.
# Works on Docker, Railway, Fly, K8s, any container host.
#
# Note: Railway prefers Dockerfile when present (over railpack.json).
# Use railpack.json on platforms that run Railpack without a Dockerfile,
# or delete/rename Dockerfile if you want Railway to use Railpack only.

# -----------------------------------------------------------------------------
# Build
# -----------------------------------------------------------------------------
FROM ruby:3.1-bookworm AS build

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/*

# Gemfile.lock is committed for reproducible builds (required for Docker/Railpack CI)
COPY Gemfile Gemfile.lock ./
RUN bundle config set --local path 'vendor/bundle' \
  && bundle config set --local without 'development test' \
  && bundle install --jobs 4 --retry 3

COPY . .

ENV JEKYLL_ENV=production
RUN bundle exec jekyll build

# -----------------------------------------------------------------------------
# Runtime (static only - no Ruby required)
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine

# Cloud hosts (Railway, etc.) inject PORT. Local default: 8080.
ENV PORT=8080

# Official nginx image runs envsubst on /etc/nginx/templates/*.template
COPY docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/_site /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
