import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** /robots.txt : indique aux moteurs de recherche ce qu'ils peuvent explorer. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/espace", "/connexion", "/inscription"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
