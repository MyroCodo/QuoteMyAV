/**
 * AWS Cognito Authentication Service
 *
 * This module provides authentication using AWS Cognito with fallback to Supabase
 * during the migration period.
 */

// Cognito configuration
const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION || 'us-east-1';
const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID || '';
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || '';

export const isCognitoConfigured = Boolean(COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID);

// Token storage keys
const TOKEN_STORAGE_KEY = 'quotemyav_auth_tokens';
const USER_STORAGE_KEY = 'quotemyav_auth_user';

// Types
export interface CognitoUser {
  id: string;
  email: string;
  fullName: string;
  company?: string;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  emailVerified: boolean;
}

export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthResult {
  user: CognitoUser | null;
  tokens: CognitoTokens | null;
  error: Error | null;
}

// Helper to decode JWT payload without verification (client-side only)
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return {};
  }
}

// Extract user from ID token
function userFromIdToken(idToken: string): CognitoUser | null {
  const payload = decodeJwtPayload(idToken);

  if (!payload.sub) return null;

  return {
    id: payload.sub as string,
    email: (payload.email as string) || '',
    fullName: (payload.name as string) || (payload.email as string) || '',
    company: payload['custom:company'] as string | undefined,
    tier: ((payload['custom:tier'] as string) || 'free') as CognitoUser['tier'],
    emailVerified: (payload.email_verified as boolean) || false,
  };
}

// Store tokens and user
function storeAuth(tokens: CognitoTokens, user: CognitoUser): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

