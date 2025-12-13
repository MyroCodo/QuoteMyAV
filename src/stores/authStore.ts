import { create } from 'zustand';
import type { User } from '../types';
import { authService, isSupabaseConfigured } from '../services/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, company?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Helper to convert Supabase user to our User type
const mapUser = (supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null): User | null => {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: (supabaseUser.user_metadata?.full_name as string) || '',
    company: supabaseUser.user_metadata?.company as string | undefined,
    tier: 'free', // Default tier, would come from database in production
    createdAt: new Date().toISOString(),
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });

    try {
      const { user, error } = await authService.getUser();

      if (error) {
        console.error('Auth initialization error:', error);
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const mappedUser = mapUser(user);
      set({
        user: mappedUser,
        isAuthenticated: !!mappedUser,
        isLoading: false,
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const { user, error } = await authService.signIn(email, password);

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      const mappedUser = mapUser(user);

      // Save demo session if not using real Supabase
      if (!isSupabaseConfigured && user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authService.saveDemoSession(user as any);
      }

      set({
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  signUp: async (email, password, fullName, company) => {
    set({ isLoading: true, error: null });

    try {
      const { user, error } = await authService.signUp(email, password, fullName, company);

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      const mappedUser = mapUser(user);

      // Save demo session if not using real Supabase
      if (!isSupabaseConfigured && user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authService.saveDemoSession(user as any);
      }

      set({
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  signOut: async () => {
    set({ isLoading: true });

    try {
      await authService.signOut();

      // Clear demo session
      if (!isSupabaseConfigured) {
        authService.clearDemoSession();
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Sign out error:', err);
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
