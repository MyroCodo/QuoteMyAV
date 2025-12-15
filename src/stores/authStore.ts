import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, company?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

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

      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  signIn: async (email, password, rememberMe = true) => {
    set({ isLoading: true, error: null });

    try {
      const { user, error } = await authService.signIn(email, password, rememberMe);

      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      set({
        user,
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

      set({
        user,
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
