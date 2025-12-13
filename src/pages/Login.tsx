import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button, Input } from '../components/ui';
import { isSupabaseConfigured } from '../services/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  // Get the redirect path from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Clear error when component mounts or inputs change
  useEffect(() => {
    clearError();
  }, [email, password, clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isSupabaseConfigured && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-400">
            Demo mode - any email/password will work
          </p>
        </div>
      )}

      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Enter your password"
      />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/signup" className="text-teal-400 font-medium hover:text-teal-300">
          Sign up
        </Link>
      </p>
    </form>
  );
}
