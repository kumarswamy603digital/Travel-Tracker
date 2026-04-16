#!/bin/bash
# Database Setup Script for Travel Tracker
# This script sets up the PostgreSQL database with required tables and sample data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Travel Tracker Database Setup${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql (PostgreSQL client) not found${NC}"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Get database configuration from .env or use defaults
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGDATABASE=${PGDATABASE:-travel_tracker}

echo -e "${YELLOW}Database Configuration:${NC}"
echo "Host: $PGHOST"
echo "Port: $PGPORT"
echo "User: $PGUSER"
echo "Database: $PGDATABASE"
echo ""

# Function to run SQL file
run_sql_file() {
    local file=$1
    local name=$2
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}Error: File not found: $file${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Running: $name...${NC}"
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -f "$file" -d "$PGDATABASE" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $name completed${NC}"
    else
        echo -e "${RED}✗ $name failed${NC}"
        return 1
    fi
}

# Create database if it doesn't exist
echo -e "${YELLOW}Creating database if it doesn't exist...${NC}"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -tc "SELECT 1 FROM pg_database WHERE datname = '$PGDATABASE'" | grep -q 1 || \
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -c "CREATE DATABASE $PGDATABASE;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database ready${NC}"
else
    echo -e "${RED}✗ Failed to create database${NC}"
    exit 1
fi

echo ""

# Run schema setup
if run_sql_file "database/schema.sql" "Schema Setup"; then
    echo ""
else
    echo -e "${RED}Setup failed at schema creation${NC}"
    exit 1
fi

# Optionally seed with sample data
echo ""
echo -e "${YELLOW}Would you like to load sample countries data? (y/n)${NC}"
read -r response

if [[ "$response" == "y" || "$response" == "Y" ]]; then
    if run_sql_file "database/full-setup-sample-countries.sql" "Sample Data Import"; then
        echo ""
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify database: psql -U $PGUSER -d $PGDATABASE -c '\\dt'"
echo "2. Start the application: npm start"
echo "3. Open http://localhost:3000"
echo ""
