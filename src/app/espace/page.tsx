import type { Metadata } from "next";
import { Suspense } from "react";
import { MyBookings } from "@/features/booking/components/my-bookings";

export const metadata: Metadata = {
  title: "Mon espace",
  robots: { index: false },
};

/**
 * Page protégée. La vérification se fait dans MyBookings (requireUser),
 * côté serveur. Le fichier src/proxy.ts ne fait qu'une redirection rapide :
 * ce n'est PAS une protection suffisante à lui seul.
 */
export default function AccountPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Mon espace</h1>
      <Suspense fallback={<p className="text-muted-foreground">Chargement…</p>}>
        <MyBookings />
      </Suspense>
    </div>
  );
}
