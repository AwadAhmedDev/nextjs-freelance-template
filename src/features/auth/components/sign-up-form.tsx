"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { type SignUpInput, signUpSchema } from "../schema";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(values: SignUpInput) {
    setError(undefined);
    const { error } = await signUp.email(values);
    if (error) {
      setError(
        error.status === 429
          ? "Trop de tentatives. Réessayez dans une minute."
          : "Inscription impossible. Cet email est peut-être déjà utilisé.",
      );
      return;
    }
    router.push("/espace");
    router.refresh();
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
        <Label htmlFor="name">Nom</Label>
        <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        <FormMessage>{errors.name?.message}</FormMessage>
      </div>
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
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <FormMessage>{errors.password?.message}</FormMessage>
      </div>
      <FormMessage>{error}</FormMessage>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Création du compte…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
