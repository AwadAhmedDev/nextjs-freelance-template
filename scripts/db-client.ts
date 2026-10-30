import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Client Prisma pour les SCRIPTS en ligne de commande (seed, make-admin...).
 * L'application, elle, utilise src/lib/prisma.ts.
 */
export function createScriptClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL manquante dans .env");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
