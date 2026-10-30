import { Prisma } from "@/generated/prisma/client";

/**
 * Vrai si PostgreSQL a refusé l'écriture à cause d'une contrainte d'unicité
 * (code Prisma P2002). Exemple : deux personnes réservent le même créneau
 * à la même seconde ; la base accepte la première et refuse la seconde.
 */
export function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Vrai si l'enregistrement à modifier ou supprimer n'existe pas (code P2025). */
export function isNotFoundError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}
