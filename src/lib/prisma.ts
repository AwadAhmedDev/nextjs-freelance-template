import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * Une seule instance de Prisma pour toute l'application.
 * Elle garde un pool de connexions ouvert vers PostgreSQL.
 *
 * En développement, le rechargement à chaud recrée les modules :
 * on garde l'instance sur globalThis pour ne pas ouvrir de nouvelles
 * connexions à chaque modification de fichier.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
