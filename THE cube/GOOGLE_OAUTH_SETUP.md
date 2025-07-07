# Google OAuth Setup Guide for CUBE

## Prerequisites
1. A Google Cloud Console account
2. A web application that can be hosted on a domain

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "CUBE - Premium Rubik's Cube Solver"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (your email addresses for testing)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - Name: "CUBE Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - `http://localhost:8080` (for local development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for local development)
     - `http://localhost:8080` (for local development)
     - `https://yourdomain.com` (for production)

## Step 4: Update Your Application

1. Copy the Client ID from the credentials page
2. Replace `YOUR_GOOGLE_CLIENT_ID` in the following files:
   - `index.html` (lines with `data-client_id="YOUR_GOOGLE_CLIENT_ID"`)
   - `script.js` (line with `const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'`)

## Step 5: Test the Integration

1. Open your application in a web browser
2. Click the "Login" or "Sign Up" button
3. Click the Google sign-in button
4. Complete the Google OAuth flow
5. Verify that user information is displayed correctly

## Security Considerations

1. **HTTPS Required**: Google OAuth requires HTTPS in production
2. **Domain Verification**: For production, verify your domain ownership
3. **Client ID Security**: Never expose your client secret in client-side code
4. **Token Validation**: Consider validating tokens on your backend

## Troubleshooting

### Common Issues:

1. **"Invalid Client" Error**
   - Check that your Client ID is correct
   - Verify the domain is in authorized origins

2. **"Redirect URI Mismatch"**
   - Ensure your domain is exactly matched in authorized redirect URIs
   - Check for trailing slashes

3. **"OAuth consent screen not configured"**
   - Complete the OAuth consent screen setup
   - Add your email as a test user

4. **"Pop-up blocked"**
   - Allow pop-ups for your domain
   - Check browser settings

## Production Deployment

1. **Domain Setup**: Deploy to a domain with HTTPS
2. **Update Origins**: Add your production domain to authorized origins
3. **Environment Variables**: Use environment variables for client IDs
4. **Monitoring**: Set up Google Analytics for OAuth events

## Additional Features

Consider implementing:
- Backend token validation
- User session management
- Profile picture caching
- Automatic token refresh
- Error handling and retry logic

## Support

For Google OAuth issues:
- [Google Identity Documentation](https://developers.google.com/identity)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Best Practices](https://developers.google.com/identity/protocols/oauth2) 