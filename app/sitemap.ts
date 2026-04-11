import { getSiteUrl } from "@/lib/config/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
