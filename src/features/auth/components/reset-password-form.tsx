"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { type ResetPasswordInput, resetPasswordSchema } from "../schema";

/** Lit le jeton dans l'URL : doit être rendu dans un <Suspense>. */
export function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  if (!token) return <FormMessage>Lien invalide ou expiré.</FormMessage>;

  async function onSubmit({ password }: ResetPasswordInput) {
    const { error } = await resetPassword({ newPassword: password, token: token! });
    setStatus(error ? "error" : "done");
  }

  if (status === "done") {
    return (
      <p>
        Mot de passe modifié.{" "}
        <Link href="/connexion" className="underline">
          Se connecter
        </Link>
      </p>
    );
  }

  return (
    <form
      // Si on clique avant le chargement du JavaScript, le mot de passe
      // ne doit jamais partir dans l'URL (historique, logs du serveur).
      method="post"
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4"
      noValidate
    >
      <div className="grid gap-2">
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <FormMessage>{errors.password?.message}</FormMessage>
      </div>
      {status === "error" && (
        <FormMessage>Lien invalide ou expiré. Refaites une demande.</FormMessage>
      )}
      <Button type="submit" disabled={isSubmitting}>
        Enregistrer
      </Button>
    </form>
  );
}
