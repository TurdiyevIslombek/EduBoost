import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/videos/", "/users/", "/feed/trending", "/about", "/contact", "/search"],
      disallow: ["/studio/", "/api/", "/home/", "/account/", "/playlists/", "/subscriptions", "/feed/subscribed", "/admin/"],
    },
    sitemap: "https://www.eduboostonline.com/sitemap.xml",
  };
}
