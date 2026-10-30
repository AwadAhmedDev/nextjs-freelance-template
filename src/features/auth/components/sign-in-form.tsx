"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { type SignInInput, signInSchema } from "../schema";

export function SignInForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInInput) {
    setError(undefined);
    const { error } = await signIn.email(values);
    if (error) {
      // Message volontairement vague : ne pas révéler si l'email existe.
      setError(
        error.status === 429
          ? "Trop de tentatives. Réessayez dans une minute."
          : "Email ou mot de passe incorrect.",
      );
      return;
    }
    router.push("/espace");
    router.refresh();
  }

  return (
    <div className="grid gap-4">
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
        <div className="grid gap-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FormMessage>{errors.password?.message}</FormMessage>
        </div>
        <FormMessage>{error}</FormMessage>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      {googleEnabled && (
        <Button
          variant="outline"
          onClick={() => signIn.social({ provider: "google", callbackURL: "/espace" })}
        >
          Continuer avec Google
        </Button>
      )}
    </div>
  );
}
