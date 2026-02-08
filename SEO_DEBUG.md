# SEO Debug Checklist

After deploying, run these commands to verify everything is indexable.

## 1. Homepage (should be 200 with `x-robots-tag: index, follow`)

```bash
curl -I https://www.eduboostonline.com/
```

## 2. Non-www redirect (should be 308 redirect to www)

```bash
curl -I https://eduboostonline.com/
```

## 3. robots.txt (should be 200, no auth headers)

```bash
curl -s https://www.eduboostonline.com/robots.txt
```

## 4. sitemap.xml (should be 200, list public URLs only)

```bash
curl -s https://www.eduboostonline.com/sitemap.xml
```

## 5. Public pages (should be 200, `x-robots-tag: index, follow`)

```bash
curl -I https://www.eduboostonline.com/about
curl -I https://www.eduboostonline.com/contact
curl -I https://www.eduboostonline.com/search
```

## 6. Protected page (should redirect to sign-in or return Clerk protect headers — NOT 200)

```bash
curl -I https://www.eduboostonline.com/home
curl -I https://www.eduboostonline.com/studio
```

## What to check

- **No `x-robots-tag: noindex`** on any public page
- **No `x-clerk-auth-reason: protect-rewrite`** on public pages
- **No 307/302 redirects** on public pages (only 200)
- **308 redirect** from non-www to www
- **sitemap.xml** should NOT contain `/home`, `/studio`, `/account`, or any protected route
- **robots.txt** should have `Allow: /` and `Disallow` entries for protected routes

## After verifying

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Re-submit the sitemap: `https://www.eduboostonline.com/sitemap.xml`
3. Use "URL Inspection" on `/` and request re-indexing
4. Check "Pages" report — the "noindex" count should drop to 0 for public pages
