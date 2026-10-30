# Architecture

## Le chemin d'une action utilisateur (exemple : réserver un créneau)

```
Navigateur ──(formulaire)──► Server Action      src/features/booking/actions.ts
                               1. session (qui ?)
                               2. rôle (a-t-il le droit ?)
                               3. rate limit (trop d'essais ?)
                               4. Zod (données valides ?)
                               ▼
                             Service            src/features/booking/service.ts
                               règles métier (rules.ts), montant calculé ICI
                               ▼                         ▼
                             Prisma ──► PostgreSQL     Stripe (page de paiement)
                               ▼
                             ActionResult ──► l'interface affiche le succès ou l'erreur
```

Plus tard, **Stripe appelle le site** (le navigateur n'est pas impliqué) :

```
Stripe ──(POST signé)──► Route Handler   src/app/api/webhooks/stripe/route.ts
                           vérifie la signature
                           ▼
                         payments/service.ts  → déjà traité ? (table stripe_event)
                           ▼
                         booking/service.ts confirmBooking → statut CONFIRMED → email
```

## Server Action ou Route Handler ?

| Qui appelle ?                              | Outil                             |
| ------------------------------------------ | --------------------------------- |
| Un formulaire de NOTRE site                | Server Action                     |
| Un service extérieur (Stripe, cron, sonde) | Route Handler (`src/app/api/...`) |
| Une page qui affiche des données           | Server Component + `queries.ts`   |

## Rôle de chaque dossier

| Dossier                  | Contenu                                | Règle                                   |
| ------------------------ | -------------------------------------- | --------------------------------------- |
| `src/app`                | routes, pages, layouts, `api/`         | pages minces, pas de logique métier     |
| `src/features/<domaine>` | tout ce qui concerne un domaine métier | un dossier par domaine                  |
| `src/lib`                | briques techniques partagées           | aucune règle métier                     |
| `src/components/ui`      | composants shadcn                      | génériques, sans données                |
| `src/emails`             | modèles d'emails react-email           |                                         |
| `prisma`                 | schéma, migrations, seed               | une migration par changement            |
| `scripts`                | scripts en ligne de commande           | client Prisma de `scripts/db-client.ts` |
| `tests/e2e`              | Playwright                             | sélecteurs accessibles                  |

## Sécurité en profondeur (plusieurs barrières)

1. `proxy.ts` : redirige vite si pas de cookie (confort uniquement)
2. Page : `requireUser()` / `requireAdmin()`
3. Server Action : session + rôle + rate limit + Zod
4. Service : vérifie la propriété des données et les règles
5. Base : contraintes uniques (`slotId @unique` empêche la double réservation)

## Cache Components (Next.js 16)

Les pages sont pré-rendues en HTML statique ; les parties qui dépendent de la session ou
de la base sont « trouées » et remplies à la demande. Concrètement : un composant qui lit
la session ou la base doit être dans un `<Suspense>`.
