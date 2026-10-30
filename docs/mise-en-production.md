# Mise en production (VPS + Docker + Caddy)

## 1. Serveur (une seule fois)

VPS Ubuntu 24.04 (Hetzner, OVH, Scaleway…), 2 Go de RAM minimum.

```bash
# Utilisateur non-root + clé SSH, puis :
sudo apt update && sudo apt upgrade -y
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # se reconnecter ensuite
# Désactiver la connexion SSH par mot de passe : PasswordAuthentication no
```

## 2. Projet sur le serveur

```bash
sudo mkdir -p /opt/app && sudo chown $USER /opt/app
git clone git@github.com:TON-COMPTE/mon-client.git /opt/app   # clé de déploiement en lecture
cd /opt/app
cp .env.production.example .env && chmod 600 .env
nano .env    # remplir TOUTES les valeurs (secrets de production)
```

Le domaine (`DOMAIN`) doit pointer vers l'IP du VPS (enregistrements A/AAAA) **avant**
le premier démarrage : Caddy obtient alors le certificat HTTPS tout seul.

## 3. Premier démarrage

Sans CI (construction sur le serveur) :

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm migrate
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml run --rm migrate pnpm make-admin client@exemple.fr
```

## 4. Déploiement automatique (GitHub Actions)

Dans le dépôt GitHub → _Settings → Secrets and variables → Actions_ :

| Type     | Nom                               | Valeur                           |
| -------- | --------------------------------- | -------------------------------- |
| Variable | `DEPLOY_ENABLED`                  | `true`                           |
| Variable | `NEXT_PUBLIC_APP_URL`             | `https://www.client.fr`          |
| Variable | `S3_ENDPOINT`, `S3_PUBLIC_ORIGIN` | si stockage utilisé              |
| Secret   | `VPS_HOST`, `VPS_USER`            | IP et utilisateur                |
| Secret   | `VPS_SSH_KEY`                     | clé privée dédiée au déploiement |
| Secret   | `VPS_APP_DIR`                     | `/opt/app`                       |

Sur le serveur, connecte Docker à GHCR une fois :
`echo TOKEN | docker login ghcr.io -u TON-COMPTE --password-stdin` (token avec `read:packages`).

Ensuite : push sur `main` → CI verte → images publiées → serveur mis à jour → vérification `/api/health`.

## 5. Services externes

- **Stripe** : clés `live`, webhook `https://<domaine>/api/webhooks/stripe` avec les événements
  `checkout.session.completed`, `checkout.session.expired`,
  `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`.
- **Resend** : vérifier le domaine d'envoi (SPF, DKIM, DMARC).
- **S3** : règle CORS autorisant `PUT` depuis le domaine du site uniquement.

## 6. Sauvegardes (obligatoire)

```bash
crontab -e
15 3 * * * cd /opt/app && ./scripts/backup-db.sh >> /var/log/backup-db.log 2>&1
```

- Copier les sauvegardes **hors du serveur** (rclone vers un bucket, voir le script).
- **Tester la restauration** une fois par mois sur une base de test : `./scripts/restore-db.sh <fichier>`.

## 7. Surveillance

- **Disponibilité** : sonde gratuite (UptimeRobot, Better Stack) sur `https://<domaine>/api/health`
  toutes les 5 minutes, alerte par email/SMS.
- **Erreurs** : Sentry. Installation : `npx @sentry/wizard@latest -i nextjs`, puis ajouter
  le domaine `*.ingest.sentry.io` (ou `*.ingest.de.sentry.io` pour l'UE) à `connect-src` dans la CSP.
- **Logs** : `docker compose -f docker-compose.prod.yml logs -f app`.

## 8. Mises à jour

- Dependabot ouvre des PR chaque lundi : laisser la CI tourner, fusionner si vert.
- Système : `sudo apt update && sudo apt upgrade` une fois par mois (ou `unattended-upgrades`).

## Retour arrière rapide

Chaque image est aussi taguée avec le SHA du commit :

```bash
APP_IMAGE=ghcr.io/ton-compte/mon-client:<sha> docker compose -f docker-compose.prod.yml up -d app
```

Attention : une migration déjà appliquée n'est pas annulée automatiquement.
