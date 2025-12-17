import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { stripeService, isStripeConfigured } from '../services/stripe';
import { PLAN_DETAILS } from '../types';
import type { SubscriptionPlan } from '../types';

export function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { subscription, initialize, upgradePlan } = useSubscriptionStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

  // Get plan from URL param
  const planParam = searchParams.get('plan');
  const selectedPlan = (planParam as SubscriptionPlan) || 'starter';

  // Initialize subscription when user is available
  useEffect(() => {
    if (user?.id) {
      initialize(user.id);
    }
  }, [user?.id, initialize]);

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const redirectUrl = `/checkout?plan=${selectedPlan}`;
      navigate(`/signup?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [isAuthenticated, navigate, selectedPlan]);

  // Validate plan
  const isValidPlan = ['starter', 'pro', 'enterprise'].includes(selectedPlan);
  const planDetails = isValidPlan ? PLAN_DETAILS[selectedPlan] : null;

  // Handle checkout
  const handleCheckout = async () => {
    if (!user?.id || !isValidPlan) return;

    setIsProcessing(true);
    setError(null);

    try {
      if (!isStripeConfigured) {
        // Demo mode - upgrade directly and redirect to dashboard
        console.log('[Demo] Upgrading to plan:', selectedPlan);
        upgradePlan(selectedPlan);

        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 500));

        navigate('/dashboard?upgraded=true');
      } else {
        // Production - create Stripe checkout session
        const result = await stripeService.createCheckoutSession(
          user.id,
          selectedPlan,
          `${window.location.origin}/dashboard?success=true`,
          `${window.location.origin}/checkout?plan=${selectedPlan}&canceled=true`
        );

        if (result.success && result.url) {
          // Redirect to Stripe Checkout
          window.location.href = result.url;
        } else {
          setError(result.error || 'Failed to create checkout session');
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while checking auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Redirecting to sign up...</p>
        </div>
      </div>
    );
  }

  // Show error for invalid plan
  if (!isValidPlan || !planDetails) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Plan</h1>
          <p className="text-slate-400 mb-6">
            The selected plan is not valid. Please choose a plan from our pricing page.
          </p>
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const isCurrentPlan = selectedPlan === currentPlan;
  const isDowngrade = !stripeService.isUpgrade(currentPlan, selectedPlan);

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
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Canceled Message */}
        {searchParams.get('canceled') === 'true' && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-amber-400 font-medium">Checkout Canceled</h3>
                <p className="text-amber-300/80 text-sm mt-1">
                  Your checkout was canceled. You can try again or choose a different plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-400 font-medium">Checkout Error</h3>
                <p className="text-red-300/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Details */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
            <p className="text-slate-400 mb-8">
              Complete your upgrade to start creating more quotes
            </p>

            <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{planDetails.name}</h2>
                    {selectedPlan === 'pro' && (
                      <Badge variant="info">Most Popular</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {planDetails.price === 0 ? 'Free' : `$${planDetails.price}`}
                    </span>
                    {planDetails.price > 0 && (
                      <span className="text-slate-400">/month</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 mb-1">Quotes per month</p>
                  <p className="text-xl font-bold text-teal-400">
                    {planDetails.quotesPerMonth === 'unlimited' ? 'Unlimited' : planDetails.quotesPerMonth}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {planDetails.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Current Plan Notice */}
              {subscription && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Your current plan:</span>
                    <Badge variant={currentPlan === 'free' ? 'default' : 'teal'}>
                      {PLAN_DETAILS[currentPlan].name}
                    </Badge>
                  </div>
                  {isCurrentPlan && (
                    <p className="text-amber-400 text-sm mt-2">
                      You're already on this plan
                    </p>
                  )}
                  {isDowngrade && !isCurrentPlan && (
                    <p className="text-amber-400 text-sm mt-2">
                      This is a downgrade from your current plan
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* Back to Pricing */}
            <div className="mt-6">
              <Link to="/plans" className="text-sm text-teal-400 hover:text-teal-300 inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                View all plans
              </Link>
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div>
            <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-6">Order Summary</h2>

              {/* Billing Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-white font-medium">{planDetails.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Billing cycle</span>
                  <span className="text-white font-medium">Monthly</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Quotes per month</span>
                  <span className="text-white font-medium">
                    {planDetails.quotesPerMonth === 'unlimited' ? 'Unlimited' : planDetails.quotesPerMonth}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-slate-700 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-300 font-medium">Total due today</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white">
                      ${planDetails.price}
                    </span>
                    <span className="text-slate-400 text-sm ml-1">/month</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Billed monthly. Cancel anytime.
                </p>
              </div>

              {/* FTC-Compliant Billing Disclosure & Consent */}
              {planDetails.price > 0 && (
                <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  {/* Disclosure Text */}
                  <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                    By clicking 'Upgrade Now', you authorize QuoteMyAV to charge your payment method ${planDetails.price}/month until you cancel. Your subscription will automatically renew monthly.
                  </p>

                  {/* Consent Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group mb-3">
                    <input
                      type="checkbox"
                      checked={hasAgreedToTerms}
                      onChange={(e) => setHasAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                      I agree to the{' '}
                      <Link to="/terms" className="text-teal-400 hover:text-teal-300 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-teal-400 hover:text-teal-300 underline">
                        Privacy Policy
                      </Link>{' '}
                      and authorize recurring charges
                    </span>
                  </label>

                  {/* Cancellation Info */}
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cancel anytime from Settings → Billing. No penalties or hidden fees.
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={isProcessing || isCurrentPlan || (planDetails.price > 0 && !hasAgreedToTerms)}
                isLoading={isProcessing}
              >
                {isProcessing ? (
                  'Processing...'
                ) : isCurrentPlan ? (
                  'Current Plan'
                ) : !isStripeConfigured ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Upgrade Now (Demo)
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Continue to Payment
                  </>
                )}
              </Button>

              {!isStripeConfigured && (
                <p className="text-xs text-slate-500 mt-3 text-center">
                  Demo mode: Your plan will be upgraded immediately
                </p>
              )}

              {/* Security Notice */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Secure Checkout</h4>
                    <p className="text-xs text-slate-400">
                      Your payment information is encrypted and secure. Powered by Stripe.
                    </p>
                  </div>
                </div>
              </div>

              {/* Money Back Guarantee */}
              <div className="mt-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">30-Day Money Back</h4>
                  <p className="text-xs text-slate-400">
                    Not satisfied? Get a full refund within 30 days, no questions asked.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
