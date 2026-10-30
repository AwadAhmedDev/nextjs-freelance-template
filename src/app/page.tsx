import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

/**
 * Page d'accueil : entièrement statique, pré-rendue au build (rapide, bon pour le SEO).
 * Les données structurées (JSON-LD) aident Google à afficher l'adresse et le téléphone.
 */
export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.company.legalName,
    url: siteConfig.url,
    email: siteConfig.company.email,
    telephone: siteConfig.company.phone,
    address: siteConfig.company.address,
  };

  return (
    <section className="grid gap-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <h1 className="text-4xl font-bold tracking-tight text-balance">{siteConfig.name}</h1>
      <p className="text-muted-foreground max-w-prose text-lg">{siteConfig.description}</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/reservation">Réserver un créneau</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/inscription">Créer un compte</Link>
        </Button>
      </div>
    </section>
  );
}
