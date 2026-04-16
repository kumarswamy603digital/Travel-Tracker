# Travel Tracker - Production-Ready Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Database Management](#database-management)
7. [API Endpoints](#api-endpoints)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **PostgreSQL**: v12 or higher
- **Git** (for version control)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/travel-tracker.git
cd travel-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
```

### 4. Configure Environment Variables
Edit the `.env` file with your database credentials:

```env
# Database Configuration
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_secure_password
PGDATABASE=travel_tracker

# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost
LOG_LEVEL=info
```

## Database Setup

### Option 1: Quick Setup with npm script
```bash
npm run db:setup
npm run db:seed  # Optional: Load sample countries
```

### Option 2: Manual Setup
1. Create a database:
```sql
CREATE DATABASE travel_tracker;
```

2. Connect to the database:
```bash
psql -U postgres -d travel_tracker
```

3. Run the schema file:
```bash
psql -U postgres -d travel_tracker -f database/schema.sql
```

4. (Optional) Load sample data:
```bash
psql -U postgres -d travel_tracker -f database/full-setup-sample-countries.sql
```

### Database Schema
The application uses two main tables:

**countries** table:
- `country_code` (VARCHAR(2), PRIMARY KEY)
- `country_name` (VARCHAR(255))

**visited_countries** table:
- `country_code` (VARCHAR(2), FOREIGN KEY)
- `visit_date` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Application environment (development/production) |
| PORT | 3000 | Server port |
| HOST | localhost | Server host |
| LOG_LEVEL | info | Logging level (error/warn/info/debug) |
| PGHOST | localhost | PostgreSQL host |
| PGPORT | 5432 | PostgreSQL port |
| PGUSER | postgres | PostgreSQL user |
| PGPASSWORD | - | PostgreSQL password (REQUIRED) |
| PGDATABASE | travel_tracker | PostgreSQL database name |
| PGSSLMODE | disable | SSL mode (disable/require) |

### Production Configuration
For production deployment:

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
PGSSLMODE=require
CORS_ORIGIN=https://yourdomain.com
TRUST_PROXY=true
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Development Mode (with debugging)
```bash
npm run dev:inspect
```

### Production Mode
```bash
npm start
```

### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "travel-tracker",
  "timestamp": "2024-04-16T10:30:00.000Z"
}
```

## Database Management

### Reset Database (Development)
```bash
npm run db:reset
```
This will:
1. Drop the existing database
2. Create a new database
3. Run schema setup
4. Load sample data

### Manual Database Backup
```bash
pg_dump -U postgres travel_tracker > backup.sql
```

### Restore from Backup
```bash
psql -U postgres travel_tracker < backup.sql
```

## API Endpoints

### Public Endpoints

#### 1. Get Home Page
```
GET /
```
Renders the main application page with visited countries map.

#### 2. Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok",
  "service": "travel-tracker",
  "timestamp": "2024-04-16T10:30:00.000Z"
}
```

### API Endpoints (JSON)

#### 3. Get Statistics
```
GET /api/statistics
```
Response:
```json
{
  "total_countries": 195,
  "visited_countries": 15
}
```

#### 4. Search Countries
```
GET /api/search?query=united
```
Response:
```json
[
  {
    "country_code": "US",
    "country_name": "United States"
  },
  {
    "country_code": "AE",
    "country_name": "United Arab Emirates"
  }
]
```

#### 5. Add Visited Country
```
POST /api/countries
Content-Type: application/json

{
  "country": "US"
}
```
Response:
```json
{
  "success": true,
  "countryCode": "US"
}
```

#### 6. Remove Visited Country
```
DELETE /api/countries/US
```
Response:
```json
{
  "success": true,
  "countryCode": "US"
}
```

### Form Endpoints

#### 7. Add Country (Form)
```
POST /
Content-Type: application/x-www-form-urlencoded

country=US
```
Redirects to home page with updated map.

## Deployment

### Deploying to Heroku

1. **Create Heroku App**
```bash
heroku create your-app-name
```

2. **Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set LOG_LEVEL=warn
```

4. **Deploy**
```bash
git push heroku main
```

