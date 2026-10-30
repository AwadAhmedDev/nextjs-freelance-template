# CLAUDE.md — règles du projet

@AGENTS.md

Template Next.js FullStack pour des projets clients freelance (France, RGPD).
Réponds en **français**. Explique simplement, sans jargon inutile.

## Stack (ne pas changer sans décision écrite dans docs/decisions.md)

- Next.js 16 (App Router, Cache Components, `proxy.ts`), React 19, TypeScript strict
- Tailwind CSS v4 + composants shadcn/ui (`src/components/ui`)
- Server Actions pour les formulaires, Route Handlers pour l'extérieur (webhooks, health)
- Better Auth (sessions en base, pas de JWT), Prisma 7 + PostgreSQL
- Zod 4 (validation partagée client/serveur), React Hook Form
- Stripe (paiement), Resend + react-email (emails), S3 compatible (fichiers)
- Vitest (unitaires), Playwright (bout en bout), Docker + Caddy, GitHub Actions

## Commandes

| Besoin                | Commande                                    |
| --------------------- | ------------------------------------------- |
| Lancer en dev         | `docker compose up -d` puis `pnpm dev`      |
| Vérifier avant commit | `pnpm check` (lint + types + tests)         |
| Tests e2e             | `pnpm build && pnpm test:e2e`               |
| Nouvelle migration    | `pnpm db:migrate --name description_courte` |
| Données de démo       | `pnpm db:seed`                              |
| Donner le rôle admin  | `pnpm make-admin email@exemple.fr`          |

## Architecture : où va chaque chose

```
src/features/<domaine>/
  schema.ts      → schémas Zod (partagés navigateur + serveur)
  rules.ts       → règles métier PURES (aucun import base / réseau) + rules.test.ts
  service.ts     → logique métier : Prisma, Stripe, emails. Lance BusinessError.
  queries.ts     → lectures pour les pages (Server Components)
  actions.ts     → Server Actions ("use server") : fines, elles délèguent au service
  components/    → composants du domaine
src/lib/         → briques transverses (auth, prisma, env, email, stripe, storage, rate-limit)
src/app/         → routes uniquement : pages minces qui assemblent des composants
```

## Règles OBLIGATOIRES

### Server Action — toujours dans cet ordre

1. `getCurrentUser()` → refuser si non connecté
2. Vérifier le rôle si nécessaire
3. `rateLimit(...)` sur les actions sensibles
4. `schema.safeParse(...)` → `failure("...", z.flattenError(e).fieldErrors)`
5. Appeler le **service** (jamais Prisma directement dans l'action)
6. Retourner un `ActionResult` (`success` / `failure`). `BusinessError` → message ; autre erreur → `GENERIC_ERROR` + `console.error`
7. `redirect()` toujours **en dehors** du `try/catch`

### Sécurité

- Ne JAMAIS faire confiance au client : l'id utilisateur vient de la session, jamais du formulaire.
- Vérifier la propriété des ressources (`where: { id, userId }`).
- Le `proxy.ts` est un confort, pas une sécurité : chaque page protégée appelle `requireUser()` / `requireAdmin()`.
- Secrets : uniquement via `src/lib/env.ts`. Jamais de préfixe `NEXT_PUBLIC_` sur un secret.
- Nouvelle variable d'env → `env.ts` + `.env.example` + `.env.production.example` + CI.
- Nouveau domaine externe → CSP dans `next.config.ts` (jamais `*`).
- Messages d'erreur vagues pour l'auth (ne pas révéler si un email existe).
- Webhooks : vérifier la signature, traiter de façon **idempotente**.

### Données

- Montants en **centimes** (entiers). Jamais de `Float` pour de l'argent.
- Toute modification du schéma → migration Prisma (`pnpm db:migrate`), jamais `db push` en production.
- Données personnelles : ne collecter que le nécessaire, documenter dans `docs/securite-rgpd.md`.

### Cache Components (Next.js 16)

- Toute lecture de session ou de base se fait dans un composant enveloppé dans `<Suspense>`.
- Les composants de données dynamiques appellent `await connection()` si besoin.
- Un layout n'attend jamais la session au premier niveau.

### Style de code

- TypeScript strict, pas de `any`. Noms de fichiers en kebab-case.
- Commentaires en français, utiles (le **pourquoi**, pas le quoi).
- Composants serveur par défaut ; `"use client"` seulement pour l'interactivité.
- Pas de nouvelle dépendance sans le justifier.

## Méthode de travail attendue

Analyse → conception → implémentation → tests → vérification.
Pour toute fonctionnalité non triviale : propose d'abord un plan court (fichiers touchés,
modèle de données, risques) et attends validation avant de coder.
Termine toujours par `pnpm check` et indique ce qui a été vérifié.

## Skills et agents disponibles

- `/analyse-projet` — cadrer un nouveau besoin client (avant tout code)
- `/nouveau-projet` — adapter ce template à un nouveau client
- `/nouvelle-fonctionnalite` — créer un module complet dans `src/features`
- `/mise-en-prod` — checklist et déploiement
- Agent `revue-securite` — audit sécurité/RGPD en lecture seule
- Agent `testeur` — écrit et lance les tests d'un module
