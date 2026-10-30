import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Plan du site envoyé à Google : /sitemap.xml
 * Liste uniquement les pages publiques à référencer.
 * Pour des pages issues de la base (articles...), lis-les ici avec Prisma.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/reservation", "/mentions-legales", "/confidentialite"];
  return pages.map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: path === "/reservation" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));
}
