import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "2 caractères minimum").max(80),
  email: z.email("Adresse email invalide"),
  password: z.string().min(10, "10 caractères minimum").max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Adresse email invalide"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(10, "10 caractères minimum").max(128),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
