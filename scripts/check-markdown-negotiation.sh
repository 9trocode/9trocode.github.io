#!/usr/bin/env bash
# Smoke-test Accept: text/markdown negotiation against a running origin.
# Usage: ./scripts/check-markdown-negotiation.sh [base_url]
set -euo pipefail

BASE="${1:-http://127.0.0.1:18080}"
fail=0

check() {
  local path="$1"
  local accept="$2"
  local expect_ct="$3"
  local label="$4"
  local ct
  ct=$(curl -sI -H "Accept: ${accept}" "${BASE}${path}" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-type"{print tolower($2); exit}')
  if [[ "$ct" == *"$expect_ct"* ]]; then
    echo "PASS  ${label}: ${ct}"
  else
    echo "FAIL  ${label}: got '${ct}', want contains '${expect_ct}'"
    fail=1
  fi
}

echo "Checking ${BASE}"
check "/" "text/html,application/xhtml+xml" "text/html" "browser home"
check "/" "text/markdown" "text/markdown" "agent home"
check "/blog/2026/08/11/namespaces-arent-isolation" "text/markdown" "text/markdown" "agent post"
check "/about/" "text/markdown" "text/markdown" "agent about"
check "/work/" "text/markdown" "text/markdown" "agent work"

# Body sanity: markdown responses should start with YAML frontmatter
body=$(curl -s -H "Accept: text/markdown" "${BASE}/")
if [[ "$body" == ---* ]]; then
  echo "PASS  markdown body has frontmatter"
else
  echo "FAIL  markdown body missing frontmatter"
  fail=1
fi

if [[ "$fail" -ne 0 ]]; then
  echo "One or more checks failed"
  exit 1
fi
echo "All checks passed"
