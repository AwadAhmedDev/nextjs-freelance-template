"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth-client";
import { type ForgotPasswordInput, forgotPasswordSchema } from "../schema";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit({ email }: ForgotPasswordInput) {
    await requestPasswordReset({ email, redirectTo: "/reinitialiser-mot-de-passe" });
    // Même message dans tous les cas : ne pas révéler si un compte existe.
    setSent(true);
  }

  if (sent) {
    return (
      <FormMessage type="success">
        Si un compte existe pour cet email, vous allez recevoir un lien de réinitialisation.
      </FormMessage>
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FormMessage>{errors.email?.message}</FormMessage>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        Recevoir un lien
      </Button>
    </form>
  );
}
