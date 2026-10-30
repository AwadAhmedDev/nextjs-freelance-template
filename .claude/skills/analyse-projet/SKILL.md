---
name: analyse-projet
description: Cadrer le besoin d'un client avant de coder. Utiliser au démarrage d'un projet ou d'une grosse fonctionnalité, quand l'utilisateur colle un brief, un mail ou des notes de rendez-vous client.
---

# Analyse d'un besoin client

Objectif : transformer un brief flou en un périmètre clair, chiffrable et validable par le client.
**Ne pas écrire de code pendant cette étape.**

## Étapes

1. **Lire le brief** fourni ($ARGUMENTS ou fichier joint). Lister ce qui est explicite.
2. **Poser les questions manquantes** (5 à 10 maximum), regroupées par thème :
   - Utilisateurs et rôles (qui fait quoi ?)
   - Parcours principal (de l'arrivée sur le site au résultat attendu)
   - Paiement (montant, acompte, remboursement, facture ?)
   - Contenus (qui les modifie ? à quelle fréquence ?)
   - Données personnelles collectées (RGPD)
   - Délais, budget, hébergement, nom de domaine
3. **Rédiger le cadrage** dans `docs/cadrage.md` :
   - Contexte et objectif business (1 paragraphe)
   - Rôles et permissions (tableau)
   - User stories priorisées : **MVP / V2 / hors périmètre**
   - Modèle de données (entités + relations, en texte ou Mermaid)
   - Pages et routes (tableau : route, accès, rôle)
   - Intégrations (Stripe, emails, fichiers...) et ce qu'elles coûtent au client
   - Risques et points à valider
4. **Proposer le découpage** en modules `src/features/<domaine>` réutilisant ce template.
5. **Estimer** en jours, par module, avec une marge de 20 %.

## Règles

- Privilégier le plus simple qui répond au besoin. Signaler tout sur-engineering.
- Tout ce qui n'est pas dans le MVP va explicitement en V2 ou hors périmètre.
- Terminer par la liste des décisions à faire valider par le client.
