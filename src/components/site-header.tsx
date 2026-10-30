import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "@/components/user-menu";
import { siteConfig } from "@/lib/site";

/**
 * En-tête du site. La partie statique (logo, liens) est pré-rendue ;
 * la partie qui dépend de la session (UserMenu) arrive ensuite, dans un <Suspense>.
 */
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/reservation" className="hover:underline">
            Réserver
          </Link>
          <Suspense fallback={<span className="w-24" />}>
            <UserMenu />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
