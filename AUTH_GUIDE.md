# Authentication Setup Guide

## Overview
The application now has complete authentication with protected routes.

## Authentication Flow

### 1. **Public Routes**
- `/` - Home page with Register and Login buttons
- `/register` - User registration with password
- `/login` - User login

### 2. **Protected Routes**
- `/game` - Main game page (requires authentication)
  - Automatically redirects to `/login` if not authenticated
  - Displays user profile information
  - Has logout functionality

### 3. **Session Management**
- Cookie-based sessions with 30-day expiry
- Secure, httpOnly cookies
- Automatic session validation on protected routes

## How Authentication Works

### Registration
1. User fills out registration form (name, email, password, faculty, year)
2. Password is hashed using bcrypt (10 rounds)
3. User is created in database
4. Session cookie is created
5. User is redirected to `/game`

### Login
1. User enters email and password
2. Email is looked up in database
3. Password is verified against hashed password
4. If valid, session cookie is created
5. User is redirected to `/game`

### Protected Routes
- Use `requireUserId()` in loader to check authentication
- If not authenticated, automatically redirects to `/login`
- Session persists across browser restarts (30 days)

### Logout
- Destroys session cookie
- Redirects to `/login`

## Environment Variables

Make sure your `.env` file has:
```
DATABASE_URL="postgresql://postgres:root@localhost:5432/geo_detection_game"
SESSION_SECRET="your-secret-key-change-this-in-production"
```

## Testing the Flow

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:5173`
3. Click "Register" and create an account
4. You'll be automatically logged in and redirected to `/game`
5. Try logging out and logging back in
6. Try accessing `/game` without being logged in (should redirect to login)

## Security Features

✅ Passwords are hashed with bcrypt  
✅ Sessions use httpOnly cookies (not accessible via JavaScript)  
✅ Email uniqueness validation  
✅ Protected routes automatically redirect unauthenticated users  
✅ Session secret for cookie signing  
✅ Password length validation (minimum 6 characters)  

## Next Steps

The game page is now ready for implementation with:
- Interactive Nepal map
- Location images
- Guessing functionality
- Score calculation
