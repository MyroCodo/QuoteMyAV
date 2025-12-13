import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Background image */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/icons/hero/hero-login-split.png)' }}
      >
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/icons/logo/logo-icon-only.png"
              alt="QuoteMyAV"
              className="w-10 h-10 rounded-xl"
            />
            <span className="text-xl font-bold">QuoteMyAV</span>
          </Link>
          <div>
            <h2 className="text-3xl font-bold mb-4">AI-Powered AV Quotes</h2>
            <p className="text-white/80">
              Generate professional quotes in minutes. Built for AV rental companies and event production houses.
            </p>
          </div>
          <p className="text-sm text-white/60">
            &copy; 2025 QuoteMyAV
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 relative overflow-hidden">
        {/* Background decoration for mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Logo - mobile only */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 lg:hidden">
          <Link to="/" className="flex justify-center items-center gap-2.5 group">
            <img
              src="/icons/logo/logo-icon-only.png"
              alt="QuoteMyAV"
              className="w-12 h-12 rounded-xl shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow"
            />
          </Link>
          <h2 className="mt-4 text-center text-2xl font-bold text-white">
            QuoteMyAV
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            AI-powered AV quotes in minutes
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-slate-700/50">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
