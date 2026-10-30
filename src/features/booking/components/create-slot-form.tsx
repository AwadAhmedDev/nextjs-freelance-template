"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSlotAction } from "../actions";
import { createSlotSchema } from "../schema";

type FormValues = { startsAtLocal: string; durationMinutes: string; priceEuros: string };

/**
 * Formulaire d'administration. La date saisie est dans le fuseau du navigateur :
 * on la convertit en ISO (UTC) avant de l'envoyer, pour éviter tout décalage horaire.
 * Le même schéma Zod est vérifié ici ET dans la Server Action.
 */
export function CreateSlotForm() {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string }>();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { durationMinutes: "60", priceEuros: "35" } });

  async function onSubmit(values: FormValues) {
    setMessage(undefined);
    const input = {
      startsAt: values.startsAtLocal ? new Date(values.startsAtLocal).toISOString() : "",
      durationMinutes: values.durationMinutes,
      priceEuros: values.priceEuros,
    };

    const check = createSlotSchema.safeParse(input);
    if (!check.success) {
      for (const issue of check.error.issues) {
        const field =
          issue.path[0] === "startsAt" ? "startsAtLocal" : (issue.path[0] as keyof FormValues);
        setError(field, { message: issue.message });
      }
      return;
    }

    const result = await createSlotAction(input);
    if (!result.ok) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Créneau ajouté." });
    reset();
    router.refresh();
  }

  return (
    <form
      method="post"
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 sm:grid-cols-4 sm:items-end"
      noValidate
    >
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="startsAtLocal">Date et heure</Label>
        <Input
          id="startsAtLocal"
          type="datetime-local"
          aria-invalid={!!errors.startsAtLocal}
          {...register("startsAtLocal")}
        />
        <FormMessage>{errors.startsAtLocal?.message}</FormMessage>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="durationMinutes">Durée (min)</Label>
        <Input
          id="durationMinutes"
          type="number"
          min={15}
          step={15}
          {...register("durationMinutes")}
        />
        <FormMessage>{errors.durationMinutes?.message}</FormMessage>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="priceEuros">Prix (€)</Label>
        <Input id="priceEuros" type="number" min={1} step="0.01" {...register("priceEuros")} />
        <FormMessage>{errors.priceEuros?.message}</FormMessage>
      </div>
      <div className="grid gap-2 sm:col-span-4">
        <Button type="submit" disabled={isSubmitting} className="sm:w-fit">
          Ajouter le créneau
        </Button>
        <FormMessage type={message?.type}>{message?.text}</FormMessage>
      </div>
    </form>
  );
}
