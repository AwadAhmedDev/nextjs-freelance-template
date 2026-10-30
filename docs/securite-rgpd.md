# Sécurité et RGPD

## Checklist sécurité (à repasser avant chaque livraison)

### Déjà en place dans le template

- [x] En-têtes : CSP, HSTS (en HTTPS), X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- [x] Validation Zod côté serveur de toutes les entrées
- [x] Variables d'environnement validées au démarrage (`src/lib/env.ts`)
- [x] Sessions en base, cookies `httpOnly`, révocation à la réinitialisation du mot de passe
- [x] Rate limiting : connexion (5/min), inscription (3/min), mot de passe oublié (3/5 min), réservation
- [x] Rôle non modifiable à l'inscription (`input: false`), testé
- [x] Webhook Stripe : signature vérifiée + idempotence
- [x] Montants calculés côté serveur, jamais reçus du navigateur
- [x] Uploads : type et taille validés, nom de fichier généré par le serveur
- [x] Base de données non exposée sur Internet, conteneur applicatif sans root
- [x] Erreurs techniques jamais montrées à l'utilisateur
- [x] Audit des dépendances en CI + Dependabot

### À vérifier pour chaque nouvelle fonctionnalité

- [ ] Qui peut lire ? Qui peut modifier ? Testé avec un compte sans droit
- [ ] Les requêtes filtrent par `userId` venant de la session (pas d'IDOR)
- [ ] Les nouveaux domaines externes sont ajoutés à la CSP
- [ ] Aucun secret dans le code ni dans un `NEXT_PUBLIC_*`
- [ ] Lancer l'agent `revue-securite`

## RGPD — fiche à remplir pour chaque client

| Question                  | Réponse pour ce projet                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Responsable de traitement | (le client : raison sociale, adresse)                                                                                        |
| Données collectées        | nom, email, mot de passe (haché), réservations, paiements (chez Stripe)                                                      |
| Finalité                  | gestion des comptes et des rendez-vous                                                                                       |
| Base légale               | exécution du contrat                                                                                                         |
| Durée de conservation     | comptes : jusqu'à suppression + 3 ans d'inactivité ; factures : 10 ans                                                       |
| Sous-traitants            | hébergeur VPS, Stripe, Resend, stockage S3 (vérifier : UE de préférence)                                                     |
| Transferts hors UE        | à vérifier pour chaque sous-traitant                                                                                         |
| Cookies                   | uniquement le cookie de session (exempté de consentement) — pas de bannière tant qu'il n'y a pas d'outil d'analyse ou de pub |
| Droits des personnes      | email de contact dans la politique de confidentialité                                                                        |

### Points d'attention

- Ajouter Google Analytics, un pixel ou une vidéo YouTube ⇒ **bannière de consentement obligatoire**.
  Préférer une mesure d'audience exemptée (Plausible, Matomo configuré selon la CNIL).
- Les polices sont servies par le site (pas d'appel à Google Fonts).
- Prévoir une façon de supprimer un compte (à la demande, ou via une page dédiée).
- Les sauvegardes contiennent des données personnelles : stockage chiffré, accès limité.
