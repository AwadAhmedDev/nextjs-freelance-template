# Template Next.js FullStack — freelance

Base de départ pour les projets clients : site vitrine SEO + espace client + paiement + back-office.
Le module d'exemple (**réservation de créneaux avec acompte Stripe**) montre l'architecture
complète de bout en bout ; garde-le comme modèle ou supprime-le (voir `docs/nouveau-projet.md`).

## Ce qui est inclus

| Domaine     | Outil                                                                          | Où                           |
| ----------- | ------------------------------------------------------------------------------ | ---------------------------- |
| Framework   | Next.js 16, React 19, TypeScript strict                                        | `src/app`                    |
| Interface   | Tailwind v4, shadcn/ui, React Hook Form                                        | `src/components`             |
| Logique     | Server Actions → Service → Prisma                                              | `src/features/<domaine>`     |
| Auth        | Better Auth (email/mot de passe, Google en option, rôles, mot de passe oublié) | `src/lib/auth.ts`            |
| Base        | PostgreSQL + Prisma 7 (migrations, seed)                                       | `prisma/`                    |
| Paiement    | Stripe Checkout + webhook idempotent                                           | `src/features/payments`      |
| Emails      | Resend + react-email                                                           | `src/emails`                 |
| Fichiers    | S3 compatible (R2, Scaleway...) par URL présignée                              | `src/lib/storage.ts`         |
| Sécurité    | CSP, HSTS, rate limiting, validation Zod, env validées                         | `next.config.ts`, `src/lib`  |
| SEO         | metadata, sitemap, robots, JSON-LD                                             | `src/app`                    |
| RGPD        | mentions légales, confidentialité, polices locales                             | `src/app`                    |
| Tests       | Vitest + Playwright                                                            | `*.test.ts`, `tests/e2e`     |
| Déploiement | Docker, Caddy (HTTPS auto), GitHub Actions, sauvegardes                        | racine, `.github`, `scripts` |
| Claude Code | `CLAUDE.md`, 4 skills, 2 agents                                                | `.claude/`                   |

## Démarrage rapide (≈ 5 minutes)

Prérequis : Node 22+, pnpm (`corepack enable`), Docker.

```bash
pnpm install
cp .env.example .env
# Génère un secret et colle-le dans BETTER_AUTH_SECRET :
openssl rand -base64 32

docker compose up -d          # PostgreSQL local
pnpm db:migrate               # crée les tables
pnpm db:seed                  # admin + créneaux de démo
pnpm dev                      # http://localhost:3000
```

Compte admin de démo : `admin@exemple.fr` / `motdepasse-admin-local`.

Sans clés Stripe / Resend / S3, l'application fonctionne quand même :
les emails s'affichent dans le terminal, le paiement et l'upload affichent un message clair.

## Démarrer un NOUVEAU projet client à partir de ce template

**Option 1 — bouton GitHub (recommandé).** Dans les réglages du dépôt, coche
_Template repository_. Ensuite : **Use this template → Create a new repository** (privé).

**Option 2 — en ligne de commande :**

```bash
gh repo create mon-client --private --template TON-COMPTE/nextjs-freelance-template --clone
cd mon-client && pnpm install
```

Puis ouvre Claude Code dans le dossier et lance :

```
/nouveau-projet
```

Détail complet : [`docs/nouveau-projet.md`](docs/nouveau-projet.md).

## Commandes

| Commande                        | Rôle                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                      | serveur de développement                                      |
| `pnpm check`                    | lint + types + tests unitaires (à lancer avant chaque commit) |
| `pnpm test` / `pnpm test:watch` | tests Vitest                                                  |
| `pnpm build && pnpm test:e2e`   | tests Playwright sur l'application compilée                   |
| `pnpm db:migrate --name xxx`    | nouvelle migration après modification du schéma               |
| `pnpm db:studio`                | explorer la base dans le navigateur                           |
| `pnpm make-admin email`         | donner le rôle admin à un compte existant                     |
| `pnpm format`                   | formater tout le code                                         |

## Tester le paiement Stripe en local

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copie le "whsec_..." affiché dans STRIPE_WEBHOOK_SECRET, relance pnpm dev
```

Carte de test : `4242 4242 4242 4242`, date future, CVC quelconque.

## Travailler avec Claude Code

`CLAUDE.md` contient les règles du projet (architecture, ordre d'une Server Action, sécurité).
Claude les lit automatiquement à chaque session.

| Commande / agent           | Quand                                                         |
| -------------------------- | ------------------------------------------------------------- |
| `/analyse-projet`          | un client envoie un brief → cadrage, user stories, estimation |
| `/nouveau-projet`          | juste après avoir cloné le template                           |
| `/nouvelle-fonctionnalite` | ajouter un module (schéma → service → action → UI → tests)    |
| `/mise-en-prod`            | avant une livraison                                           |
| agent `revue-securite`     | « lance l'agent revue-securite sur src/features/xxx »         |
| agent `testeur`            | « demande à l'agent testeur de couvrir le module xxx »        |

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — le chemin d'une requête, le rôle de chaque dossier
- [`docs/securite-rgpd.md`](docs/securite-rgpd.md) — checklist sécurité + fiche RGPD client
- [`docs/mise-en-production.md`](docs/mise-en-production.md) — VPS, Caddy, CI/CD, sauvegardes, surveillance
- [`docs/decisions.md`](docs/decisions.md) — pourquoi ces choix techniques
- [`docs/nouveau-projet.md`](docs/nouveau-projet.md) — adapter le template à un client
