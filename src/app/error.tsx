"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Erreur inattendue dans une page. L'utilisateur voit un message simple,
 * jamais le détail technique. Le détail part dans les logs (et dans Sentry
 * une fois activé : voir docs/mise-en-production.md).
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="grid max-w-prose gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Une erreur est survenue</h1>
      <p className="text-muted-foreground">Réessayez dans quelques instants.</p>
      <div>
        <Button onClick={reset}>Réessayer</Button>
      </div>
    </section>
  );
}
