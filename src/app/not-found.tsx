import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="grid max-w-prose gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Page introuvable</h1>
      <p className="text-muted-foreground">Cette page n&apos;existe pas ou a été déplacée.</p>
      <div>
        <Button asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </section>
  );
}
