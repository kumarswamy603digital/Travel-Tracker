#!/bin/bash
# Travel Tracker - Linux/Mac Setup Script

set -e

echo "========================================="
echo "Travel Tracker - Linux/Mac Setup"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js not found${NC}"
    echo "Install from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}[✓] Node.js installed:${NC}"
node --version
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm not found${NC}"
    exit 1
fi

echo -e "${GREEN}[✓] npm installed:${NC}"
npm --version
echo ""

# Create .env if doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}[!] Creating .env from .env.example${NC}"
    cp .env.example .env
    echo -e "${GREEN}[✓] .env created${NC}"
    echo ""
    echo -e "${YELLOW}[!] IMPORTANT: Edit .env and set your PostgreSQL password!${NC}"
    echo ""
fi

# Install dependencies
echo -e "${YELLOW}[*] Installing dependencies...${NC}"
npm install
echo -e "${GREEN}[✓] Dependencies installed${NC}"
echo ""

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo -e "${GREEN}[✓] PostgreSQL installed:${NC}"
    psql --version
    echo ""
else
    echo -e "${YELLOW}[!] PostgreSQL not found or not in PATH${NC}"
    echo "Install: brew install postgresql (Mac) or apt install postgresql (Linux)"
    echo ""
fi

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Edit .env: nano .env (set PGPASSWORD)"
echo "2. Setup database: npm run db:setup"
echo "3. Start app: npm start"
echo "4. Open http://localhost:3000"
echo ""
echo -e "${YELLOW}Commands:${NC}"
echo "  npm start        - Start application"
echo "  npm run dev      - Start with auto-reload"
echo "  npm run db:setup - Setup database"
echo "  npm run db:reset - Reset database"
echo ""
