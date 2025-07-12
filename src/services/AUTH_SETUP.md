# Authentication Setup Guide

This document explains how to set up Google and Apple authentication for production use.

## Current Implementation

The current implementation includes:
- ✅ Google OAuth flow with proper URL scheme handling
- ✅ Apple Sign In with OAuth endpoints 
- ✅ Secure token storage using Expo SecureStore
- ✅ Development mode with demo authentication
- ✅ Error handling and user feedback

## For Production Setup

### Google Authentication

1. **Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API and Google OAuth2 API
   - Create OAuth 2.0 credentials for mobile app
   - Add your bundle ID (`com.vibecode.tripkit`)

2. **Update Configuration:**
   - Replace `YOUR_GOOGLE_CLIENT_ID` in `authService.ts`
   - Add the client ID to your environment variables

3. **URL Scheme:**
   - Already configured in `app.json` with scheme `vibecode`

### Apple Sign In

1. **Apple Developer Setup:**
   - Sign in to [Apple Developer Console](https://developer.apple.com/)
   - Enable "Sign In with Apple" capability
   - Configure your App ID with Sign In with Apple
   - Create and configure service ID

2. **Bundle Configuration:**
   - Bundle ID already set to `com.vibecode.tripkit` in `app.json`
   - Update the client_id in the Apple auth URL

3. **Native Implementation (Recommended):**
   - For better Apple Sign In experience, consider using `expo-apple-authentication`
   - This provides native Apple Sign In buttons and better UX

## Current Features

### Development Mode
- Shows confirmation dialogs explaining what would happen
- Simulates successful authentication
- Creates demo users for testing

### Production Mode  
- Opens actual OAuth URLs
- Handles real authentication flows
- Stores authentic user data securely

### Security Features
- Uses Expo SecureStore for sensitive data
- Proper URL scheme handling
- Error handling with user-friendly messages
- Authentication state persistence

## Files Modified
- `src/services/authService.ts` - Main authentication logic
- `src/screens/LoginScreen.tsx` - Google/Apple login buttons
- `src/screens/SignUpScreen.tsx` - Google/Apple signup buttons  
- `app.json` - URL scheme and plugin configuration