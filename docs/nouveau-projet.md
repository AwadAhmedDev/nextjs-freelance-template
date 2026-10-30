# Démarrer un nouveau projet client

## 1. Créer le dépôt

```bash
gh repo create mon-client --private --template TON-COMPTE/nextjs-freelance-template --clone
cd mon-client
pnpm install
cp .env.example .env    # puis BETTER_AUTH_SECRET = openssl rand -base64 32
docker compose up -d && pnpm db:migrate && pnpm db:seed
pnpm dev
```

## 2. Laisser Claude Code faire l'adaptation

```
claude
> /analyse-projet   (colle le brief du client)
> /nouveau-projet
```

## 3. Fichiers à modifier (si tu le fais à la main)

| Fichier                                               | Quoi                                    |
| ----------------------------------------------------- | --------------------------------------- |
| `package.json`                                        | `name`                                  |
| `src/lib/site.ts`                                     | nom, description, entreprise, hébergeur |
| `src/app/page.tsx`                                    | page d'accueil + JSON-LD                |
| `src/app/mentions-legales`, `src/app/confidentialite` | textes légaux                           |
| `src/app/globals.css`                                 | couleurs (variables `--primary`, etc.)  |
| `src/emails/*`                                        | signature et textes                     |
| `src/app/favicon.ico`, `public/`                      | logo, images                            |
| `prisma/schema.prisma`                                | modèles métier du client                |
| `.env.production.example`                             | nom d'image GHCR, domaine               |

## 4. Garder ou retirer le module d'exemple « réservation »

**Garder** si le client vend des rendez-vous / prestations avec acompte.

**Retirer** sinon :

1. Supprimer `src/features/booking`, `src/features/payments`, `src/app/reservation`.
2. Adapter `src/app/admin`, `src/app/espace`, `site-header.tsx`, `sitemap.ts`.
3. Dans `prisma/schema.prisma`, retirer `Slot`, `Booking`, `BookingStatus` (et `StripeEvent` si plus de paiement).
4. Supprimer `prisma/migrations/*` puis `pnpm db:migrate --name init` (base locale vide).
5. Nettoyer `prisma/seed.ts` et `tests/e2e`.
6. Pas de paiement : supprimer `src/lib/stripe.ts`, `src/app/api/webhooks/stripe`, la CSP Stripe, les variables `STRIPE_*`.
7. `pnpm check && pnpm build`.

## 5. Avant la première livraison

`/mise-en-prod` dans Claude Code, puis `docs/mise-en-production.md`.
