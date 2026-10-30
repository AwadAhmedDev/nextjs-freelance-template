#!/usr/bin/env sh
# Restaure une sauvegarde dans la base de production (ou de test).
#   ./scripts/restore-db.sh backups/db_2026-11-01_0315.dump
#
# ⚠️ Écrase les données actuelles. Arrête l'application avant :
#   docker compose -f docker-compose.prod.yml stop app
set -eu

FILE="${1:?Usage : ./scripts/restore-db.sh chemin/vers/sauvegarde.dump}"
COMPOSE="docker compose -f docker-compose.prod.yml"

[ -s "$FILE" ] || { echo "Fichier introuvable ou vide : $FILE" >&2; exit 1; }

$COMPOSE exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < "$FILE"
echo "✔ Restauration terminée depuis $FILE"
