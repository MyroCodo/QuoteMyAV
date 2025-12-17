import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { PLAN_DETAILS } from '../types';
import type { SubscriptionPlan } from '../types';

// Comprehensive feature list for comparison
const ALL_FEATURES = [
  { key: 'quotesPerMonth', label: 'Monthly quote limit', category: 'Core' },
  { key: 'aiGeneration', label: 'AI-powered quote generation', category: 'Core' },
  { key: 'pdfExport', label: 'PDF export', category: 'Core' },
  { key: 'aiEditAssistant', label: 'AI Edit Assistant', category: 'AI Features' },
  { key: 'quickActions', label: 'Quick actions (Hit Budget, Add Premium, etc.)', category: 'AI Features' },
  { key: 'quoteVersioning', label: 'Quote versioning & history', category: 'Productivity' },
  { key: 'customBranding', label: 'Custom branding on quotes', category: 'Branding' },
  { key: 'multiSeat', label: 'Multi-seat team access', category: 'Team' },
  { key: 'customIntegrations', label: 'Custom API integrations', category: 'Enterprise' },
  { key: 'slaGuarantee', label: 'SLA uptime guarantee', category: 'Enterprise' },
  { key: 'dedicatedSupport', label: 'Dedicated account manager', category: 'Support' },
  { key: 'prioritySupport', label: 'Priority email support', category: 'Support' },
  { key: 'emailSupport', label: 'Email support', category: 'Support' },
];

// Feature availability by plan
const PLAN_FEATURE_MAP: Record<SubscriptionPlan, Record<string, boolean | string>> = {
  free: {
    quotesPerMonth: '3 quotes',
    aiGeneration: true,
    pdfExport: true,
    aiEditAssistant: false,
    quickActions: false,
    quoteVersioning: false,
    customBranding: false,
    multiSeat: false,
    customIntegrations: false,
    slaGuarantee: false,
    dedicatedSupport: false,
    prioritySupport: false,
    emailSupport: true,
  },
  starter: {
    quotesPerMonth: '25 quotes',
    aiGeneration: true,
    pdfExport: true,
    aiEditAssistant: true,
    quickActions: false,
    quoteVersioning: true,
    customBranding: false,
    multiSeat: false,
    customIntegrations: false,
    slaGuarantee: false,
    dedicatedSupport: false,
    prioritySupport: true,
    emailSupport: true,
  },
  pro: {
    quotesPerMonth: 'Unlimited',
    aiGeneration: true,
    pdfExport: true,
    aiEditAssistant: true,
    quickActions: true,
    quoteVersioning: true,
    customBranding: true,
    multiSeat: false,
    customIntegrations: false,
    slaGuarantee: false,
    dedicatedSupport: false,
    prioritySupport: true,
    emailSupport: true,
  },
  enterprise: {
    quotesPerMonth: 'Unlimited',
    aiGeneration: true,
    pdfExport: true,
    aiEditAssistant: true,
    quickActions: true,
    quoteVersioning: true,
    customBranding: true,
    multiSeat: true,
    customIntegrations: true,
    slaGuarantee: true,
    dedicatedSupport: true,
    prioritySupport: true,
    emailSupport: true,
  },
};

