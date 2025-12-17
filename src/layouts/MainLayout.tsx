import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Avatar } from '../components/ui';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Quotes', href: '/quotes' },
  { name: 'New Quote', href: '/quotes/new' },
  { name: 'Settings', href: '/settings' },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/icons/logo/logo-icon-only.png"
                alt="QMAV"
                className="w-9 h-9 rounded-xl shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-shadow"
              />
              <span className="text-xl font-semibold text-white">QMAV</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.href
                      ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2">
                    <Avatar
                      src={user.profilePictureUrl}
                      name={user.fullName}
                      size="md"
                    />
                    <span className="text-sm text-slate-300">{user.fullName}</span>
                  </div>
                  <div className="sm:hidden">
                    <Avatar
                      src={user.profilePictureUrl}
                      name={user.fullName}
                      size="md"
                    />
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition-all duration-200"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
