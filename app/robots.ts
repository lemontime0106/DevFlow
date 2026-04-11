import { getSiteUrl } from "@/lib/config/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth/", "/dashboard", "/timer", "/history", "/reports/", "/settings"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
