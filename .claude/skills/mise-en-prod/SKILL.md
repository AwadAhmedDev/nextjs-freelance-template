---
name: mise-en-prod
description: Préparer et vérifier une mise en production (checklist sécurité, RGPD, performance, variables, sauvegardes, déploiement sur VPS). Utiliser avant une livraison client ou un premier déploiement.
---

# Mise en production

Référence complète : `docs/mise-en-production.md`. Ne lance aucune commande sur le serveur
sans l'accord explicite de l'utilisateur.

## 1. Vérifications locales (lance-les et rapporte les résultats)

- `pnpm format:check && pnpm check`
- `pnpm build`
- `pnpm test:e2e`
- `pnpm audit --prod --audit-level=high`

## 2. Revue

- Lance l'agent `revue-securite` sur tout le projet et résume ses points bloquants.
- Vérifie que chaque variable de `src/lib/env.ts` est présente dans `.env.production.example`.
- Vérifie mentions légales, politique de confidentialité, `siteConfig` sans valeurs d'exemple.
- Vérifie `robots.ts` et `sitemap.ts` (domaine réel).

## 3. Checklist à remplir avec l'utilisateur

- [ ] Domaine pointé vers le VPS (enregistrements A / AAAA)
- [ ] `.env` du serveur rempli, `chmod 600`, secrets de **production** (clés Stripe live)
- [ ] Webhook Stripe créé sur `https://<domaine>/api/webhooks/stripe` (événements checkout.session.*)
- [ ] Domaine d'envoi vérifié dans Resend (SPF, DKIM)
- [ ] Bucket S3 : CORS limité au domaine, accès public uniquement en lecture si nécessaire
- [ ] Secrets GitHub `VPS_*` et variables `NEXT_PUBLIC_APP_URL`, `DEPLOY_ENABLED=true`
- [ ] Sauvegarde quotidienne programmée ET restauration testée
- [ ] Sonde de disponibilité sur `/api/health`
- [ ] Suivi des erreurs (Sentry) branché
- [ ] Compte admin créé (`make-admin`)

## 4. Après le déploiement

- `curl -I https://<domaine>` : vérifier HTTPS, HSTS, CSP.
- Faire un vrai parcours : inscription, réservation, paiement en mode test puis live.
- Donner à l'utilisateur un résumé livrable au client.
