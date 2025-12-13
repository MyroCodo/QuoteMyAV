/**
 * Unified Authentication Service
 *
 * Uses AWS Cognito as primary auth provider with Supabase fallback
 * during the migration period.
 */

import { cognitoAuthService, isCognitoConfigured, type CognitoUser } from './cognito';
import { authService as supabaseAuthService, isSupabaseConfigured } from './supabase';
import type { User } from '../types';

// Determine which auth provider to use
// Prefer Cognito if configured, fall back to Supabase
const useCognito = isCognitoConfigured;
const useSupabase = !isCognitoConfigured && isSupabaseConfigured;

console.log(`[Auth] Provider: ${useCognito ? 'Cognito' : useSupabase ? 'Supabase' : 'Demo'}`);

// Convert CognitoUser to our User type
function mapCognitoUser(cognitoUser: CognitoUser | null): User | null {
  if (!cognitoUser) return null;

  return {
    id: cognitoUser.id,
    email: cognitoUser.email,
    fullName: cognitoUser.fullName,
    company: cognitoUser.company,
    tier: cognitoUser.tier,
    createdAt: new Date().toISOString(),
  };
}

// Convert Supabase user to our User type
function mapSupabaseUser(
  supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null
): User | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: (supabaseUser.user_metadata?.full_name as string) || '',
    company: supabaseUser.user_metadata?.company as string | undefined,
    tier: 'free', // Default tier for Supabase users
    createdAt: new Date().toISOString(),
  };
}

/**
 * Unified Auth Service
 */
export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(
    email: string,
    password: string,
    fullName: string,
    company?: string
  ): Promise<{ user: User | null; error: Error | null }> {
    if (useCognito) {
      const result = await cognitoAuthService.signUp(email, password, fullName, company);
      return {
        user: mapCognitoUser(result.user),
        error: result.error,
      };
    }

    if (useSupabase) {
      const result = await supabaseAuthService.signUp(email, password, fullName, company);
      return {
        user: mapSupabaseUser(result.user),
        error: result.error,
      };
    }

    // Demo mode
    const demoUser: User = {
      id: 'demo-' + Date.now(),
      email,
      fullName,
      company,
      tier: 'free',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('demo-user', JSON.stringify(demoUser));
    return { user: demoUser, error: null };
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    if (useCognito) {
      const result = await cognitoAuthService.signIn(email, password);
      return {
        user: mapCognitoUser(result.user),
        error: result.error,
      };
    }

    if (useSupabase) {
      const result = await supabaseAuthService.signIn(email, password);
      return {
        user: mapSupabaseUser(result.user),
        error: result.error,
      };
    }

    // Demo mode
    const demoUser: User = {
      id: 'demo-' + Date.now(),
      email,
      fullName: 'Demo User',
      tier: 'free',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('demo-user', JSON.stringify(demoUser));
    return { user: demoUser, error: null };
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    if (useCognito) {
      return cognitoAuthService.signOut();
    }

    if (useSupabase) {
      return supabaseAuthService.signOut();
    }

    // Demo mode
    localStorage.removeItem('demo-user');
    return { error: null };
  },

  /**
   * Get current user
   */
  async getUser(): Promise<{ user: User | null; error: Error | null }> {
    if (useCognito) {
      const result = await cognitoAuthService.getUser();
      return {
        user: mapCognitoUser(result.user),
        error: result.error,
      };
    }

    if (useSupabase) {
      const result = await supabaseAuthService.getUser();
      return {
        user: mapSupabaseUser(result.user),
        error: result.error,
      };
    }

    // Demo mode
    try {
      const stored = localStorage.getItem('demo-user');
      const user = stored ? JSON.parse(stored) : null;
      return { user, error: null };
    } catch {
      return { user: null, error: null };
    }
  },

  /**
   * Get access token for API calls
   */
  async getAccessToken(): Promise<string | null> {
    if (useCognito) {
      return cognitoAuthService.getAccessToken();
    }

    if (useSupabase) {
      const result = await supabaseAuthService.getSession();
      return result.session?.access_token || null;
    }

    // Demo mode
    return 'demo-token';
  },

  /**
   * Confirm sign up with code (Cognito only)
   */
  async confirmSignUp(email: string, code: string): Promise<{ error: Error | null }> {
    if (useCognito) {
      return cognitoAuthService.confirmSignUp(email, code);
    }
    return { error: null };
  },

  /**
   * Forgot password - initiate reset
   */
  async forgotPassword(email: string): Promise<{ error: Error | null }> {
    if (useCognito) {
      return cognitoAuthService.forgotPassword(email);
    }

    if (useSupabase) {
      // Supabase password reset would go here
      // For now, just return success
      console.log('Password reset requested for:', email);
      return { error: null };
    }

    return { error: null };
  },

  /**
   * Confirm password reset with code and new password
   */
  async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ error: Error | null }> {
    if (useCognito) {
      return cognitoAuthService.confirmForgotPassword(email, code, newPassword);
    }
    return { error: null };
  },

  /**
   * Check if an auth provider is configured
   */
  isConfigured(): boolean {
    return isCognitoConfigured || isSupabaseConfigured;
  },

  /**
   * Get the current auth provider name
   */
  getProviderName(): string {
    if (useCognito) return 'cognito';
    if (useSupabase) return 'supabase';
    return 'demo';
  },
};

export default authService;
