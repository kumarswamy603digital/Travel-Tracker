#!/bin/bash
# Backup Script - Create a backup of the travel_tracker database

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_travel_tracker_${TIMESTAMP}.sql"

if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGDATABASE=${PGDATABASE:-travel_tracker}

echo "Creating backup: $BACKUP_FILE"
pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Backup created successfully"
    ls -lh "$BACKUP_FILE"
else
    echo "✗ Backup failed"
    exit 1
fi
