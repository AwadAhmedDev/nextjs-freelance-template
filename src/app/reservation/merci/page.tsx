import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Merci",
  robots: { index: false },
};

/**
 * Page affichée après le paiement. Elle NE CONFIRME RIEN :
 * la confirmation se fait uniquement par le webhook Stripe
 * (src/app/api/webhooks/stripe/route.ts), qui arrive même si le client ferme son navigateur.
 */
export default function ThankYouPage() {
  return (
    <section className="grid max-w-prose gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Merci pour votre paiement</h1>
      <p>
        Votre réservation est en cours de confirmation. Vous allez recevoir un email dans quelques
        instants. Vous pouvez aussi suivre son statut dans votre espace.
      </p>
      <div>
        <Button asChild>
          <Link href="/espace">Voir mes réservations</Link>
        </Button>
      </div>
    </section>
  );
}
