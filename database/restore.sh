#!/bin/bash
# Restore Script - Restore database from a backup file

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    echo "Example: ./restore.sh backup_travel_tracker_20240416_103000.sql"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGDATABASE=${PGDATABASE:-travel_tracker}

echo "Restoring from: $BACKUP_FILE"
echo "This will overwrite the current database!"
read -p "Continue? (yes/no) " -r

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled"
    exit 1
fi

psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE" < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Restore completed successfully"
else
    echo "✗ Restore failed"
    exit 1
fi
