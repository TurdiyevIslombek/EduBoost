# SEO / Google Search Console Checklist

## What was fixed (July 2026)

1. **Canonical bug (the big one):** the root layout declared `canonical: "/"`,
   which every page inherited — telling Google that *every* page (sign-in,
   search, playlists…) was a duplicate of the homepage. Now only the landing
   page claims `/`; videos, users, about, contact and trending declare their
   own canonicals; everything else has none.
2. **Missing images:** `/og-default.png` (1200×630 social card),
   `/apple-touch-icon.png`, `/android-chrome-192x192.png` and
   `/android-chrome-512x512.png` were referenced but didn't exist (404s).
   All are now generated — re-run `node scripts/generate-brand-assets.mjs`
   if you ever want to regenerate them.
3. **robots.txt:** `Disallow: /home/` didn't actually cover `/home`, and
   blocking noindexed pages prevents Google from seeing the noindex. Now only
   `/api/`, `/admin`, `/studio` are blocked; auth-protected pages rely on
   their `X-Robots-Tag: noindex` headers, which Google can now crawl and honor.
4. **Sign-in / sign-up:** now `noindex, follow` via both metadata and
   `X-Robots-Tag` headers.
5. **Sitemap resilience:** a DB failure no longer 500s the sitemap (Google
   treats a failing sitemap as "Couldn't fetch").
6. **Landing OG image:** the landing page's `openGraph` block was overriding
   the root's and dropping the image — restored explicitly.

## After deploying, verify

```bash
# 1. Homepage: 200, canonical → https://www.eduboostonline.com
curl -s https://www.eduboostonline.com/ | grep -o '<link rel="canonical"[^>]*>'

# 2. Non-www redirect (308 → www)
curl -I https://eduboostonline.com/

# 3. robots.txt (200, only /api/, /admin, /studio disallowed)
curl -s https://www.eduboostonline.com/robots.txt

# 4. sitemap.xml (200, public URLs only)
curl -s https://www.eduboostonline.com/sitemap.xml | head -30

# 5. Social card + icons all 200
curl -I https://www.eduboostonline.com/og-default.png
curl -I https://www.eduboostonline.com/apple-touch-icon.png
curl -I https://www.eduboostonline.com/android-chrome-192x192.png

# 6. Public pages: 200 with x-robots-tag: index (or no noindex header)
curl -I https://www.eduboostonline.com/about
curl -I https://www.eduboostonline.com/feed/trending

# 7. Auth pages: noindex
curl -I https://www.eduboostonline.com/sign-in

# 8. A public video page: canonical should be its own URL, NOT "/"
curl -s https://www.eduboostonline.com/videos/<some-id> | grep -o '<link rel="canonical"[^>]*>'
```

## Then in Google Search Console

1. Open [Search Console](https://search.google.com/search-console) for
   `www.eduboostonline.com` (verification meta tag is already in the layout).
2. **Sitemaps** → re-submit `https://www.eduboostonline.com/sitemap.xml`.
3. **URL Inspection** → inspect `/`, then "Request indexing".
   Repeat for `/about`, `/feed/trending` and one or two video URLs.
4. **Pages report** → over the next days/weeks the
   "Duplicate, Google chose different canonical" and
   "Alternate page with proper canonical tag" counts should drop.
   "Excluded by 'noindex'" for /home, /sign-in etc. is **expected and correct**.
5. Optional: test the social card at
   [opengraph.xyz](https://www.opengraph.xyz) or Twitter/X card validator.

Indexing changes are not instant — give Google 3–14 days after the deploy.
