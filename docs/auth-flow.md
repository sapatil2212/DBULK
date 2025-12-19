# Authentication Flow for DBULK WhatsApp Integration

This document explains the authentication flow used in the DBULK WhatsApp integration platform, including how authentication tokens are handled between the frontend and backend services.

## Overview

The authentication system in DBULK uses JWT (JSON Web Tokens) for securing API requests. There are two types of tokens used:

1. **HTTP-only Cookie Token**: Used for secure server-side requests
2. **JavaScript-accessible Token**: Used for client-side API calls

## Authentication Flow

### User Login Process

1. User submits their email and password through the login form
2. The frontend sends credentials to the `/api/auth/login` endpoint
3. If credentials are valid:
   - Server creates a new session in the database
   - Server generates a JWT containing user ID, tenant ID, and session ID
   - Server sets two cookies:
     - `authToken`: HTTP-only cookie for secure requests
     - `auth_token`: JavaScript-accessible cookie for client-side API calls
   - Server returns user data and token in the response body
4. Frontend saves:
   - User data in `localStorage.userData`
   - Authentication token in `localStorage.auth_token`
   - Authentication status flag in `localStorage.isAuthenticated`
5. User is redirected to the dashboard or the originally requested page

### API Request Authorization

All API requests that require authentication include:

1. Authorization header with the token: `Authorization: Bearer <token>`
2. The HTTP-only cookie that's automatically sent by the browser

This dual approach provides:
- Security through HTTP-only cookies that can't be accessed by JavaScript
- Flexibility for client-side code to make authenticated requests

### WhatsApp Connection Flow

1. User visits the WhatsApp Connect page
2. The page checks for authentication:
   - If authenticated, shows the connection form
   - If not authenticated, redirects to login page with a `redirect` parameter
3. User completes authentication if needed
4. User enters WhatsApp Business API credentials:
   - WhatsApp Business Account ID (WABA ID)
   - Phone Number ID
   - Access Token
5. When submitted, the frontend:
   - Validates form data
   - Gets the auth token from localStorage
   - Makes an authenticated API request to `/api/whatsapp/connect`
6. The backend:
   - Validates the auth token
   - Verifies the WhatsApp credentials with the Meta API
   - Stores the encrypted access token
   - Returns success response with account details
7. On success, the UI updates and redirects to the templates page

### Token Refresh & Session Management

- The user context performs authentication verification on startup
- Invalid or expired tokens cause a redirect to the login page
- User sessions can be terminated through the logout function

## Implementation Details

### Frontend Authentication Utility (`lib/utils/api.ts`)

The `apiRequest` utility automatically includes authentication tokens in API requests:

```typescript
export async function apiRequest<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  if (includeAuth && token) {
    authHeaders = { 'Authorization': `Bearer ${token}` };
  }
  // Make authenticated request...
}
```

### User Context (`lib/contexts/user-context.tsx`)

The UserContext provider manages:
- Authentication state
- User data
- Login/logout functionality
- Token storage

### API Routes

API routes use the `getAuthUser` middleware to verify tokens before processing requests.

## Security Considerations

1. Access tokens for WhatsApp Business API are encrypted before storage
2. Authentication tokens expire after 7 days
3. Invalid sessions are automatically cleared
4. Failed login attempts are rate-limited
5. Authentication errors trigger redirects to the login page

## Troubleshooting

Common authentication issues:
1. Missing token errors: User is not logged in or token expired
2. Invalid token: User session has been invalidated
3. Authentication API errors: Backend service issues

For any persistent authentication issues, users should log out and log back in.
