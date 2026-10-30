import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSlots } from "@/features/booking/components/admin-slots";
import { CreateSlotForm } from "@/features/booking/components/create-slot-form";
import { ImageUpload } from "@/features/uploads/components/image-upload";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false },
};

/**
 * Page réservée aux administrateurs : la vérification est faite par AdminOnly
 * (requireAdmin) ET par chaque Server Action appelée depuis cette page.
 * Pour donner le rôle admin : voir docs/nouveau-projet.md.
 */
export default function AdminPage() {
  return (
    <div className="grid gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Administration</h1>

      <Suspense fallback={<p className="text-muted-foreground">Chargement…</p>}>
        <AdminOnly>
          <AdminSlots />

          <Card>
            <CardHeader>
              <CardTitle>Ajouter un créneau</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateSlotForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Envoyer une image</CardTitle>
              <CardDescription>Exemple d&apos;envoi direct vers le stockage objet.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload />
            </CardContent>
          </Card>
        </AdminOnly>
      </Suspense>
    </div>
  );
}

/** Vérifie le rôle avant d'afficher quoi que ce soit (lit la session : reste dans un <Suspense>). */
async function AdminOnly({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="grid gap-8">{children}</div>;
}
