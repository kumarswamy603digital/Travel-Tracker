# 🗺️ Travel Tracker - Production-Ready Startup

A professional, scalable web application for tracking countries you've visited with an interactive world map. Built with **Node.js**, **Express**, and **PostgreSQL** following startup-level best practices.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-18+-green)
![PostgreSQL](https://img.shields.io/badge/postgresql-12+-blue)
![License](https://img.shields.io/badge/license-ISC-blue)

## ✨ Features

- 🗺️ **Interactive World Map** - Visual country tracking
- 🚀 **Production-Ready** - Startup-grade architecture
- 🔒 **Secure** - Input validation, SQL injection prevention, security headers
- 📊 **REST API** - Professional JSON API endpoints
- 🗄️ **PostgreSQL Integration** - Connection pooling, optimized queries
- 🐳 **Docker Support** - Containerized deployment
- 📝 **Comprehensive Logging** - Structured logging with levels
- 🔍 **Health Monitoring** - Built-in health check endpoints
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌍 **Scalable** - Ready for millions of users

## 🚀 Quick Start (5 minutes)

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org/))
- **PostgreSQL** 12+ ([download](https://www.postgresql.org/))

### Setup

#### Windows
```bash
# Run setup script
setup-windows.bat

# Then follow the prompts
```

#### Mac/Linux
```bash
# Run setup script
chmod +x setup-unix.sh
./setup-unix.sh

# Then follow the prompts
```

#### Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set your PGPASSWORD

# 3. Setup database
npm run db:setup

# 4. Start application
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[QUICKSTART.md](QUICKSTART.md)** | Get started in 5 minutes |
| **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** | Complete setup & usage guide |
| **[API.md](API.md)** | REST API documentation |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Deploy to production (5+ options) |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System architecture & design |
| **[TRANSFORMATION.md](TRANSFORMATION.md)** | What changed to become startup-ready |

## 🛠️ Available Commands

### Development
```bash
npm start        # Production mode
npm run dev      # Development with auto-reload
npm run dev:inspect  # Debug mode
```

### Database
```bash
npm run db:setup      # Initial setup
npm run db:seed       # Load sample data
npm run db:reset      # Reset database
```

### Health Check
```bash
npm run health-check  # Verify application is running
curl http://localhost:3000/health
```

## 🌐 API Endpoints

### Web Interface
- `GET /` - Main application page with interactive map

### REST API
- `GET /health` - Health check
- `GET /api/statistics` - Get travel statistics
- `GET /api/search?query=<term>` - Search countries
- `POST /api/countries` - Add visited country
- `DELETE /api/countries/<code>` - Remove visited country

### Examples

**Add a country:**
```bash
curl -X POST http://localhost:3000/api/countries \
  -H "Content-Type: application/json" \
  -d '{"country":"US"}'
```

**Get statistics:**
```bash
curl http://localhost:3000/api/statistics
```

**Search countries:**
```bash
curl "http://localhost:3000/api/search?query=united"
```

More examples in [API.md](API.md)

## 📁 Project Structure

```
travel-tracker/
├── src/                    # Application code
│   ├── config/            # Configuration & logging
│   ├── database/          # Database connections
│   ├── models/            # Business logic
│   ├── controllers/       # Request handlers
│   ├── routes/            # Route definitions
│   ├── middleware/        # Express middleware
│   └── utils/             # Helper functions
├── views/                 # EJS templates
├── public/                # Static assets
├── database/              # SQL scripts & tools
├── server.js              # Application entry
├── package.json           # Dependencies
├── docker-compose.yml     # Docker setup
└── ecosystem.config.js    # PM2 configuration
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed structure.

## 🐳 Docker Deployment

Quick start with Docker:

```bash
docker-compose up -d
```

Then initialize database:
```bash
docker-compose exec app npm run db:setup
```

Access at [http://localhost:3000](http://localhost:3000)

## 🚀 Production Deployment

### Heroku (Easiest)
```bash
heroku create your-app
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run npm run db:setup
heroku open
```

### AWS EC2, DigitalOcean, Render
See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guides.

## ⚙️ Configuration

### Environment Variables

Create `.env` file with:

```env
# Database
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=travel_tracker

# Server
NODE_ENV=development
PORT=3000
HOST=localhost
LOG_LEVEL=info

# SSL (production)
PGSSLMODE=disable
```

All available options in [.env.example](.env.example)

## 🔒 Security Features

- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (input sanitization)
- ✅ CSRF protection ready
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ CORS handling
- ✅ Input validation
- ✅ Error handling (no sensitive info leakage)
- ✅ Prepared statements

## 📊 Performance

### Connection Pooling
- Max 20 concurrent database connections
- Automatic idle connection cleanup
- Connection reuse for better performance

### Optimization Ready
- Ready for Redis caching
- Ready for CDN integration
- Ready for load balancer
- Optimized database queries

## 🧪 Testing

Health check:
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

## 🐛 Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running
- Check PGPASSWORD in .env
- Verify PGHOST and PGPORT

### Port Already in Use
- Change PORT in .env
- Or kill process: `lsof -ti:3000 | xargs kill -9`

### Module Not Found
- Run: `npm install`
- Run: `npm cache clean --force`

See [STARTUP_GUIDE.md](STARTUP_GUIDE.md) for more issues and solutions.

## 📈 Scaling

Ready to scale with:
- Load balancing (nginx, HAProxy)
- Database read replicas
- Redis caching
- Horizontal pod autoscaling (Kubernetes)
- CDN for static assets

## 🔄 Database Backup

### Manual Backup
```bash
npm run db:backup
```

### Scheduled Backup (Linux/Mac)
Add to crontab:
```bash
0 2 * * * /path/to/travel-tracker/database/backup.sh
```

### Restore
```bash
npm run db:restore backup_file.sql
```

## 📖 Learning Resources

1. **New to the project?** → [QUICKSTART.md](QUICKSTART.md)
2. **Setting up?** → [STARTUP_GUIDE.md](STARTUP_GUIDE.md)
3. **Using the API?** → [API.md](API.md)
4. **Understanding structure?** → [ARCHITECTURE.md](ARCHITECTURE.md)
5. **Going live?** → [DEPLOYMENT.md](DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

## 📝 License

ISC License - see [LICENSE](LICENSE) for details

## 🙋 Support

- **Questions?** Check the relevant documentation file
- **Issues?** See [STARTUP_GUIDE.md](STARTUP_GUIDE.md) troubleshooting section
- **Deployment help?** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **API questions?** See [API.md](API.md)

## 🌟 What Changed

This project has been transformed from a basic prototype to a **production-ready startup application**:

✅ Professional code structure (MVC pattern)
✅ Enterprise database handling
✅ Comprehensive error handling
✅ Full REST API
✅ Docker containerization
✅ Multiple deployment options
✅ 5000+ lines of documentation
✅ Security best practices
✅ Monitoring & health checks

See [TRANSFORMATION.md](TRANSFORMATION.md) for complete details.

## 📞 Contact

- **Author**: Your Name
- **Email**: your.email@example.com
- **Repository**: https://github.com/yourusername/travel-tracker
- **Issues**: https://github.com/yourusername/travel-tracker/issues

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: April 16, 2024

Happy travels! ✈️🗺️
