/**
 * Donne le rôle administrateur à un compte existant :
 *   pnpm make-admin client@exemple.fr
 *
 * En production (sur le serveur) :
 *   docker compose -f docker-compose.prod.yml run --rm migrate pnpm make-admin client@exemple.fr
 */
import { createScriptClient } from "./db-client";

const email = process.argv[2];

async function main() {
  if (!email) {
    console.error("Usage : pnpm make-admin email@exemple.fr");
    process.exitCode = 1;
    return;
  }
  const prisma = createScriptClient();
  try {
    const user = await prisma.user.update({ where: { email }, data: { role: "admin" } });
    console.info(`✔ ${user.email} est maintenant administrateur.`);
  } catch {
    console.error(`Aucun compte trouvé pour ${email}. Crée d'abord le compte sur le site.`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
