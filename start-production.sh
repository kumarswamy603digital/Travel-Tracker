#!/bin/bash
# Production startup script for Travel Tracker
# This script starts the application with PM2

set -e

echo "========================================="
echo "Travel Tracker Production Startup"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js not found"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

echo "Starting application with PM2..."
echo "Configuration:"
echo "  Environment: ${NODE_ENV:-production}"
echo "  Port: ${PORT:-3000}"
echo "  Host: ${HOST:-localhost}"
echo "  Log Level: ${LOG_LEVEL:-warn}"
echo ""

# Start with PM2
pm2 start ecosystem.config.js --update-env

echo ""
echo "========================================="
echo "Application started successfully!"
echo "========================================="
echo ""
echo "Commands:"
echo "  Monitor:     pm2 monit"
echo "  Logs:        pm2 logs travel-tracker"
echo "  Status:      pm2 status"
echo "  Stop:        pm2 stop travel-tracker"
echo "  Restart:     pm2 restart travel-tracker"
echo "  Delete:      pm2 delete travel-tracker"
echo ""
echo "Access application at: http://$(hostname -I | awk '{print $1}'):${PORT:-3000}"
echo ""

# Show status
pm2 status
