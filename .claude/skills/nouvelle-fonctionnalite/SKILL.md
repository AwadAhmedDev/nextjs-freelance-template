---
name: nouvelle-fonctionnalite
description: Créer un module métier complet (schéma Prisma, Zod, règles, service, Server Actions, composants, tests) selon l'architecture du template. Utiliser quand l'utilisateur demande une nouvelle fonctionnalité, un nouveau formulaire ou une nouvelle entité.
---

# Nouvelle fonctionnalité

Modèle à imiter : `src/features/booking` (le module le plus complet du template).
Lis-le avant de commencer.

## 1. Conception (montre-la AVANT de coder et attends un "ok")

- Ce que fait la fonctionnalité, pour quel rôle.
- Modèle de données : nouveaux modèles/champs Prisma, contraintes d'unicité, index.
- Liste des fichiers à créer ou modifier.
- Règles métier et cas limites (doublons, droits, montants, dates).
- Risques sécurité (qui peut lire / modifier quoi ?).

## 2. Implémentation, dans cet ordre

1. `prisma/schema.prisma` puis `pnpm db:migrate --name <nom>`.
2. `src/features/<domaine>/schema.ts` — schémas Zod avec messages en français.
3. `rules.ts` — fonctions pures + `rules.test.ts`.
4. `service.ts` — `import "server-only"`, logique métier, `BusinessError` pour les cas attendus,
   transactions ou contraintes uniques pour éviter les doublons.
5. `queries.ts` — lectures, en ne sélectionnant que les champs utiles (`select`).
6. `actions.ts` — respecter l'ordre obligatoire de CLAUDE.md (session → rôle → rate limit → Zod → service → ActionResult).
7. `components/` — formulaires avec React Hook Form + `zodResolver` ou `useActionState`.
8. Page dans `src/app/...` : mince, données dans un composant sous `<Suspense>`.
9. Mettre à jour `sitemap.ts` si la page est publique, et la navigation.

## 3. Vérification

- `pnpm check` doit passer.
- Ajouter un test e2e dans `tests/e2e` pour le parcours principal.
- Lister à l'utilisateur ce qui a été testé et ce qui reste à tester à la main.
- Proposer de lancer l'agent `revue-securite` sur le module.
