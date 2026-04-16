# Architecture Documentation

## Project Structure Overview

```
travel-tracker/
├── src/                              # Application source code
│   ├── config/                       # Configuration management
│   │   ├── env.js                   # Environment variables
│   │   └── logger.js                # Logging system
│   │
│   ├── database/                     # Database layer
│   │   └── connection.js            # Connection pooling
│   │
│   ├── models/                       # Data models (Business Logic)
│   │   └── Country.js               # Country operations
│   │
│   ├── controllers/                  # Request handlers
│   │   └── TravelController.js      # Main controller
│   │
│   ├── routes/                       # Route definitions
│   │   └── index.js                 # Route setup
│   │
│   ├── middleware/                   # Express middleware
│   │   └── index.js                 # All middleware
│   │
│   └── utils/                        # Utility functions
│       └── validators.js            # Input validation
│
├── views/                            # EJS templates
│   ├── index.ejs                    # Main page
│   └── error.ejs                    # Error page
│
├── public/                           # Static assets
│   ├── styles/
│   │   └── main.css
│   └── js/ (optional)
│
├── database/                         # SQL scripts
│   ├── schema.sql                   # Table definitions
│   ├── setup-travel-tracker.sql     # Initial data
│   ├── full-setup-sample-countries.sql  # Sample data
│   ├── setup.sh                     # Setup script
│   ├── reset.sh                     # Reset script
│   ├── backup.sh                    # Backup script
│   └── restore.sh                   # Restore script
│
├── server.js                         # Application entry point
├── package.json                      # Dependencies & scripts
├── ecosystem.config.js               # PM2 configuration
├── docker-compose.yml                # Docker setup
├── Dockerfile                        # Docker image
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
│
├── QUICKSTART.md                     # Quick start guide
├── STARTUP_GUIDE.md                  # Complete guide
├── DEPLOYMENT.md                     # Deployment guide
├── API.md                            # API documentation
├── ARCHITECTURE.md                   # This file
│
└── Scripts
    ├── setup-windows.bat             # Windows setup
    └── setup-unix.sh                 # Unix setup
```

## Architecture Layers

### 1. **Configuration Layer** (`src/config/`)
Manages application configuration and logging.

**Files:**
- `env.js` - Environment variables and validation
- `logger.js` - Centralized logging system

**Key Features:**
- Environment variable validation
- Centralized logging with levels
- Colored output for development

### 2. **Database Layer** (`src/database/`)
Handles database connections and pooling.

**Files:**
- `connection.js` - Connection pool management

**Key Features:**
- PostgreSQL connection pooling
- Connection timeout management
- Automatic connection testing
- Graceful pool shutdown

```javascript
// Example usage
import { pool, testConnection } from './src/database/connection.js';

// Run a query
const result = await pool.query('SELECT * FROM countries');

// Test connection
const connected = await testConnection();

// Close pool on shutdown
await closePool();
```

### 3. **Model Layer** (`src/models/`)
Business logic and data operations.

**Files:**
- `Country.js` - Country data operations

**Key Methods:**
```javascript
CountryModel.getVisitedCountries()      // Get codes
CountryModel.addVisitedCountry(code)    // Add country
CountryModel.removeVisitedCountry(code) // Remove country
CountryModel.searchCountries(term)      // Search
CountryModel.getStatistics()            // Stats
```

**Features:**
- Input validation
- Error handling with proper codes
- Transaction support
- Query optimization

### 4. **Controller Layer** (`src/controllers/`)
Request handling and response management.

**Files:**
- `TravelController.js` - Route handlers

**Key Methods:**
```javascript
TravelController.getHome()       // Render main page
TravelController.addCountry()    // Handle POST
TravelController.deleteCountry() // Handle DELETE
TravelController.searchCountries() // Search API
TravelController.getHealth()     // Health check
TravelController.getStatistics() // Stats API
```

### 5. **Route Layer** (`src/routes/`)
URL routing and endpoint definitions.

**Files:**
- `index.js` - All route definitions

**Endpoints:**
```
GET  /                    # Main page
GET  /health              # Health check
POST /                    # Add country (form)
POST /api/countries       # Add country (API)
GET  /api/statistics      # Get stats
GET  /api/search          # Search countries
DELETE /api/countries/:id # Remove country
```

### 6. **Middleware Layer** (`src/middleware/`)
Cross-cutting concerns for all requests.

**Files:**
- `index.js` - All middleware

**Middleware:**
- `requestLogger` - Request logging
- `securityHeaders` - Security headers
- `corsMiddleware` - CORS handling
- `validateInput` - Input validation
- `errorHandler` - Error handling

### 7. **Utility Layer** (`src/utils/`)
Helper functions and validators.

**Files:**
- `validators.js` - Input validation

**Functions:**
```javascript
isValidEmail()       // Email validation
isValidCountryCode() // Country code (2 chars)
sanitizeString()     // String sanitization
escapeHtml()         // HTML entity escape
```

## Request Flow Diagram

