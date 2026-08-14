# frozen_string_literal: true

# Emit agent-friendly Markdown siblings next to HTML so servers can negotiate
# Accept: text/markdown (see isitagentready markdown-negotiation skill and
# Cloudflare Markdown for Agents docs).
#
# Output layout mirrors HTML destinations:
#   blog/YYYY/MM/DD/title.html  →  blog/YYYY/MM/DD/title.md
#   about/index.html            →  about/index.md
#   index.html                  →  index.md
#
# Posts use the source Markdown body (high fidelity). Pages with Liquid are
# rendered to a structured Markdown index after the site renders.

require "cgi"
require "fileutils"

module MarkdownForAgents
  module_function

  def write_all(site)
    site.posts.docs.each { |doc| write_document(site, doc, :post) }
    site.pages.each do |page|
      next if skip_page?(page)

      write_document(site, page, :page)
    end
  end

  def skip_page?(page)
    return true if page.name == "404.html"
    return true if page.data["markdown_for_agents"] == false
    # Skip non-content artifacts
    return true if page.ext == ".xml" || page.ext == ".json"
    return true if page.name.end_with?(".scss", ".css", ".js", ".map")

    false
  end

  def write_document(site, doc, kind)
    md = kind == :post ? render_post(site, doc) : render_page(site, doc)
    return if md.nil? || md.strip.empty?

    path = dest_md_path(site, doc)
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, md)

    # Directory-index alias: /about/ and /about both work under nginx try_files
    if path.end_with?("/index.md")
      sibling = path.sub(%r{/index\.md\z}, ".md")
      FileUtils.mkdir_p(File.dirname(sibling))
      File.write(sibling, md) unless sibling == path
    end
  end

  def dest_md_path(site, doc)
    html = doc.destination(site.dest)
    if html.end_with?(".html")
      html.sub(/\.html\z/, ".md")
    elsif File.directory?(html) || html.end_with?("/")
      File.join(html.sub(%r{/\z}, ""), "index.md")
    else
      "#{html}.md"
    end
  end

  def render_post(site, post)
    body = raw_markdown_body(post)
    body = body.to_s.sub(/\A\s*#\s+.+\n+/, "") # drop duplicate H1 if present in body
    [
      frontmatter(
        title: post.data["title"],
        description: post.data["description"] || excerpt_text(post),
        date: post.date&.iso8601,
        tags: Array(post.data["tags"]),
        image: absolute_url(site, post.data["image"] || site.config["logo"]),
        url: absolute_url(site, post.url)
      ),
      "",
      "# #{post.data['title']}",
      "",
      body.strip,
      "",
    ].join("\n")
  end

  def render_page(site, page)
    title = page.data["title"] || site.config["title"]
    description = page.data["description"] || site.config["description"]
    url = absolute_url(site, page.url)

    body =
      case page.url
      when "/", ""
        home_markdown(site)
      when "/blog/", "/blog"
        blog_index_markdown(site)
      when "/work/", "/work"
        work_index_markdown(site)
      else
        # Prefer source markdown; fall back to a light HTML→MD of rendered content
        src = raw_markdown_body(page)
        if src && !src.include?("{%") && !src.include?("{{")
          strip_html_blocks(src)
        else
          html_to_markdown(page.content.to_s)
        end
      end

    return nil if body.to_s.strip.empty?

    [
      frontmatter(
        title: title,
        description: description.to_s.gsub(/\s+/, " ").strip,
        image: absolute_url(site, page.data["image"] || site.config["logo"]),
        url: url
      ),
      "",
      "# #{title}",
      "",
      body.strip,
      "",
    ].join("\n")
  end

  def home_markdown(site)
    lines = []
    lines << site.config["description"].to_s.gsub(/\s+/, " ").strip
    lines << ""
    lines << "## Writing"
    lines << ""
    site.posts.docs.sort_by(&:date).reverse.first(12).each do |post|
      lines << "- [#{post.data['title']}](#{absolute_url(site, post.url)})" \
               " — #{post.data['description'] || excerpt_text(post)}"
    end
    lines << ""
    lines << "## Site"
    lines << ""
    lines << "- [Writing index](#{absolute_url(site, '/blog/')})"
    lines << "- [Work catalogue](#{absolute_url(site, '/work/')})"
    lines << "- [About](#{absolute_url(site, '/about/')})"
    lines << "- [llms.txt](#{absolute_url(site, '/llms.txt')})"
    lines.join("\n")
  end

  def blog_index_markdown(site)
    lines = []
    lines << site.pages.find { |p| p.url == "/blog/" }&.data&.[]("description").to_s
    lines << ""
    site.posts.docs.each do |post|
      date = post.date&.strftime("%Y-%m-%d")
      desc = post.data["description"] || excerpt_text(post)
      lines << "- **#{date}** — [#{post.data['title']}](#{absolute_url(site, post.url)})"
      lines << "  #{desc}" if desc && !desc.empty?
    end
    lines.join("\n")
  end

  def work_index_markdown(site)
    lines = []
    lines << site.pages.find { |p| p.url == "/work/" }&.data&.[]("description").to_s
    lines << ""
    items = site.data["work"] || []
    kinds = items.map { |i| i["kind"] }.compact.uniq
    kinds.each do |kind|
      group = items.select { |i| i["kind"] == kind }
      next if group.empty?

      lines << "## #{kind}"
      lines << ""
      group.each do |item|
        name = item["name"]
        name = "[#{name}](#{item['url']})" if item["url"] && !item["url"].to_s.empty?
        role = item["role"] ? " (#{item['role']})" : ""
        period = item["period"] ? " — #{item['period']}" : ""
        lines << "- **#{name}**#{role}#{period}"
        lines << "  #{item['summary']}" if item["summary"]
      end
      lines << ""
    end
    lines.join("\n")
  end

  def frontmatter(fields)
    lines = ["---"]
    fields.each do |key, value|
      next if value.nil?

      if value.is_a?(Array)
        next if value.empty?

        lines << "#{key}:"
        value.each { |v| lines << "- #{yaml_scalar(v)}" }
      else
        s = value.to_s.strip
        next if s.empty?

        lines << "#{key}: #{yaml_scalar(s)}"
      end
    end
    lines << "---"
    lines.join("\n")
  end

  def yaml_scalar(value)
    s = value.to_s
    if s.include?(":") || s.include?("#") || s.include?("\n") || s.start_with?("'", '"', "*", "&", "!", "|", ">", "%", "@", "`") || s.match?(/\A\d/)
      s.inspect
    elsif s.match?(/[[:space:]]/)
      s.inspect
    else
      s
    end
  end

  def raw_markdown_body(doc)
    path = doc.respond_to?(:path) ? doc.path : nil
    return doc.content.to_s if path.nil? || !File.file?(path)

    text = File.read(path)
    if text =~ /\A---\s*\r?\n.*?\r?\n---\s*\r?\n(.*)\z/m
      Regexp.last_match(1)
    else
      text
    end
  end

  def strip_html_blocks(src)
    s = src.dup

    # Capture groups first — nested gsub resets Regexp.last_match.
    s.gsub!(%r{<a\s+[^>]*?\bhref\s*=\s*["']([^"']+)["'][^>]*>(.*?)</a>}mi) do
      href = Regexp.last_match(1).to_s
      label = Regexp.last_match(2).to_s.gsub(/<[^>]+>/, "").strip
      label = href if label.empty?
      "[#{label}](#{href})"
    end

    s.gsub!(%r{<h1[^>]*>(.*?)</h1>}mi) do
      text = Regexp.last_match(1).to_s.gsub(/<[^>]+>/, "").strip
      "\n# #{text}\n\n"
    end
    s.gsub!(%r{<h2[^>]*>(.*?)</h2>}mi) do
      text = Regexp.last_match(1).to_s.gsub(/<[^>]+>/, "").strip
      "\n## #{text}\n\n"
    end
    s.gsub!(%r{<h3[^>]*>(.*?)</h3>}mi) do
      text = Regexp.last_match(1).to_s.gsub(/<[^>]+>/, "").strip
      "\n### #{text}\n\n"
    end
    s.gsub!(%r{<li[^>]*>(.*?)</li>}mi) do
      text = Regexp.last_match(1).to_s.gsub(/<[^>]+>/, "").strip
      "- #{text}\n"
    end
    s.gsub!(%r{<p[^>]*>(.*?)</p>}mi) do
      text = Regexp.last_match(1).to_s.strip
      "\n#{text}\n\n"
    end

    s.gsub!(%r{</?(strong|b)>}i, "**")
    s.gsub!(%r{</?(em|i)>}i, "*")
    s.gsub!(/<br\s*\/?>/i, "\n")
    # Drop remaining layout/chrome tags
    s.gsub!(/<[^>]+>/, "")
    CGI.unescapeHTML(s).gsub(/[ \t]+\n/, "\n").gsub(/\n{3,}/, "\n\n").strip
  end

  def html_to_markdown(html)
    return "" if html.nil? || html.empty?

    strip_html_blocks(html)
  end

  def excerpt_text(doc)
    raw = doc.data["description"] || doc.data["excerpt"] || ""
    text = raw.respond_to?(:to_s) ? raw.to_s : ""
    text = text.gsub(/<[^>]+>/, " ").gsub(/\s+/, " ").strip
    text[0, 160]
  end

  def absolute_url(site, path)
    return "" if path.nil?

    p = path.to_s
    return p if p.start_with?("http://", "https://")

    base = site.config["url"].to_s.sub(%r{/\z}, "")
    bpath = site.config["baseurl"].to_s.sub(%r{/\z}, "")
    "#{base}#{bpath}#{p.start_with?('/') ? p : "/#{p}"}"
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  MarkdownForAgents.write_all(site)
end