// Get stored tokens
function getStoredTokens(): CognitoTokens | null {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Get stored user
function getStoredUser(): CognitoUser | null {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Clear stored auth
function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

// Check if tokens are expired
function isTokenExpired(tokens: CognitoTokens): boolean {
  return Date.now() >= tokens.expiresAt;
}

/**
 * Cognito Authentication Service
 */
export const cognitoAuthService = {
  /**
   * Sign up a new user
   */
  async signUp(
    email: string,
    password: string,
    fullName: string,
    company?: string
  ): Promise<AuthResult> {
    if (!isCognitoConfigured) {
      // Demo mode
      const demoUser: CognitoUser = {
        id: 'demo-' + Date.now(),
        email,
        fullName,
        company,
        tier: 'free',
        emailVerified: true,
      };
      const demoTokens: CognitoTokens = {
        accessToken: 'demo-access-token',
        idToken: 'demo-id-token',
        refreshToken: 'demo-refresh-token',
        expiresAt: Date.now() + 3600000, // 1 hour
      };
      storeAuth(demoTokens, demoUser);
      return { user: demoUser, tokens: demoTokens, error: null };
    }

    try {
      // Cognito InitiateAuth with USER_PASSWORD_AUTH flow for sign up
      // Note: For sign up, we use the SignUp action
      const response = await fetch(
        `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp',
          },
          body: JSON.stringify({
            ClientId: COGNITO_CLIENT_ID,
            Username: email,
            Password: password,
            UserAttributes: [
              { Name: 'email', Value: email },
              { Name: 'name', Value: fullName },
              ...(company ? [{ Name: 'custom:company', Value: company }] : []),
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          user: null,
          tokens: null,
          error: new Error(data.message || 'Sign up failed'),
        };
      }

      // If auto-confirmed, sign in immediately
      if (data.UserConfirmed) {
        return this.signIn(email, password);
      }

      // User needs to confirm email
      return {
        user: null,
        tokens: null,
        error: new Error('Please check your email to confirm your account'),
      };
    } catch (err) {
      return {
        user: null,
        tokens: null,
        error: err instanceof Error ? err : new Error('Sign up failed'),
      };
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isCognitoConfigured) {
      // Demo mode
      const demoUser: CognitoUser = {
        id: 'demo-' + Date.now(),
        email,
        fullName: 'Demo User',
        tier: 'free',
        emailVerified: true,
      };
      const demoTokens: CognitoTokens = {
        accessToken: 'demo-access-token',
        idToken: 'demo-id-token',
        refreshToken: 'demo-refresh-token',
        expiresAt: Date.now() + 3600000,
      };
      storeAuth(demoTokens, demoUser);
      return { user: demoUser, tokens: demoTokens, error: null };
    }

    try {
      const response = await fetch(
        `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          },
          body: JSON.stringify({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: COGNITO_CLIENT_ID,
            AuthParameters: {
              USERNAME: email,
              PASSWORD: password,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          user: null,
          tokens: null,
          error: new Error(data.message || 'Sign in failed'),
        };
      }

      // Handle challenges (e.g., NEW_PASSWORD_REQUIRED)
      if (data.ChallengeName) {
        return {
          user: null,
          tokens: null,
          error: new Error(`Challenge required: ${data.ChallengeName}`),
        };
      }

      const authResult = data.AuthenticationResult;
      const tokens: CognitoTokens = {
        accessToken: authResult.AccessToken,
        idToken: authResult.IdToken,
        refreshToken: authResult.RefreshToken,
        expiresAt: Date.now() + authResult.ExpiresIn * 1000,
      };

      const user = userFromIdToken(authResult.IdToken);

      if (!user) {
        return {
          user: null,
          tokens: null,
          error: new Error('Failed to parse user from token'),
        };
      }

      storeAuth(tokens, user);
      return { user, tokens, error: null };
    } catch (err) {
      return {
        user: null,
        tokens: null,
        error: err instanceof Error ? err : new Error('Sign in failed'),
      };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    const tokens = getStoredTokens();

    if (isCognitoConfigured && tokens?.accessToken && tokens.accessToken !== 'demo-access-token') {
      try {
        // Global sign out from Cognito
        await fetch(
          `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-amz-json-1.1',
              'X-Amz-Target': 'AWSCognitoIdentityProviderService.GlobalSignOut',
            },
            body: JSON.stringify({
              AccessToken: tokens.accessToken,
            }),
          }
        );
      } catch {
        // Ignore sign out errors - clear local state anyway
      }
    }

    clearStoredAuth();
    return { error: null };
  },

  /**
   * Get current user
   */
  async getUser(): Promise<{ user: CognitoUser | null; error: Error | null }> {
    const tokens = getStoredTokens();
    const user = getStoredUser();

    if (!tokens || !user) {
      return { user: null, error: null };
    }

    // Check if tokens are expired
    if (isTokenExpired(tokens)) {
      // Try to refresh
      const refreshResult = await this.refreshTokens();
      if (refreshResult.error) {
        clearStoredAuth();
        return { user: null, error: null };
      }
      return { user: refreshResult.user, error: null };
    }

    return { user, error: null };
  },

  /**
   * Get current access token (for API calls)
   */
  async getAccessToken(): Promise<string | null> {
    const tokens = getStoredTokens();

    if (!tokens) return null;

    if (isTokenExpired(tokens)) {
      const refreshResult = await this.refreshTokens();
      if (refreshResult.error || !refreshResult.tokens) {
        return null;
      }
      return refreshResult.tokens.accessToken;
    }

    return tokens.accessToken;
  },

  /**
   * Refresh tokens
   */
  async refreshTokens(): Promise<AuthResult> {
    const tokens = getStoredTokens();

    if (!tokens?.refreshToken) {
      clearStoredAuth();
      return { user: null, tokens: null, error: new Error('No refresh token') };
    }

    if (!isCognitoConfigured || tokens.accessToken === 'demo-access-token') {
      // Demo mode - just extend expiration
      const newTokens: CognitoTokens = {
        ...tokens,
        expiresAt: Date.now() + 3600000,
      };
      const user = getStoredUser();
      if (user) {
        storeAuth(newTokens, user);
        return { user, tokens: newTokens, error: null };
      }
      return { user: null, tokens: null, error: new Error('No stored user') };
    }

    try {
      const response = await fetch(
        `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          },
          body: JSON.stringify({
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            ClientId: COGNITO_CLIENT_ID,
            AuthParameters: {
              REFRESH_TOKEN: tokens.refreshToken,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        clearStoredAuth();
        return {
          user: null,
          tokens: null,
          error: new Error(data.message || 'Token refresh failed'),
        };
      }

      const authResult = data.AuthenticationResult;
      const newTokens: CognitoTokens = {
        accessToken: authResult.AccessToken,
        idToken: authResult.IdToken,
        refreshToken: tokens.refreshToken, // Refresh token stays the same
        expiresAt: Date.now() + authResult.ExpiresIn * 1000,
      };

      const user = userFromIdToken(authResult.IdToken);

      if (!user) {
        clearStoredAuth();
        return {
          user: null,
          tokens: null,
          error: new Error('Failed to parse user from token'),
        };
      }

      storeAuth(newTokens, user);
      return { user, tokens: newTokens, error: null };
    } catch (err) {
      clearStoredAuth();
      return {
        user: null,
        tokens: null,
        error: err instanceof Error ? err : new Error('Token refresh failed'),
      };
    }
  },

  /**
   * Confirm sign up with code
   */
  async confirmSignUp(email: string, code: string): Promise<{ error: Error | null }> {
    if (!isCognitoConfigured) {
      return { error: null };
    }

    try {
      const response = await fetch(
        `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.ConfirmSignUp',
          },
          body: JSON.stringify({
            ClientId: COGNITO_CLIENT_ID,
            Username: email,
            ConfirmationCode: code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Confirmation failed') };
      }

      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Confirmation failed'),
      };
    }
  },

  /**
   * Forgot password - initiate reset
   */
  async forgotPassword(email: string): Promise<{ error: Error | null }> {
    if (!isCognitoConfigured) {
      return { error: null };
    }

    try {
      const response = await fetch(
        `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.ForgotPassword',
          },
          body: JSON.stringify({
            ClientId: COGNITO_CLIENT_ID,
            Username: email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Password reset failed') };
      }

      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Password reset failed'),
      };
    }
  },

  /**
   * Confirm forgot password with code and new password
   */
  async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ error: Error | null }> {
    if (!isCognitoConfigured) {
      return { error: null };
    }

    try {
      const response = await fetch(
        `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.ConfirmForgotPassword',
          },
          body: JSON.stringify({
            ClientId: COGNITO_CLIENT_ID,
            Username: email,
            ConfirmationCode: code,
            Password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Password reset failed') };
      }

      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Password reset failed'),
      };
    }
  },
};
