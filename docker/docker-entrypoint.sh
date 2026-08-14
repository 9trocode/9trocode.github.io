#!/bin/sh
set -eu

PORT="${PORT:-8080}"

# Replace listen port without envsubst (which breaks nginx $uri vars)
sed "s/LISTEN_PORT/${PORT}/g" \
  /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
