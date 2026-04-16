# Quick API Testing Guide

## 🌐 Base URL
```
http://localhost:3000
```

---

## 📍 Tourism Guide Endpoints

### 1. Get Country Guide
```
GET /api/guide/IN
```
Returns tourism info, images, and attractions for India (replace IN with other country codes: JP, US, FR, GB, BR, AU, DE)

### 2. Get Tourism Information
```
GET /api/tourism-info?country=IN
```
Returns detailed country information

### 3. AI Tourism Guide
```
POST /api/guide/ai
Content-Type: application/json

{
  "message": "What's the best time to visit India?",
  "country": "IN"
}
```
Get AI-powered responses about destinations

### 4. Generate Voice Guide
```
POST /api/voice-guide
Content-Type: application/json

{
  "text": "Welcome to India, the land of diverse cultures and ancient temples.",
  "country": "IN",
  "voiceId": "EXAVITQu4vr4xnSDxMaL"  // Optional, defaults to Bella
}
```
Returns audio in data URL format

### 5. Available Voices
```
GET /api/voices
```
Lists all available text-to-speech voices

### 6. Search Images
```
GET /api/images?query=Taj%20Mahal&type=search&count=5
```
Search for images (type: search, country, or attraction)

### 7. Featured Destinations
```
GET /api/featured-destinations
```
Get images and info for popular destinations

### 8. Create Trip Plan
```
POST /api/trip-plan
Content-Type: application/json

{
  "country": "FR",
  "duration": 5
}
```
Generate a 5-day itinerary for France

### 9. Travel Tips
```
GET /api/travel-tips?country=JP&category=packing
```
Get travel tips by category: general, packing, safety, budgeting, culture, transportation

### 10. Recommendations
```
GET /api/recommendations?budget=medium&interests=adventure,beaches&duration=7
```
Get personalized country recommendations

---

## 🔐 Authentication Endpoints

### 1. Register
```
POST /register
Content-Type: application/x-www-form-urlencoded

email=user@example.com&username=myusername&password=securepassword123&confirmPassword=securepassword123
```

### 2. Login
```
POST /login
Content-Type: application/x-www-form-urlencoded

email=user@example.com&password=securepassword123
```

### 3. Google OAuth Login
```
GET /auth/google
```
Redirects to Google sign-in

### 4. Google OAuth Callback
```
GET /auth/google/callback?code=AUTH_CODE&state=STATE
```
Automatically handled after Google sign-in

### 5. Logout
```
GET /logout
```
Clears session and logs out user

### 6. Get Profile
```
GET /api/profile
```
Returns current user information

---

## 🗺️ Travel Tracker Endpoints

### 1. Home / Dashboard
```
GET /
```
Shows visited countries and statistics

### 2. Add Country
```
POST /
Content-Type: application/x-www-form-urlencoded

countryName=India
```
Add visited country to list

### 3. Get Statistics
```
GET /api/statistics
```
Returns count of visited countries

### 4. Search Countries
```
GET /api/search?query=india
```
Search for countries (fuzzy match supported)

### 5. Delete Country
```
DELETE /api/countries/IN
```
Remove country from visited list

---

## 🎨 Web Pages

### Travel Guide Page
```
GET /travel-guide
GET /travel-guide?country=IN
```
Beautiful tourism guide interface with all features

### Login Page
```
GET /login
```

### Register Page
```
GET /register
```

### Travel Tracker Dashboard
```
GET /
```

---

## 📊 Available Country Codes

```
IN  - India
JP  - Japan
US  - United States
FR  - France
GB  - United Kingdom
BR  - Brazil
AU  - Australia
DE  - Germany
```

---

## 🧪 Test Script (JavaScript/Browser Console)

```javascript
// Get India's tourism info
fetch('/api/guide/IN')
  .then(r => r.json())
  .then(d => console.log(d));

// Ask AI about travel
fetch('/api/guide/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What should I pack for India?',
    country: 'IN'
  })
})
.then(r => r.json())
.then(d => console.log(d.response));

// Get recommendations
fetch('/api/recommendations?budget=low&interests=adventure')
  .then(r => r.json())
  .then(d => console.log(d.recommendations));

// Get travel tips
fetch('/api/travel-tips?country=JP&category=safety')
  .then(r => r.json())
  .then(d => console.log(d.tips));

// Create trip plan
fetch('/api/trip-plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    country: 'US',
    duration: 7
  })
})
.then(r => r.json())
.then(d => console.log(d.itinerary));
```

---

## 🔄 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Additional details"
}
```

---

## ⏱️ Request Timeout
- AI Guide: 30 seconds (Ollama processing)
- Voice Generation: 10 seconds (TTS synthesis)
- Image Search: 10 seconds (Unsplash API)
- Others: 5 seconds default

---

## 💾 Environment Variables (.env)

Required for full functionality:
```
GOOGLE_CLIENT_ID=894250784534-oevl4pvcss1bijnk0g1hg5o3v742nh9s.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
UNSPLASH_API_KEY=YMOjZazAihhz7vBjiCQ27MsfwOc1sLX06RUvXJJRdgA
ELEVENLABS_API_KEY=sk_373f70889c2eb46a590bce04e99e2ad9c10222f572a2a641
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=neural-chat
SESSION_SECRET=your_secret_key
```

---

## 🚀 Performance Tips

1. **Cache Results**: APIs cache responses automatically
2. **Batch Requests**: Combine multiple queries when possible
3. **Lazy Load**: Images load on demand
4. **Use Specific Queries**: More specific = faster responses
5. **Local AI**: Ollama runs locally, no internet needed

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| AI Guide returns template response | Ollama not running: `ollama serve` |
| Voice generation fails | Check ElevenLabs API key in .env |
| Images not loading | Check Unsplash API key or internet |
| Google OAuth not working | Verify credentials in .env match Google Console |
| 404 on /travel-guide | Make sure routes are loaded in server.js |
| Session not persisting | Check SESSION_SECRET in .env |

---

Last Updated: 2026-04-16
