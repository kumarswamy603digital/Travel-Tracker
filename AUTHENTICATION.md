# 🔐 Travel Tracker - Complete Authentication System

## ✨ What's New - Startup-Grade Authentication

Your Travel Tracker now has **production-grade authentication** built-in:

### Authentication Features
✅ **User Registration** - Create new accounts with email/username/password
✅ **Secure Login** - Password hashing with bcrypt
✅ **Session Management** - Express-session with secure cookies
✅ **Protected Routes** - All travel tracking routes require login
✅ **User Profiles** - Each user has isolated country data
✅ **Logout** - Secure session termination
✅ **Password Validation** - Minimum 8 characters
✅ **Email Validation** - Format checking
✅ **In-Memory & PostgreSQL** - Works in both modes

---

## 🚀 Getting Started

### Option 1: Quick Demo (No Registration)

**Demo Account:**
- Email: `test@example.com`
- Password: `password123`

1. Open: http://localhost:3000/login
2. Click "Sign in" button
3. Use demo credentials above
4. Start tracking countries!

### Option 2: Create Your Own Account

1. Open: http://localhost:3000/register
2. Enter your details:
   - **Email**: Your email address
   - **Username**: Your username (unique)
   - **Password**: At least 8 characters
3. Click "Create Account"
4. Automatically logged in!
5. Start tracking countries!

---

## 📁 What Was Added

### New Files Created

| File | Purpose |
|------|---------|
| `src/models/User.js` | User authentication model |
| `src/controllers/AuthController.js` | Login/register/logout handlers |
| `src/middleware/auth.js` | Authentication middleware |
| `src/utils/countries-list.js` | Complete world countries database |
| `views/login.ejs` | Login page UI |
| `views/register.ejs` | Registration page UI |

### Modified Files

| File | Changes |
|------|---------|
| `server.js` | Added session middleware |
| `package.json` | Added bcryptjs & express-session |
| `src/routes/index.js` | Added auth routes & protected routes |
| `src/models/Country.js` | Updated with complete countries list |
| `src/controllers/TravelController.js` | Pass session to templates |
| `views/index.ejs` | Added user welcome & logout link |

---

## 🔒 Security Features

### Password Security
- **Hashing**: bcryptjs with 10 salt rounds
- **No Plain Text**: Passwords never stored as plain text
- **Minimum Length**: 8 characters required
- **Best Practice**: Never displayed or logged

### Session Security
- **HTTP Only**: Cookies not accessible to JavaScript
- **Secure Flag**: HTTPS only in production
- **SameSite**: Protection against CSRF attacks
- **Expiration**: 24-hour session timeout
- **Server-Side**: Sessions not stored in cookies

### Input Validation
- **Email Format**: RFC standard validation
- **Username**: Required, unique
- **XSS Prevention**: Input sanitization
- **SQL Injection**: Parameterized queries (PostgreSQL)

---

## 🌍 Complete Countries Database

### What's Included
- **All 195+ countries** with ISO-3166 codes
- **Fuzzy matching** - Find "India" by typing "india", "ind", etc.
- **Case-insensitive** - Works with any capitalization
- **Exact & partial search** - Multiple matching algorithms

### Example Searches (All Work!)
```
"India" → India
"india" → India  
"ind" → India
"IN" → India
"Japan" → Japan
"united states" → United States
"US" → United States
```

---

## 🗄️ User Data Storage

### In-Memory Mode (Demo)
- Users stored in JavaScript Map
- Data lost when server restarts
- Perfect for testing/development
- No database setup needed

### PostgreSQL Mode (Production)
- Users stored in `users` table
- Persistent storage
- Multiple users supported
- Enterprise-ready

### User Table Schema
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Authentication Flow

### Registration Flow
```
User submits registration form
    ↓
Validate input (email, username, password)
    ↓
Check if email/username already exists
    ↓
Hash password with bcrypt
    ↓
Store in database
    ↓
Create session
    ↓
Redirect to home page
```

### Login Flow
```
User submits login form
    ↓
Find user by email
    ↓
Compare password with stored hash
    ↓
Create session if match
    ↓
Redirect to home page
```

### Protected Route Flow
```
User requests /
    ↓
Check if session.userId exists
    ↓
If no → Redirect to /login
    ↓
If yes → Load home page
```

---

## 📝 API Endpoints

### Public Endpoints (No Login Required)
```
GET  /login                 → Login page
POST /login                 → Submit login form
GET  /register              → Registration page
POST /register              → Submit registration form
GET  /health                → Health check
```

### Protected Endpoints (Login Required)
```
GET  /                      → Home page with map
POST /                      → Add country
GET  /api/statistics        → JSON statistics
GET  /api/search            → Search countries
POST /api/countries         → Add country (API)
DELETE /api/countries/:code → Remove country (API)
GET  /api/profile           → Get user info
GET  /logout                → Sign out
```

---

## 🧪 Testing the Authentication

### Test Case 1: Registration
1. Go to http://localhost:3000/register
2. Fill in form:
   - Email: `myemail@example.com`
   - Username: `myusername`
   - Password: `securepass123`
3. Click "Create Account"
4. Should redirect to home page
5. See "Welcome, myusername" in top left

### Test Case 2: Login with New Account
1. Go to http://localhost:3000/login
2. Enter: `myemail@example.com` / `securepass123`
3. Click "Sign In"
4. Should see home page with map
5. See welcome message with username

