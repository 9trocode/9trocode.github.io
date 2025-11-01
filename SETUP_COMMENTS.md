# Setting Up Comments, Share, and Subscribe

I've added the infrastructure for comments and sharing. Here's what you need to do:

## 1. Enable GitHub Discussions

1. Go to https://github.com/9trocode/9trocode.github.io/settings
2. Scroll down to "Features"
3. Check "Discussions"
4. Click "Set up discussions"

## 2. Get Giscus Configuration

1. Go to https://giscus.app/
2. Enter your repo: `9trocode/9trocode.github.io`
3. Select "Announcements" category (or create one)
4. Copy the `data-category-id` value
5. Update `_layouts/post.html` line 24 with the category ID

Your repo ID is already set: `253369748`

## 3. What's Already Added

### Share Buttons
- Twitter
- LinkedIn
- Hacker News

These work immediately, no setup needed.

### Comments (Giscus)
- Uses GitHub Discussions (no third-party tracking)
- Visitors need GitHub account to comment
- You moderate via GitHub Discussions
- Dark theme to match site

### Subscribe (RSS Feed)
Already have RSS feed at `/feed.xml` (jekyll-feed plugin)

To add email newsletter, you'd need:
- Buttondown (free tier)
- Substack
- Mailchimp

Add this to `_layouts/post.html` if you want newsletter signup:

```html
<div class="newsletter" style="margin: 2rem 0; padding: 1rem; border: 1px solid #333;">
  <h3>Subscribe</h3>
  <p>Get notified when I publish new posts about infrastructure and cloud engineering.</p>
  <form action="https://buttondown.email/api/emails/embed-subscribe/YOUR_USERNAME" method="post" target="_blank">
    <input type="email" name="email" placeholder="your@email.com" required style="padding: 0.5rem; margin-right: 0.5rem;">
    <button type="submit" style="padding: 0.5rem 1rem;">Subscribe</button>
  </form>
</div>
```

## Alternative: Simple Subscribe Link

Add to footer or sidebar:
```html
<a href="/feed.xml">RSS Feed</a>
```

That's it! Once you enable Discussions and update the category ID, comments will work.
