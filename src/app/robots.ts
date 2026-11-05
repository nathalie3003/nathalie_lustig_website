import type { MetadataRoute } from "next";

const SITE_URL = "https://thebasispoint.finance";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the Sanity editor and API routes out of search results.
      disallow: ["/studio", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