```
┌─────────────────────────────────────────────┐
│ HTTP Request (Browser/API Client)          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Express Router                              │
│ ├─ Route matching (/api/countries, etc.)   │
│ └─ Route parameters extraction              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Middleware Pipeline                         │
│ ├─ requestLogger     (logs request)         │
│ ├─ securityHeaders   (adds headers)         │
│ ├─ corsMiddleware    (CORS handling)        │
│ └─ validateInput     (input sanitization)   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Controller (TravelController)               │
│ ├─ Extracts request data                    │
│ ├─ Calls model methods                      │
│ └─ Formats response                         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Model (CountryModel)                        │
│ ├─ Validates input                          │
│ ├─ Executes SQL queries                     │
│ └─ Returns data or throws errors            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Database (PostgreSQL)                       │
│ ├─ Connection pooling                       │
│ ├─ Query execution                          │
│ └─ Returns result set                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼ (Response flows back up)
┌─────────────────────────────────────────────┐
│ Error Handler (if errors occur)             │
│ ├─ Catches exceptions                       │
│ ├─ Logs errors                              │
│ └─ Sends error response                     │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ HTTP Response (JSON or HTML)                │
└─────────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: Adding a Country (Form)

```
1. User submits form: POST / {country: "US"}
   ↓
2. Route: app.post('/', TravelController.addCountry)
   ↓
3. Middleware: validateInput -> sanitizes "US"
   ↓
4. Controller: TravelController.addCountry()
   ├─ Validates input
   └─ Calls CountryModel.addVisitedCountry("US")
   ↓
5. Model: CountryModel.addVisitedCountry("US")
   ├─ Verifies country exists in countries table
   ├─ Inserts into visited_countries table
   └─ Returns success or error
   ↓
6. Controller: Redirects to home (302)
   ↓
7. Page reloads, shows updated map
```

### Example 2: Getting Statistics (API)

```
1. Browser: GET /api/statistics
   ↓
2. Route: app.get('/api/statistics', TravelController.getStatistics)
   ↓
3. Controller: TravelController.getStatistics()
   ├─ Calls CountryModel.getStatistics()
   ↓
4. Model: CountryModel.getStatistics()
   ├─ Executes SQL: SELECT COUNT(*) FROM countries...
   ├─ Gets result from database
   └─ Returns: {total_countries: 195, visited_countries: 15}
   ↓
5. Controller: res.json(stats)
   ↓
6. Response: 200 OK + JSON
```

## Database Schema

### Tables

**countries**
```
country_code (VARCHAR(2), PK)
country_name (VARCHAR(255))
```

**visited_countries**
```
country_code (VARCHAR(2), FK -> countries)
visit_date (TIMESTAMP, DEFAULT NOW())
```

## Error Handling Strategy

```javascript
// 1. Database Errors (Model Level)
if (error.code === '28P01') {
  // Authentication failed
}
if (error.code === '3D000') {
  // Database doesn't exist
}
if (error.code === '42P01') {
  // Table doesn't exist
}

// 2. Validation Errors (Controller Level)
if (!countryCode) {
  return res.status(400).json({error: 'Country required'});
}

// 3. Global Error Handler (Middleware Level)
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({error: 'Server error'});
});
```

## Configuration Hierarchy

```
1. .env file (highest priority)
   ↓
2. Environment variables (process.env)
   ↓
3. Default values (in env.js)
   ↓
4. Fallback values (lowest priority)
```

Example:
```javascript
const database = {
  host: process.env.PGHOST || 'localhost', // .env → env var → default
};
```

## Connection Pooling Strategy

```javascript
const poolConfig = {
  max: 20,                              // Max connections
  connectionTimeoutMillis: 10000,       // 10 seconds to connect
  idleTimeoutMillis: 30000,            // 30 seconds idle timeout
};
```

This allows:
- Up to 20 concurrent database connections
- Connection reuse (improves performance)
- Automatic cleanup of idle connections
- Better resource management

## Security Features

1. **Input Validation**: All inputs validated and sanitized
2. **SQL Injection Prevention**: Parameterized queries
3. **XSS Prevention**: HTML entity escaping
4. **Security Headers**: Automatic HTTP security headers
5. **CORS Control**: Configurable CORS origins
6. **Error Messages**: Generic messages to prevent info leakage

## Logging Levels

```
error   - Critical failures
warn    - Warnings and non-fatal issues
info    - Important events and status
debug   - Detailed diagnostic info
```

## Deployment Considerations

### Scaling
- Use load balancers for horizontal scaling
- Database should handle multiple connections
- Consider caching layer (Redis)

### Monitoring
- Health check endpoint: GET /health
- Request logging for all endpoints
- Database query performance logging
- Error tracking with Sentry

### Optimization
- Database query optimization
- Connection pooling (already implemented)
- Response caching headers
- Static asset compression

## Future Enhancements

1. **Authentication**: Add user accounts
2. **Authorization**: Role-based access control
3. **Caching**: Redis for frequently accessed data
4. **Real-time Updates**: WebSocket for live updates
5. **Mobile App**: React Native or Flutter
6. **Testing**: Jest for unit tests, Cypress for E2E
7. **Monitoring**: Application Performance Monitoring (APM)
8. **Analytics**: Track user behavior and engagement

---

For deployment details, see [DEPLOYMENT.md](DEPLOYMENT.md)
For API details, see [API.md](API.md)
For setup guide, see [STARTUP_GUIDE.md](STARTUP_GUIDE.md)
