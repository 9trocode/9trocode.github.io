# frozen_string_literal: true

# Keep locked posts out of RSS and out of public {{ content }} at build time.
# Full markdown is stashed in data['locked_raw'] for speaker-unlock templates
# ({{ page.locked_raw | markdownify }}).

module LockedPosts
  module_function

  def locked?(site, doc)
    data = doc.data
    return false if data["locked"] == false
    return true if data["locked"] == true

    unlock = data["unlock_after"] || data["talk_date"]
    return false if unlock.nil?

    unlock_day =
      if unlock.respond_to?(:strftime)
        unlock.strftime("%Y-%m-%d")
      else
        unlock.to_s[0, 10]
      end
    site.time.strftime("%Y-%m-%d") < unlock_day
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  site.posts.docs.each do |post|
    next unless LockedPosts.locked?(site, post)

    post.data["locked_raw"] = post.content.dup
    # What feed.xml / accidental content renders see:
    desc = post.data["description"].to_s.strip
    unlock = post.data["unlock_after"] || post.data["talk_date"]
    unlock_s = unlock.respond_to?(:strftime) ? unlock.strftime("%Y-%m-%d") : unlock.to_s[0, 10]
    post.content = [
      desc,
      "",
      "_Field notes locked until #{unlock_s} (SysConf)._",
      "",
    ].join("\n")
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  feed_path = File.join(site.dest, "feed.xml")
  next unless File.file?(feed_path)

  locked_urls = site.posts.docs.select { |p| LockedPosts.locked?(site, p) }.map(&:url)
  next if locked_urls.empty?

  xml = File.read(feed_path)
  locked_urls.each do |url|
    # Drop <entry>…</entry> blocks whose <id> or <link href> contains the post URL
    xml.gsub!(%r{<entry>.*?(?:<id>[^<]*#{Regexp.escape(url)}[^<]*</id>|<link[^>]*href="[^"]*#{Regexp.escape(url)}"[^>]*/>).*?</entry>}m, "")
  end
  File.write(feed_path, xml)
end
