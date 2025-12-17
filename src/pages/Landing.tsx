import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/icons/logo/logo-icon-only.png"
                alt="QMAV"
                className="w-10 h-10 rounded-xl shadow-lg group-hover:shadow-teal-500/30 transition-shadow"
              />
              <span className="text-xl font-bold text-white">QMAV</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/icons/hero/hero-landing-gradient.png)' }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
            <span className="text-teal-400 text-sm font-medium">AI-Powered Quote Generation</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
            AV Quotes in Minutes,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Not Hours
            </span>
          </h1>

          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
            Let AI handle the tedious parts of AV quoting. Describe your event,
            get accurate, professional quotes instantly. Built for AV rental companies
            and event production houses.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto px-8">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="mt-6 text-sm text-slate-500">
            3 free quotes per month. No credit card required.
          </p>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 pointer-events-none"></div>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-slate-500 text-sm">QMAV Dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-sm text-slate-400">Total Quotes</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-teal-400">$48,250</div>
                <div className="text-sm text-slate-400">Revenue</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-400">8</div>
                <div className="text-sm text-slate-400">Accepted</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-800">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Four simple steps to professional AV quotes
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-teal-500/30 transition-colors text-center">
            <img
              src="/icons/steps/step-1-form.png"
              alt="Step 1"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-white mb-2">
              Describe Event
            </h3>
            <p className="text-slate-400 text-sm">
              Fill out event details: type, venue, dates, and equipment needs.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-colors text-center">
            <img
              src="/icons/steps/step-2-ai.png"
              alt="Step 2"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-white mb-2">
              AI Magic
            </h3>
            <p className="text-slate-400 text-sm">
              Claude AI generates a complete equipment list with pricing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-colors text-center">
            <img
              src="/icons/steps/step-3-review.png"
              alt="Step 3"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-white mb-2">
              Review & Edit
            </h3>
            <p className="text-slate-400 text-sm">
              Fine-tune with inline editing and AI suggestions.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-teal-500/30 transition-colors text-center">
            <img
              src="/icons/steps/step-4-send.png"
              alt="Step 4"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-white mb-2">
              Send Quote
            </h3>
            <p className="text-slate-400 text-sm">
              Export as PDF and send to your client in one click.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-800">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Built for AV Professionals
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Everything you need to create professional quotes faster
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '/icons/icons/icon-lightning-speed.png',
              title: 'Lightning Fast',
              description: 'Generate complete quotes in seconds, not hours. AI handles the heavy lifting.',
            },
            {
              icon: '/icons/icons/icon-ai-smart.png',
              title: 'AI-Smart',
              description: 'Claude AI understands AV equipment and generates accurate quotes based on event requirements.',
            },
            {
              icon: '/icons/icons/icon-savings.png',
              title: 'Cost Efficient',
              description: 'Optimize pricing with AI suggestions. Hit budgets while maintaining margins.',
            },
            {
              icon: '/icons/icons/icon-audio.png',
              title: 'Audio Equipment',
              description: 'Complete audio gear catalog - speakers, mixers, microphones, and more.',
            },
            {
              icon: '/icons/icons/icon-video.png',
              title: 'Video & Projection',
              description: 'LED walls, projectors, screens, cameras - all video equipment covered.',
            },
            {
              icon: '/icons/icons/icon-lighting.png',
              title: 'Stage Lighting',
              description: 'Moving heads, LED pars, truss, and lighting control systems.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition-colors group"
            >
              <img
                src={feature.icon}
                alt={feature.title}
                className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-800">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more quotes
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              quotes: '3 quotes/month',
              features: ['AI quote generation', 'PDF export', 'Basic editing'],
              plan: 'free',
            },
            {
              name: 'Starter',
              price: '$20',
              period: '/month',
              quotes: '25 quotes/month',
              features: ['Everything in Free', 'AI edit assistant', 'Version history'],
              plan: 'starter',
            },
            {
              name: 'Pro',
              price: '$60',
              period: '/month',
              quotes: 'Unlimited quotes',
              features: ['Everything in Starter', 'Priority support', 'Custom branding'],
              featured: true,
              plan: 'pro',
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: '',
              quotes: 'Multi-seat teams',
              features: ['Everything in Pro', 'Team collaboration', 'API access', 'Dedicated support'],
              plan: 'enterprise',
            },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 ${
                tier.featured
                  ? 'bg-gradient-to-b from-teal-500 to-teal-600 ring-2 ring-teal-400'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {tier.featured && (
                <div className="text-xs font-semibold text-teal-900 bg-teal-300 rounded-full px-3 py-1 inline-block mb-4">
                  Most Popular
                </div>
              )}
              <h3 className={`text-lg font-semibold ${tier.featured ? 'text-white' : 'text-white'}`}>
                {tier.name}
              </h3>
              <div className="mt-4 mb-6">
                <span className={`text-4xl font-bold ${tier.featured ? 'text-white' : 'text-white'}`}>
                  {tier.price}
                </span>
                <span className={`text-sm ${tier.featured ? 'text-teal-100' : 'text-slate-400'}`}>
                  {tier.period}
                </span>
              </div>
              <p className={`text-sm font-medium mb-6 ${tier.featured ? 'text-teal-100' : 'text-slate-400'}`}>
                {tier.quotes}
              </p>
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 ${tier.featured ? 'text-teal-200' : 'text-teal-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm ${tier.featured ? 'text-white' : 'text-slate-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to={
                  tier.plan === 'free'
                    ? '/signup'
                    : tier.plan === 'enterprise'
                    ? '/#contact'
                    : `/checkout?plan=${tier.plan}`
                }
                className="block mt-6"
              >
                {tier.featured ? (
                  <button className="w-full px-4 py-2.5 bg-white text-teal-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors">
                    Get Started
                  </button>
                ) : (
                  <Button variant="ghost" className="w-full">
                    {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-800">
        <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-3xl p-12 border border-teal-500/20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Quote Faster?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Join AV professionals who are saving hours on every quote. Start your free trial today.
          </p>
          <Link to="/signup">
            <Button size="lg" className="px-8">
              Start Free Trial
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/icons/logo/logo-icon-only.png"
                alt="QMAV"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-bold text-white">QMAV</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; 2025 QMAV. Built for AV professionals.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">
                Privacy
              </Link>
              <Link to="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">
                Terms
              </Link>
              <a href="mailto:support@quotemyav.com" className="text-slate-400 hover:text-white transition-colors text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