5. **Setup Database**
```bash
heroku run "npm run db:setup"
```

### Deploying to AWS EC2

1. **SSH into Instance**
```bash
ssh -i your-key.pem ec2-user@your-instance.amazonaws.com
```

2. **Install Dependencies**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
sudo yum install -y postgresql
```

3. **Clone Repository**
```bash
git clone https://github.com/yourusername/travel-tracker.git
cd travel-tracker
npm install
```

4. **Setup Environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. **Start with PM2 (Process Manager)**
```bash
sudo npm install -g pm2
pm2 start server.js --name "travel-tracker"
pm2 startup
pm2 save
```

### Using Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t travel-tracker .
docker run -p 3000:3000 -e PGHOST=postgres travel-tracker
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Error**: `error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
- Ensure PostgreSQL is running: `pg_isready`
- Check PGHOST, PGPORT in .env
- Verify PostgreSQL service: `sudo service postgresql start`

#### 2. Authentication Failed
**Error**: `error: password authentication failed`

**Solution**:
- Verify PGPASSWORD in .env (no spaces)
- Ensure user exists: `psql -U postgres -l`
- Reset password: `ALTER USER postgres WITH PASSWORD 'newpassword';`

#### 3. Database Does Not Exist
**Error**: `error: database "travel_tracker" does not exist`

**Solution**:
- Create database: `createdb travel_tracker`
- Or run: `npm run db:setup`

#### 4. Tables Not Found
**Error**: `error: relation "visited_countries" does not exist`

**Solution**:
- Run schema setup: `npm run db:setup`
- Check database: `\dt` in psql

#### 5. Port Already in Use
**Error**: `Error: listen EADDRINUSE :::3000`

**Solution**:
- Change PORT in .env
- Or kill process: `lsof -ti:3000 | xargs kill -9`

#### 6. Module Not Found
**Error**: `Error: Cannot find module 'pg'`

**Solution**:
- Reinstall dependencies: `npm install`
- Clear cache: `npm cache clean --force`

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm start
```

### View Database Logs
```sql
SELECT * FROM pg_stat_statements ORDER BY query_time DESC;
```

## Project Structure

```
travel-tracker/
├── src/
│   ├── config/          # Configuration files
│   │   ├── env.js       # Environment configuration
│   │   └── logger.js    # Logging setup
│   ├── database/        # Database connections
│   │   └── connection.js
│   ├── models/          # Data models
│   │   └── Country.js
│   ├── controllers/     # Request handlers
│   │   └── TravelController.js
│   ├── routes/          # Route definitions
│   │   └── index.js
│   ├── middleware/      # Express middleware
│   │   └── index.js
│   └── utils/           # Utility functions
│       └── validators.js
├── views/               # EJS templates
│   ├── index.ejs
│   └── error.ejs
├── public/              # Static assets
│   └── styles/
│       └── main.css
├── database/            # SQL scripts
│   ├── schema.sql
│   ├── setup-travel-tracker.sql
│   └── full-setup-sample-countries.sql
├── server.js            # Main application entry
├── package.json         # Dependencies and scripts
├── .env.example         # Environment template
└── README.md            # This file
```

## Performance Optimization

### Database Connection Pooling
The application uses connection pooling (max 20 connections):
- Improves performance with multiple concurrent users
- Configurable in `src/config/env.js`

### Caching
Consider implementing Redis for caching:
```bash
npm install redis
```

### Monitoring
Implement monitoring with services like:
- New Relic
- DataDog
- Sentry

## Security Best Practices

1. **Environment Variables**: Never commit .env files
2. **Database**: Use strong passwords, implement row-level security
3. **Input Validation**: All inputs are validated and sanitized
4. **HTTPS**: Use SSL/TLS in production
5. **Headers**: Security headers are automatically set
6. **Rate Limiting**: Implement rate limiting for APIs

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

ISC License - see LICENSE file for details

## Support

- **Issues**: https://github.com/yourusername/travel-tracker/issues
- **Email**: support@example.com
- **Documentation**: https://github.com/yourusername/travel-tracker/wiki

---

**Last Updated**: April 2024
**Version**: 1.0.0
