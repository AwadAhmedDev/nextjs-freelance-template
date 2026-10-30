import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false },
};

export default function SignInPage() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Accédez à votre espace.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Suspense>
          <SignInFormWithProviders />
        </Suspense>
        <div className="grid gap-1 text-sm">
          <Link href="/mot-de-passe-oublie" className="underline">
            Mot de passe oublié ?
          </Link>
          <span>
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="underline">
              Créer un compte
            </Link>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/** Lu au moment de la requête : les clés Google sont des variables d'exécution, pas de build. */
async function SignInFormWithProviders() {
  await connection();
  return <SignInForm googleEnabled={Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)} />;
}
