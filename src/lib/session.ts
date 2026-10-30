import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

/**
 * COUCHE D'ACCÈS À LA SESSION : le seul endroit où l'on lit qui est connecté.
 *
 * - Dans une PAGE protégée : requireUser() ou requireAdmin() → redirige si besoin.
 * - Dans une SERVER ACTION : getCurrentUser() → renvoie null, et l'action renvoie une erreur.
 *
 * Règle : les droits se vérifient TOUJOURS côté serveur, dans chaque action
 * et chaque page sensible. Cacher un bouton ne protège rien.
 *
 * Avec Cache Components, lire la session est une lecture "à la demande" :
 * le composant qui l'appelle doit être dans un <Suspense>.
 */

export type Role = "user" | "admin";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/** Utilisateur connecté, ou null. Mis en cache pour la durée d'une requête. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { id, name, email, role } = session.user;
  // On ne renvoie que les champs utiles, jamais l'objet brut de la session.
  return { id, name, email, role: role === "admin" ? "admin" : "user" };
});

/** Pour une page réservée aux utilisateurs connectés. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

/** Pour une page réservée aux administrateurs. Renvoie vers l'espace client sinon. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/espace");
  return user;
}
