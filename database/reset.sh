#!/bin/bash
# Database Reset Script - Completely removes and recreates the database
# WARNING: This will delete all data!

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGDATABASE=${PGDATABASE:-travel_tracker}

echo -e "${RED}========================================${NC}"
echo -e "${RED}WARNING: Database Reset${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo -e "${YELLOW}This will DELETE all data in: $PGDATABASE${NC}"
echo ""
echo -e "${YELLOW}Type 'yes' to confirm reset: ${NC}"
read -r confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Reset cancelled"
    exit 0
fi

echo ""
echo -e "${YELLOW}Dropping database...${NC}"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -c "DROP DATABASE IF EXISTS $PGDATABASE;"
echo -e "${GREEN}✓ Database dropped${NC}"

echo -e "${YELLOW}Creating fresh database...${NC}"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -c "CREATE DATABASE $PGDATABASE;"
echo -e "${GREEN}✓ Database created${NC}"

echo -e "${YELLOW}Running schema setup...${NC}"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -f database/schema.sql -d "$PGDATABASE"
echo -e "${GREEN}✓ Schema created${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database reset completed!${NC}"
echo -e "${GREEN}========================================${NC}"
