import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not configured. Running in demo mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Auth helpers
export const authService = {
  async signUp(email: string, password: string, fullName: string, company?: string) {
    if (!isSupabaseConfigured) {
      // Demo mode - simulate signup
      return {
        user: { id: 'demo-user', email, user_metadata: { full_name: fullName, company } },
        session: { access_token: 'demo-token' },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company: company || '',
        },
      },
    });

    return { user: data.user, session: data.session, error };
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      // Demo mode - simulate login
      return {
        user: { id: 'demo-user', email, user_metadata: { full_name: 'Demo User' } },
        session: { access_token: 'demo-token' },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, session: data.session, error };
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      // Check localStorage for demo session
      const demoSession = localStorage.getItem('demo-session');
      if (demoSession) {
        return { session: JSON.parse(demoSession), error: null };
      }
      return { session: null, error: null };
    }

    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  async getUser(): Promise<{ user: User | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      const demoSession = localStorage.getItem('demo-session');
      if (demoSession) {
        const session = JSON.parse(demoSession);
        return { user: session.user, error: null };
      }
      return { user: null, error: null };
    }

    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!isSupabaseConfigured) {
      // Demo mode - no real-time auth changes
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(callback);
  },

  // Demo mode helpers
  saveDemoSession(user: { id: string; email: string; user_metadata: Record<string, string> }) {
    const session = {
      access_token: 'demo-token',
      user,
    };
    localStorage.setItem('demo-session', JSON.stringify(session));
  },

  clearDemoSession() {
    localStorage.removeItem('demo-session');
  },
};
