import type { Metadata } from "next";
import { Suspense } from "react";
import { AvailableSlots } from "@/features/booking/components/available-slots";

export const metadata: Metadata = {
  title: "Réserver un créneau",
  description: "Choisissez un créneau et réglez l'acompte en ligne, en toute sécurité.",
  alternates: { canonical: "/reservation" },
};

export default function BookingPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Réserver un créneau</h1>
        <p className="text-muted-foreground">
          Un acompte est demandé pour confirmer la réservation. Le paiement est sécurisé par Stripe.
        </p>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Chargement des créneaux…</p>}>
        <AvailableSlots />
      </Suspense>
    </div>
  );
}