export function Plans() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { subscription } = useSubscriptionStore();
  const currentPlan = subscription?.plan || 'free';
  const plans: SubscriptionPlan[] = ['free', 'starter', 'pro', 'enterprise'];

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan === 'free') return;
    if (isAuthenticated) {
      navigate(`/checkout?plan=${plan}`);
    } else {
      navigate(`/signup?redirect=${encodeURIComponent(`/checkout?plan=${plan}`)}`);
    }
  };

  // Group features by category
  const categories = [...new Set(ALL_FEATURES.map(f => f.category))];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
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
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-4">
          Choose the plan that fits your business. All plans include our core AI-powered quote generation.
        </p>
        <p className="text-sm text-slate-500">
          No hidden fees. Cancel anytime. 30-day money-back guarantee.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const details = PLAN_DETAILS[plan];
            const isCurrent = isAuthenticated && plan === currentPlan;
            const isPopular = plan === 'pro';

            return (
              <Card
                key={plan}
                className={`relative flex flex-col ${
                  isPopular
                    ? 'border-teal-500 ring-2 ring-teal-500/30 bg-slate-800/80'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="teal">Most Popular</Badge>
                  </div>
                )}

                {/* Current Badge */}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="info">Current Plan</Badge>
                  </div>
                )}

                <div className="pt-4 flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{details.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-white">
                      {details.price === 0 ? 'Free' : `$${details.price}`}
                    </span>
                    {details.price > 0 && (
                      <span className="text-slate-400">/month</span>
                    )}
                  </div>

                  <p className="text-slate-400 mb-6">
                    {details.quotesPerMonth === 'unlimited'
                      ? 'Unlimited quotes per month'
                      : `${details.quotesPerMonth} quotes per month`}
                  </p>

                  {/* Quick Feature List */}
                  <ul className="space-y-2 mb-6">
                    {details.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  {plan === 'free' ? (
                    isAuthenticated ? (
                      <Button variant="ghost" className="w-full" disabled>
                        {isCurrent ? 'Current Plan' : 'Free Forever'}
                      </Button>
                    ) : (
                      <Link to="/signup" className="block">
                        <Button variant="secondary" className="w-full">
                          Get Started Free
                        </Button>
                      </Link>
                    )
                  ) : isCurrent ? (
                    <Button variant="ghost" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={isPopular ? 'primary' : 'secondary'}
                      className="w-full"
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {isAuthenticated ? 'Upgrade' : 'Get Started'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detailed Feature Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Detailed Feature Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-4 px-4 text-slate-400 font-medium w-1/3">Feature</th>
                {plans.map((plan) => (
                  <th key={plan} className="text-center py-4 px-4">
                    <span className="text-white font-semibold">{PLAN_DETAILS[plan].name}</span>
                    <div className="text-sm text-slate-400 mt-1">
                      {PLAN_DETAILS[plan].price === 0 ? 'Free' : `$${PLAN_DETAILS[plan].price}/mo`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <>
                  <tr key={category} className="bg-slate-800/30">
                    <td colSpan={5} className="py-3 px-4 text-sm font-semibold text-teal-400 uppercase tracking-wide">
                      {category}
                    </td>
                  </tr>
                  {ALL_FEATURES.filter(f => f.category === category).map((feature) => (
                    <tr key={feature.key} className="border-b border-slate-800">
                      <td className="py-4 px-4 text-slate-300">{feature.label}</td>
                      {plans.map((plan) => {
                        const value = PLAN_FEATURE_MAP[plan][feature.key];
                        return (
                          <td key={plan} className="text-center py-4 px-4">
                            {typeof value === 'string' ? (
                              <span className="text-white font-medium">{value}</span>
                            ) : value ? (
                              <svg className="w-5 h-5 text-teal-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Can I change plans at any time?</h3>
            <p className="text-slate-400">
              Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at the end of your current billing period.
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">What happens if I exceed my quote limit?</h3>
            <p className="text-slate-400">
              If you reach your monthly quote limit, you'll be prompted to upgrade to a higher plan. Your existing quotes remain accessible, and your limit resets on your billing date.
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">How does the 30-day money-back guarantee work?</h3>
            <p className="text-slate-400">
              If you're not satisfied with QuoteMyAV within the first 30 days of your paid subscription, contact us for a full refund. No questions asked.
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">How do I cancel my subscription?</h3>
            <p className="text-slate-400">
              You can cancel anytime from your Account Settings. Go to Settings &rarr; Billing and click "Cancel Plan." Your access continues until the end of your current billing period.
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Do you offer annual billing?</h3>
            <p className="text-slate-400">
              Annual billing with a discount is coming soon. Currently, all plans are billed monthly with no long-term commitment required.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to streamline your AV quoting?
        </h2>
        <p className="text-slate-400 mb-8">
          Start free and upgrade when you're ready. No credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button variant="primary" size="lg">
              Start Free Trial
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Log In
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/plans" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/#features" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@quotemyav.com" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@quotemyav.com" className="text-slate-400 hover:text-white transition-colors">support@quotemyav.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} QuoteMyAV. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
