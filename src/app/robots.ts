import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/videos/", "/users/", "/feed/trending", "/about", "/contact", "/search"],
      // Only hard-block machine endpoints and internal tools. Auth-protected
      // pages (/home, /account, /playlists…) are NOT listed here on purpose:
      // they redirect to sign-in and carry an X-Robots-Tag noindex header,
      // and Google can only honor noindex if it is allowed to crawl the URL.
      disallow: ["/api/", "/admin", "/studio"],
    },
    sitemap: "https://www.eduboostonline.com/sitemap.xml",
  };
}
