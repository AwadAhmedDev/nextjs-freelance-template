import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm">
        <span>{siteConfig.name}</span>
        <nav className="flex gap-4">
          <Link href="/mentions-legales" className="hover:underline">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:underline">
            Confidentialité
          </Link>
        </nav>
      </div>
    </footer>
  );
}
