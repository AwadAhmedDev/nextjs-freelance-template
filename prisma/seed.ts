/**
 * Données de démonstration : `pnpm db:seed`
 * - un compte administrateur
 * - quelques créneaux sur les prochains jours
 *
 * À adapter pour chaque projet. Ne lance JAMAIS ce script sur la base de production.
 */
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { createScriptClient } from "../scripts/db-client";

const prisma = createScriptClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@exemple.fr";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "motdepasse-admin-local";

async function seedAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.info(`Admin déjà présent : ${ADMIN_EMAIL}`);
    return;
  }

  const userId = randomUUID();
  await prisma.user.create({
    data: {
      id: userId,
      name: "Administrateur",
      email: ADMIN_EMAIL,
      emailVerified: true,
      role: "admin",
      // Même format que Better Auth pour un compte email + mot de passe.
      accounts: {
        create: {
          id: randomUUID(),
          accountId: userId,
          providerId: "credential",
          password: await hashPassword(ADMIN_PASSWORD),
        },
      },
    },
  });
  console.info(`Admin créé : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

async function seedSlots() {
  const count = await prisma.slot.count();
  if (count > 0) {
    console.info(`${count} créneaux déjà présents.`);
    return;
  }

  const slots = [];
  for (let day = 1; day <= 5; day++) {
    for (const hour of [9, 11, 14, 16]) {
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + day);
      startsAt.setHours(hour, 0, 0, 0);
      slots.push({ startsAt, durationMinutes: 60, priceCents: 3500 });
    }
  }
  await prisma.slot.createMany({ data: slots });
  console.info(`${slots.length} créneaux créés.`);
}

async function main() {
  await seedAdmin();
  await seedSlots();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
