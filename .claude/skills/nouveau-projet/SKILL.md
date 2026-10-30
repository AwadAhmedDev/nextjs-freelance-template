---
name: nouveau-projet
description: Adapter ce template à un nouveau client (nom, SEO, mentions légales, suppression du module d'exemple, variables d'environnement). Utiliser juste après avoir cloné le template pour un nouveau projet.
---

# Adapter le template à un nouveau client

Suis `docs/nouveau-projet.md`. Demande d'abord à l'utilisateur les informations manquantes :
nom du site, description, raison sociale, adresse, email, téléphone, SIRET, hébergeur,
domaine, et si le module "réservation + acompte" d'exemple est conservé.

## Étapes

1. `package.json` : renommer `name`.
2. `src/lib/site.ts` : remplir `siteConfig` (nom, description, entreprise, hébergeur).
3. `src/app/page.tsx` : adapter le texte d'accueil et le JSON-LD (type d'entreprise).
4. `src/app/mentions-legales` et `src/app/confidentialite` : vérifier les textes
   (données collectées, durées de conservation, sous-traitants : hébergeur, Stripe, Resend, stockage).
5. `src/emails/` : adapter la signature et les textes.
6. Si le module réservation n'est **pas** conservé :
   - supprimer `src/features/booking`, `src/features/payments`, `src/app/reservation`, `src/app/admin` (ou l'adapter)
   - retirer les modèles `Slot`, `Booking`, `BookingStatus`, `StripeEvent` de `prisma/schema.prisma` si inutiles
   - supprimer `prisma/migrations` et recréer une migration initiale : `pnpm db:migrate --name init`
   - nettoyer `prisma/seed.ts`, `sitemap.ts`, `site-header.tsx`, les tests e2e
   - si plus de paiement : supprimer `src/lib/stripe.ts`, la route webhook et la CSP Stripe
7. `.env` : générer `BETTER_AUTH_SECRET` (`openssl rand -base64 32`).
8. Lancer `pnpm check` puis `pnpm build` et corriger.
9. Résumer à l'utilisateur ce qui a été changé et ce qu'il reste à faire à la main
   (domaine, comptes Stripe/Resend/S3, secrets GitHub).
