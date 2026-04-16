# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, no authentication is required. For production, consider implementing JWT or API key authentication.

---

## Endpoints

### 1. **GET /health**
Health check endpoint for monitoring and load balancers.

**Request:**
```bash
curl http://localhost:3000/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "travel-tracker",
  "timestamp": "2024-04-16T10:30:00.000Z"
}
```

---

### 2. **GET /**
Render the main application page with interactive world map.

**Request:**
```bash
curl http://localhost:3000/
```

**Response:** HTML page with EJS template

---

### 3. **GET /api/statistics**
Get travel statistics including total countries and visited count.

**Request:**
```bash
curl http://localhost:3000/api/statistics
```

**Response (200 OK):**
```json
{
  "total_countries": 195,
  "visited_countries": 15
}
```

**Error Response (500):**
```json
{
  "error": {
    "message": "Internal server error",
    "status": 500
  }
}
```

---

### 4. **GET /api/search?query=<search_term>**
Search for countries by name (case-insensitive, fuzzy matching).

**Request:**
```bash
curl "http://localhost:3000/api/search?query=united"
```

**Response (200 OK):**
```json
[
  {
    "country_code": "US",
    "country_name": "United States"
  },
  {
    "country_code": "AE",
    "country_name": "United Arab Emirates"
  },
  {
    "country_code": "GB",
    "country_name": "United Kingdom"
  }
]
```

**Notes:**
- Returns up to 10 matching results
- Empty query returns empty array
- Sorted alphabetically by country name

---

### 5. **POST /api/countries**
Add a country to the visited list.

**Request:**
```bash
curl -X POST http://localhost:3000/api/countries \
  -H "Content-Type: application/json" \
  -d '{"country": "US"}'
```

**Request Body:**
```json
{
  "country": "US"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "countryCode": "US"
}
```

**Error Responses:**

400 Bad Request (country not found):
```json
{
  "error": {
    "message": "Country not found",
    "status": 400
  }
}
```

409 Conflict (already visited):
```json
{
  "error": {
    "message": "Country already visited",
    "status": 409
  }
}
```

**Validation Rules:**
- Country code must be 2 uppercase letters (e.g., "US", "FR", "JP")
- Country must exist in database
- Country cannot already be in visited list

---

### 6. **DELETE /api/countries/<country_code>**
Remove a country from the visited list.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/countries/US
```

**Response (200 OK):**
```json
{
  "success": true,
  "countryCode": "US"
}
```

**Error Responses:**

404 Not Found (country not in visited list):
```json
{
  "error": {
    "message": "Country not found in visited list",
    "status": 404
  }
}
```

---

### 7. **POST /** (Form Submission)
Add a country using HTML form (legacy endpoint).

**Request:**
```bash
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "country=US"
```

**Response:** Redirects to home page (302)

**Notes:**
- This endpoint is for the web form UI
- Use `/api/countries` for JSON API

---

## Error Handling

### Common Error Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Request completed successfully |
| 302 | Redirect | Form submission redirects to home |
| 400 | Bad Request | Invalid input or country not found |
| 404 | Not Found | Country not in visited list |
| 409 | Conflict | Country already visited |
| 500 | Server Error | Database or application error |

### Error Response Format (JSON API)
```json
{
  "error": {
    "message": "Descriptive error message",
    "status": 400
  }
}
```

---

## Request/Response Examples

### JavaScript (Fetch API)

**Add a Country:**
```javascript
const addCountry = async (countryCode) => {
  try {
    const response = await fetch('/api/countries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ country: countryCode })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Country added:', data);
  } catch (error) {
    console.error('Error adding country:', error);
  }
};

addCountry('US');
```

**Remove a Country:**
```javascript
const removeCountry = async (countryCode) => {
  try {
    const response = await fetch(`/api/countries/${countryCode}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Country removed:', data);
  } catch (error) {
    console.error('Error removing country:', error);
  }
};

removeCountry('US');
```

**Get Statistics:**
```javascript
const getStats = async () => {
  try {
    const response = await fetch('/api/statistics');
    const data = await response.json();
    console.log(`Total: ${data.total_countries}, Visited: ${data.visited_countries}`);
  } catch (error) {
    console.error('Error:', error);
  }
};

getStats();
```

**Search Countries:**
```javascript
const searchCountries = async (query) => {
  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    const countries = await response.json();
    console.log('Results:', countries);
  } catch (error) {
    console.error('Error:', error);
  }
};

searchCountries('united');
```

### cURL Examples

**Add Country:**
```bash
curl -X POST http://localhost:3000/api/countries \
  -H "Content-Type: application/json" \
  -d '{"country":"FR"}' \
  -w "\nStatus: %{http_code}\n"
```

**Get All Stats:**
```bash
curl http://localhost:3000/api/statistics | jq '.'
```

**Search:**
```bash
curl "http://localhost:3000/api/search?query=japan" | jq '.'
```

**Health Check:**
```bash
curl http://localhost:3000/health | jq '.'
```

---

## Rate Limiting

Currently not implemented. Consider adding for production:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## CORS

CORS is currently enabled for all origins. In production, restrict to specific domains:

```javascript
// In middleware/index.js
export function corsMiddleware(req, res, next) {
  const allowedOrigins = ['https://yourdomain.com'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  // ...
}
```

---

## Versioning

Current API Version: **1.0.0**

Future versions will be accessible at `/api/v2/` etc.

---

## Rate Limiting (Future)

Recommended rate limits:
- Health check: 60 requests/minute
- GET endpoints: 30 requests/minute per IP
- POST/DELETE: 10 requests/minute per IP

---

## Changes Log

### Version 1.0.0 (2024-04-16)
- Initial API release
- 6 endpoints implemented
- Health check monitoring
- Error handling and validation

---

For additional support, see [STARTUP_GUIDE.md](STARTUP_GUIDE.md) or [DEPLOYMENT.md](DEPLOYMENT.md)
