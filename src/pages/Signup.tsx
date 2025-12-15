import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Button, Input } from '../components/ui';
import { isSupabaseConfigured } from '../services/supabase';

const isAuthDisabled = import.meta.env.VITE_AUTH_DISABLED === 'true';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  // Clear error when inputs change
  useEffect(() => {
    clearError();
  }, [email, password, fullName, company, clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      return;
    }

    const result = await signUp(email, password, fullName, company || undefined);

    if (result.success) {
      navigate(redirectUrl, { replace: true });
    }
  };

  if (isAuthDisabled) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/10 mb-2">
          <Clock className="w-8 h-8 text-teal-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-slate-400">
            We're putting the finishing touches on QuoteMyAV.
            <br />
            Check back soon to create your account!
          </p>
        </div>
        <div className="pt-4">
          <Link
            to="/"
            className="text-teal-400 font-medium hover:text-teal-300 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isSupabaseConfigured && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-400">
            Demo mode - account will be stored locally
          </p>
        </div>
      )}

      <Input
        label="Full name"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        placeholder="John Doe"
      />

      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
      />

      <Input
        label="Company (optional)"
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Your AV Company"
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="At least 8 characters"
        helperText="Minimum 8 characters"
        error={password.length > 0 && password.length < 8 ? 'Password must be at least 8 characters' : undefined}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        }
      />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || password.length < 8}
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-teal-400 font-medium hover:text-teal-300">
          Sign in
        </Link>
      </p>
    </form>
  );
}
