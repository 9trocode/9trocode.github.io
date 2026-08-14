# Markdown content negotiation (Cloudflare Worker)

GitHub Pages cannot negotiate `Accept: text/markdown`. This Worker sits in front of the origin and serves the pre-built `.md` files produced by `_plugins/markdown_for_agents.rb`.

## Behaviour

| Request | Response |
|---|---|
| `Accept: text/markdown` + matching `.md` on origin | `200`, `Content-Type: text/markdown`, `Vary: Accept`, `x-markdown-tokens` |
| Browser / no markdown Accept | Pass-through to GitHub Pages HTML |
| Markdown requested but no `.md` | Graceful fallthrough to HTML |

## Deploy

```bash
cd cloudflare/markdown-negotiation
npx wrangler login   # once
npx wrangler deploy
```

Then in Cloudflare dashboard → Workers → this worker → **Triggers / Routes**:

- `nitrocode.sh/*`
- `www.nitrocode.sh/*` (if used)

Or uncomment `routes` in `wrangler.toml` and redeploy.

## Pro alternative (no worker)

If the zone is on **Pro / Business / Enterprise**:

1. Dashboard → zone → **AI Crawl Control**
2. Enable **Markdown for Agents**

That converts HTML→Markdown at the edge. You can skip this Worker; keep the Jekyll `.md` emit either way (useful for direct `.md` URLs and non-CF deploys).

```bash
# API form
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/content_converter" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"on"}'
```

## Validate

```bash
curl -sI -H 'Accept: text/markdown' https://nitrocode.sh/ | grep -i content-type
# content-type: text/markdown

curl -s -X POST https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://nitrocode.sh"}'
# checks.contentAccessibility.markdownNegotiation.status === "pass"
```
