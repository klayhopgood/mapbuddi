# Clerk Google OAuth Setup - Fix for 400 Error

## Problem
When users try to "Continue with Google" in Clerk, they get a 400 error. This is because the Google OAuth redirect URLs aren't properly configured in Google Cloud Console.

## Solution

You need to add Clerk's OAuth callback URLs to your Google Cloud Console project.

### Step 1: Get Your Clerk OAuth Callback URLs

Your Clerk callback URLs should be:
- **Production**: `https://clerk.mapbuddi.com/v1/oauth_callback`
- **Development**: `https://your-dev-domain.clerk.accounts.dev/v1/oauth_callback`

### Step 2: Add to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (the one you're using for Clerk)
5. Click to edit it
6. Under **Authorized redirect URIs**, add:
   ```
   https://clerk.mapbuddi.com/v1/oauth_callback
   ```

### Step 3: Verify Clerk Settings

In your Clerk Dashboard:
1. Go to **Configure** → **SSO Connections**
2. Click on **Google**
3. Make sure you've entered:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret

### Important Notes

- **Two Different OAuth Flows**: 
  - Clerk uses Google OAuth for user authentication (sign in/sign up)
  - Your app uses Google OAuth for Maps integration (different callback: `/api/auth/google/callback`)
  
- **You need TWO sets of redirect URLs** in Google Cloud Console:
  1. Clerk's callback: `https://clerk.mapbuddi.com/v1/oauth_callback`
  2. Your Maps callback: `https://mapbuddi.com/api/auth/google/callback`

### Testing

After adding the redirect URLs:
1. Wait a few minutes for changes to propagate
2. Try signing in with Google again
3. Should work without 400 error

## Current Configuration

Based on your setup:
- **Clerk Callback**: `https://clerk.mapbuddi.com/v1/oauth_callback` (you mentioned this earlier)
- **Maps Callback**: `https://mapbuddi.com/api/auth/google/callback` (for Google Maps integration)

Both need to be added to your Google Cloud Console OAuth client.

