import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
  title: "Créer un compte",
  robots: { index: false },
};

export default function SignUpPage() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>Pour réserver et suivre vos rendez-vous.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <SignUpForm />
        <p className="text-muted-foreground text-xs">
          En créant un compte, vous acceptez notre{" "}
          <Link href="/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>
        <p className="text-sm">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="underline">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
