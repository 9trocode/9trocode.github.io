/**
 * Markdown content negotiation for nitrocode.sh (GitHub Pages origin).
 *
 * When Accept includes text/markdown, serve the pre-built .md sibling from
 * origin instead of HTML. HTML remains the default for browsers.
 *
 * Deploy (route nitrocode.sh/* → this worker, or as a zone Worker):
 *   npx wrangler deploy
 *
 * Alternative on Cloudflare Pro+: enable "Markdown for Agents" in
 * AI Crawl Control — no worker required.
 *
 * Skill: https://isitagentready.com/.well-known/agent-skills/markdown-negotiation/SKILL.md
 * Docs:  https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 */

const MARKDOWN_RE = /text\/markdown/i;

export default {
  async fetch(request, _env, _ctx) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return fetch(request);
    }

    const accept = request.headers.get("Accept") || "";
    if (!MARKDOWN_RE.test(accept)) {
      return fetch(request);
    }

    const url = new URL(request.url);
    // Static assets and feeds stay as-is
    if (shouldBypass(url.pathname)) {
      return fetch(request);
    }

    const candidates = markdownCandidates(url.pathname);
    for (const path of candidates) {
      const mdUrl = new URL(path, url.origin);
      const res = await fetch(mdUrl.toString(), {
        method: "GET",
        headers: {
          // Avoid recursive negotiation if this worker is on the same route
          Accept: "text/plain, */*;q=0.1",
          "User-Agent": "nitrocode-markdown-negotiation/1.0",
        },
        cf: { cacheTtl: 600, cacheEverything: true },
      });

      if (!res.ok) continue;

      const body = await res.text();
      // Skip accidental HTML fallthrough
      if (/^\s*</.test(body) && !body.startsWith("---")) continue;

      const tokens = estimateTokens(body);
      const headers = new Headers({
        "Content-Type": "text/markdown; charset=utf-8",
        "Vary": "Accept",
        "Cache-Control": "public, max-age=600",
        "x-markdown-tokens": String(tokens),
        "Access-Control-Allow-Origin": "*",
      });

      if (request.method === "HEAD") {
        return new Response(null, { status: 200, headers });
      }
      return new Response(body, { status: 200, headers });
    }

    // No markdown variant — return origin HTML (graceful degrade)
    return fetch(request);
  },
};

function shouldBypass(pathname) {
  return (
    pathname.startsWith("/assets/") ||
    pathname.endsWith(".xml") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2") ||
    pathname === "/robots.txt" ||
    pathname === "/CNAME"
  );
}

/**
 * Map request paths to pre-built .md files emitted by the Jekyll plugin.
 */
function markdownCandidates(pathname) {
  let p = pathname || "/";
  // Strip trailing slash except root
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  // Already asking for a .md file
  if (p.endsWith(".md")) {
    return [p];
  }
  // Strip .html if present
  if (p.endsWith(".html")) {
    p = p.slice(0, -5);
  }

  if (p === "" || p === "/") {
    return ["/index.md"];
  }

  // /about → /about.md, /about/index.md
  return [`${p}.md`, `${p}/index.md`];
}

/** Rough token estimate (~4 chars/token). Matches CF-style x-markdown-tokens. */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}
