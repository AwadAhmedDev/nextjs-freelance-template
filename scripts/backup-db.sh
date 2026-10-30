#!/usr/bin/env sh
# Sauvegarde quotidienne de PostgreSQL sur le VPS.
#
# Installation (une fois, sur le serveur) :
#   chmod +x scripts/backup-db.sh
#   crontab -e
#   15 3 * * * cd /opt/app && ./scripts/backup-db.sh >> /var/log/backup-db.log 2>&1
#
# Une sauvegarde qui n'a jamais été restaurée n'est PAS une sauvegarde :
# teste la restauration une fois par mois (voir docs/mise-en-production.md).
set -eu

COMPOSE="docker compose -f docker-compose.prod.yml"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y-%m-%d_%H%M)"
FILE="$BACKUP_DIR/db_$STAMP.dump"

mkdir -p "$BACKUP_DIR"

# Format "custom" : compressé, restaurable table par table avec pg_restore.
$COMPOSE exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner' > "$FILE"

# Une sauvegarde vide = un échec silencieux. On le rend bruyant.
if [ ! -s "$FILE" ]; then
  echo "❌ Sauvegarde vide : $FILE" >&2
  exit 1
fi

echo "✔ Sauvegarde créée : $FILE ($(du -h "$FILE" | cut -f1))"

# Supprime les sauvegardes locales trop anciennes.
find "$BACKUP_DIR" -name 'db_*.dump' -mtime +"$KEEP_DAYS" -delete

# Copie HORS du serveur (obligatoire : si le VPS disparaît, les sauvegardes aussi).
# Exemple avec rclone vers un bucket S3 / R2 / Backblaze configuré au préalable :
#   rclone copy "$FILE" remote:mon-bucket-sauvegardes/
