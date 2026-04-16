# 🚀 Travel Tracker - Quick Start Guide

Get your Travel Tracker app running in 5 minutes!

## Prerequisites

✅ Install these first:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (v12 or higher)

## Installation Steps

### Step 1: Setup Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# Open .env and update:
# - PGPASSWORD=<your_postgres_password>
# - PGHOST=localhost (if local)
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Database
```bash
# On Linux/Mac
npm run db:setup

# On Windows (manual setup)
# 1. Open PostgreSQL command line
# 2. Run: CREATE DATABASE travel_tracker;
# 3. Run: \c travel_tracker
# 4. Run: \i database/schema.sql
# 5. Run: \i database/setup-travel-tracker.sql
```

### Step 4: Start Application
```bash
npm start
```

### Step 5: Open in Browser
```
http://localhost:3000
```

---

## Troubleshooting

### Issue: `PGPASSWORD incorrect`
**Solution:**
1. Open Command Prompt (Windows) or Terminal (Mac/Linux)
2. Test connection: `psql -U postgres`
3. Enter your password
4. Update `.env` with correct password

### Issue: `Database does not exist`
**Solution:**
1. Open `pgAdmin` or `psql`
2. Create database: `CREATE DATABASE travel_tracker;`
3. Run: `npm run db:setup`

### Issue: Port 3000 already in use
**Solution:**
Edit `.env` and change `PORT=3001` (or any available port)

### Issue: Connection refused
**Solution:**
1. Make sure PostgreSQL is running
2. Windows: Check Services > PostgreSQL
3. Mac: `brew services start postgresql`
4. Linux: `sudo service postgresql start`

---

## Development

### Auto-reload on changes
```bash
npm run dev
```

### Debug mode
```bash
npm run dev:inspect
```

---

## Database Commands

### Reset database (WARNING: Deletes all data)
```bash
npm run db:reset
```

### Backup database
```bash
# Linux/Mac
database/backup.sh

# Windows
pg_dump -U postgres travel_tracker > backup.sql
```

### Restore database
```bash
# Linux/Mac
database/restore.sh backup.sql

# Windows
psql -U postgres -d travel_tracker < backup.sql
```

---

## API Usage

### Add a Country
```bash
curl -X POST http://localhost:3000/api/countries \
  -H "Content-Type: application/json" \
  -d '{"country":"US"}'
```

### Get Statistics
```bash
curl http://localhost:3000/api/statistics
```

### Search Countries
```bash
curl "http://localhost:3000/api/search?query=united"
```

---

## Production Deployment

Ready for production? See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Heroku deployment
- AWS EC2 setup
- Docker deployment
- DigitalOcean setup

---

## File Structure

```
travel-tracker/
├── src/                  # Application source code
│   ├── config/          # Configuration
│   ├── database/        # Database connections
│   ├── models/          # Data models
│   ├── controllers/     # Route handlers
│   ├── routes/          # Route definitions
│   ├── middleware/      # Express middleware
│   └── utils/           # Utilities
├── views/               # HTML templates
├── public/              # CSS, JS, images
├── database/            # SQL scripts
├── server.js            # Main entry point
├── package.json         # Dependencies
└── .env                 # Configuration (create from .env.example)
```

---

## Next Steps

1. ✅ App is running at http://localhost:3000
2. 📍 Add countries using the map interface
3. 📖 Read [STARTUP_GUIDE.md](STARTUP_GUIDE.md) for detailed docs
4. 🚀 Deploy to production with [DEPLOYMENT.md](DEPLOYMENT.md)
5. 📡 Check [API.md](API.md) for API documentation

---

## Common Commands

```bash
# Development
npm start              # Start app
npm run dev           # Start with auto-reload
npm run dev:inspect   # Start with debugging

# Database
npm run db:setup      # Initial setup
npm run db:reset      # Reset database (delete all data)
npm run db:seed       # Load sample data

# Monitoring
curl http://localhost:3000/health

# Help
npm run health-check  # Check if running
```

---

## Need Help?

- 📖 See [STARTUP_GUIDE.md](STARTUP_GUIDE.md) for complete documentation
- 🚀 See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides
- 📡 See [API.md](API.md) for API reference
- 🐛 Check console for error messages

---

**Enjoy tracking your travels! ✈️🗺️**