### Test Case 3: Protected Routes
1. Try to access http://localhost:3000 without login
2. Should redirect to http://localhost:3000/login
3. Only accessible after login

### Test Case 4: Logout
1. Click "Sign out" link in top right
2. Should redirect to login page
3. Cannot access home page anymore

### Test Case 5: Country Search
1. Login with demo account
2. Type "india" in search box
3. Should suggest "India"
4. Click to add
5. Map should highlight India

---

## 🏗️ Architecture

### User Model (`src/models/User.js`)
```javascript
User.create(email, username, password)     // Register
User.authenticate(email, password)          // Login
User.findByEmail(email)                     // Find user
User.findById(userId)                       // Get user info
User.update(userId, updates)                // Update profile
User.delete(userId)                         // Delete account
```

### Auth Controller (`src/controllers/AuthController.js`)
```javascript
AuthController.getLogin()                   // Show login page
AuthController.postLogin()                  // Handle login
AuthController.getRegister()                // Show register page
AuthController.postRegister()               // Handle registration
AuthController.logout()                     // Sign out
AuthController.getProfile()                 // Get user profile
```

### Auth Middleware (`src/middleware/auth.js`)
```javascript
isAuthenticated(req, res, next)             // Require login
optionalAuth(req, res, next)                // Optional login
isNotAuthenticated(req, res, next)          // Require logout
```

---

## 🚨 Common Issues & Fixes

### Issue: "Email already registered"
**Solution**: Use a different email address for new accounts

### Issue: "Username already taken"
**Solution**: Choose a different username

### Issue: "Invalid email or password"
**Solution**: Check email/password spelling, case-sensitive password

### Issue: "Redirected to login after clicking Add"
**Solution**: Session expired, login again

### Issue: "Data disappears after restart"
**Solution**: Normal in demo mode, install PostgreSQL for persistence

---

## 📊 Security Checklist

✅ Passwords hashed with bcrypt (salted)
✅ Sessions use HTTP-only cookies
✅ CSRF protection with SameSite cookies
✅ Input validation on all forms
✅ XSS prevention in EJS templates
✅ Email format validation
✅ Unique email/username enforcement
✅ Minimum password length (8 chars)
✅ No sensitive data in logs
✅ Graceful error messages (no info leaks)

---

## 🎯 Production Upgrade Checklist

### Before Deploying

- [ ] Install PostgreSQL
- [ ] Set `PGPASSWORD` in `.env`
- [ ] Create `users` table
- [ ] Change `SESSION_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Update `cookie.secure=true`
- [ ] Setup backup strategy
- [ ] Enable logging/monitoring
- [ ] Test all auth flows

### Security Settings for Production
```env
NODE_ENV=production
SESSION_SECRET=your-very-long-random-secret-key
PORT=3000
PGSSLMODE=require
```

---

## 🔄 Session Management

### Session Expiration
- **Timeout**: 24 hours of inactivity
- **Max Age**: 1440 minutes (24 hours)
- **Extends**: On each request

### Session Storage
- **Mode**: In-memory (demo) or database (production)
- **Access**: `req.session.userId`, `req.session.username`
- **Cookies**: Secure, HTTP-only

---

## 📚 Example Code

### Using Authentication in Controllers
```javascript
// Check if logged in
if (!req.session.userId) {
  return res.redirect('/login');
}

// Get user info
const userId = req.session.userId;
const username = req.session.username;
const email = req.session.userEmail;

// In templates
<%= session.username %>
<a href="/logout">Sign out</a>
```

### Creating Protected Routes
```javascript
import { isAuthenticated } from './middleware/auth.js';

// Protected route - requires login
app.get('/dashboard', isAuthenticated, handler);

// Public route - no login needed
app.get('/public', handler);

// Optional auth - passes user if logged in
app.get('/page', optionalAuth, handler);
```

---

## 🌟 What's Next?

### Optional Enhancements
- [ ] Email verification on signup
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] OAuth/Google login
- [ ] User profile page
- [ ] Change password
- [ ] Delete account
- [ ] Admin dashboard

### For Production
- [ ] Setup PostgreSQL
- [ ] Enable HTTPS
- [ ] Configure SSL certificates
- [ ] Setup monitoring
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Deploy to cloud

---

## 💡 Demo Credentials

For quick testing without registration:
- **Email**: `test@example.com`
- **Password**: `password123`

Create your own accounts anytime at `/register`

---

## 🎓 Learning Resources

### Files to Review
1. `src/models/User.js` - Understand user management
2. `src/controllers/AuthController.js` - See auth logic
3. `src/middleware/auth.js` - Learn route protection
4. `src/utils/countries-list.js` - Country database structure

### Key Concepts
- **Hashing**: One-way password encryption
- **Salting**: Random data mixed with passwords
- **Sessions**: Server-side user state tracking
- **Cookies**: Secure client-side session identifiers
- **Middleware**: Code that runs before route handlers

---

## 🚀 You're Ready!

Your application now has:
- ✅ Production-grade authentication
- ✅ User registration & login
- ✅ Secure password hashing
- ✅ Session management
- ✅ Protected routes
- ✅ Complete countries database
- ✅ Multiple user support
- ✅ Startup-level code quality

### Next Steps
1. Test registration at http://localhost:3000/register
2. Test login at http://localhost:3000/login
3. Try adding countries as authenticated user
4. Review the authentication code
5. Deploy to production!

---

**Happy tracking! 🌍✈️**
