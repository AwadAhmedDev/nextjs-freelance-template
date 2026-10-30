# Décisions techniques

Format : contexte → décision → conséquences. Ajouter une entrée pour chaque choix structurant.

## 1. Next.js FullStack plutôt que front + API séparés

- **Contexte** : projets clients de petite/moyenne taille, un seul développeur.
- **Décision** : une seule application Next.js (pages + Server Actions + Route Handlers).
- **Conséquences** : un seul déploiement, des types partagés, moins de code. Si une API publique
  ou une app mobile arrive, on ajoute des Route Handlers (ou une API Express séparée).

## 2. Better Auth avec sessions en base (pas de JWT)

- Révocation immédiate (déconnexion, mot de passe changé), pas de jeton à faire expirer.
- Coût : une lecture en base par requête authentifiée, négligeable à cette échelle.

## 3. Prisma 7 + PostgreSQL

- Schéma lisible, migrations versionnées, types générés.
- PostgreSQL : fiable, gratuit, contraintes fortes (unicité, clés étrangères).

## 4. Service entre l'action et la base

- Les règles métier sont réutilisées par les actions ET le webhook, et testables.

## 5. Montants en centimes (Int)

- Pas d'erreur d'arrondi des nombres à virgule.

## 6. Webhook Stripe pour confirmer un paiement

- La redirection du navigateur n'est pas fiable (onglet fermé, réseau). Seul Stripe fait foi.
- Table `stripe_event` pour ne jamais traiter deux fois le même événement.

## 7. VPS + Docker + Caddy plutôt que Vercel

- Coût fixe et faible, données en France/UE, HTTPS automatique, pas de dépendance à une plateforme.
- Coût : maintenance du serveur (mises à jour, sauvegardes) à facturer au client.
- Vercel reste possible (base PostgreSQL managée à part) ; le rate limiting en mémoire devra alors passer sur Redis.

## 8. Rate limiting en mémoire

- Suffisant pour un seul serveur. Passer à Redis si plusieurs instances.

## 9. CSP sans nonce

- Garde les pages pré-rendues (rapides). `unsafe-inline` reste nécessaire pour les scripts
  de Next.js ; le risque XSS est réduit par React (échappement) et l'absence de `dangerouslySetInnerHTML`.
