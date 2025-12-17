import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui';
import { ProfilePictureUpload } from '../components/profile/ProfilePictureUpload';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { stripeService, isStripeConfigured } from '../services/stripe';
import { profileService } from '../services/profile';
import { PLAN_DETAILS } from '../types';
import type { SubscriptionPlan } from '../types';

export function Settings() {
  const navigate = useNavigate();
  const { user, updateProfilePicture } = useAuthStore();
  const {
    subscription,
    initialize,
    getQuotaUsage,
    upgradePlan,
    isAtLimit,
  } = useSubscriptionStore();
  const [searchParams] = useSearchParams();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Initialize subscription when user is available
  useEffect(() => {
    if (user?.id) {
      initialize(user.id);
    }
  }, [user?.id, initialize]);

  // Handle demo upgrade from URL params
  useEffect(() => {
    const demoUpgrade = searchParams.get('demo_upgrade');
    if (demoUpgrade && ['starter', 'pro', 'enterprise'].includes(demoUpgrade)) {
      upgradePlan(demoUpgrade as SubscriptionPlan);
    }
  }, [searchParams, upgradePlan]);

  const usage = getQuotaUsage();
  const currentPlan = subscription?.plan || 'free';
  const planDetails = PLAN_DETAILS[currentPlan];

  // Handle plan change (upgrade or downgrade)
  const handlePlanChange = async (plan: SubscriptionPlan) => {
    if (!user?.id) return;
    if (plan === currentPlan) return;

    const isDowngrade = !stripeService.isUpgrade(currentPlan, plan);

    // Confirm downgrade
    if (isDowngrade) {
      const targetDetails = PLAN_DETAILS[plan];
      const confirmed = confirm(
        `Are you sure you want to ${plan === 'free' ? 'cancel your subscription' : `downgrade to ${targetDetails.name}`}?\n\n` +
        `${plan === 'free'
          ? 'You will lose access to premium features and your quote limit will be reduced to 3/month.'
          : `Your quote limit will be reduced to ${targetDetails.quotesPerMonth}/month.`}\n\n` +
        `This change will take effect at the end of your current billing period.`
      );
      if (!confirmed) return;
    }

    setIsUpgrading(true);
    try {
      // For upgrades, always redirect to checkout page for confirmation
      if (!isDowngrade) {
        navigate(`/checkout?plan=${plan}`);
        return;
      }

      // For downgrades in production, go through Stripe
      if (isStripeConfigured) {
        const result = await stripeService.createCheckoutSession(
          user.id,
          plan,
          `${window.location.origin}/settings?success=true`,
          `${window.location.origin}/settings?canceled=true`
        );

        if (result.success && result.url) {
          window.location.href = result.url;
        }
      } else {
        // Demo mode downgrade - apply directly (already confirmed above)
        upgradePlan(plan);
      }
    } catch (err) {
      console.error('Plan change error:', err);
    } finally {
      setIsUpgrading(false);
    }
  };

  // Handle manage billing
  const handleManageBilling = async () => {
    if (!subscription?.stripeCustomerId) {
      // Demo mode or no customer ID
      console.log('No Stripe customer ID - demo mode');
      return;
    }

    const result = await stripeService.createBillingPortalSession(
      subscription.stripeCustomerId,
      window.location.href
    );

    if (result.success && result.url) {
      window.location.href = result.url;
    }
  };

  // Check if API is available (not in demo mode)
  const isApiAvailable = Boolean(import.meta.env.VITE_API_URL);

  // Handle profile picture upload
  const handleProfilePictureUpload = async (file: File) => {
    try {
      // In demo mode, use data URL (stored locally)
      if (!isApiAvailable) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        updateProfilePicture(dataUrl);
        return;
      }

      // Production mode: upload to S3
      const imageUrl = await profileService.uploadProfilePicture(file);
      updateProfilePicture(imageUrl);
    } catch (err) {
      console.error('Profile picture upload error:', err);
      throw err;
    }
  };

  // Handle profile picture removal
  const handleProfilePictureRemove = async () => {
    try {
      // In demo mode, just clear locally
      if (!isApiAvailable) {
        updateProfilePicture('');
        return;
      }

      // Production mode: update backend
      await profileService.removeProfilePicture();
      updateProfilePicture('');
    } catch (err) {
      console.error('Profile picture remove error:', err);
      throw err;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Profile Picture Section */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Profile Picture</h2>
        <ProfilePictureUpload
          currentImageUrl={user?.profilePictureUrl}
          userName={user?.fullName || 'User'}
          onUpload={handleProfilePictureUpload}
          onRemove={user?.profilePictureUrl ? handleProfilePictureRemove : undefined}
        />
      </Card>

      {/* Account Section */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <p className="text-white">{user?.fullName || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <p className="text-white">{user?.email || 'Not set'}</p>
          </div>
          {user?.company && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Company</label>
              <p className="text-white">{user.company}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Billing Section */}
      <Card className="mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Billing</h2>
            <p className="text-sm text-slate-400">Manage your subscription and billing</p>
          </div>
          <Badge variant={currentPlan === 'free' ? 'default' : 'teal'}>
            {planDetails.name} Plan
          </Badge>
        </div>

        {/* Current Usage */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Quotes this month</span>
            <span className="text-sm font-mono text-white">
              {usage.used} / {usage.limit === Infinity ? 'Unlimited' : usage.limit}
            </span>
          </div>
          {usage.limit !== Infinity && (
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  usage.percentage >= 90 ? 'bg-red-500' :
                  usage.percentage >= 75 ? 'bg-amber-500' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(usage.percentage, 100)}%` }}
              />
            </div>
          )}
          {isAtLimit() && (
            <p className="text-sm text-red-400 mt-2">
              You've reached your monthly limit. Upgrade to continue creating quotes.
            </p>
          )}
        </div>

        {/* Plan Features */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Your plan includes:</h3>
          <ul className="space-y-1">
            {planDetails.features.map((feature, i) => (
              <li key={i} className="flex items-center text-sm text-slate-400">
                <svg className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Billing Period */}
        {subscription && (
          <div className="text-sm text-slate-400 mb-6">
            <p>
              Current period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Manage Billing Button */}
        {currentPlan !== 'free' && subscription?.stripeCustomerId && (
          <Button variant="secondary" onClick={handleManageBilling}>
            Manage Billing
          </Button>
        )}
      </Card>

      {/* All Plans */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['free', 'starter', 'pro', 'enterprise'] as SubscriptionPlan[]).map((plan) => {
            const details = PLAN_DETAILS[plan];
            const isCurrent = plan === currentPlan;
            const isUpgrade = stripeService.isUpgrade(currentPlan, plan);
            const isDowngrade = !isCurrent && !isUpgrade;

            return (
              <div
                key={plan}
                className={`p-4 rounded-lg border relative ${
                  isCurrent
                    ? 'border-teal-500 bg-teal-500/10 ring-2 ring-teal-500/30'
                    : plan === 'pro'
                    ? 'border-teal-500/50 bg-slate-800/50'
                    : 'border-slate-600 bg-slate-800/50'
                }`}
              >
                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute -top-2 left-4">
                    <Badge variant="teal">Current</Badge>
                  </div>
                )}

                {/* Popular Badge */}
                {plan === 'pro' && !isCurrent && (
                  <div className="absolute -top-2 right-4">
                    <Badge variant="info">Popular</Badge>
                  </div>
                )}

                <div className="pt-2">
                  <h3 className="font-semibold text-white mb-1">{details.name}</h3>
                  <p className="text-2xl font-bold text-white mb-1">
                    {details.price === 0 ? (
                      'Free'
                    ) : (
                      <>
                        ${details.price}
                        <span className="text-sm font-normal text-slate-400">/mo</span>
                      </>
                    )}
                  </p>
                  <p className="text-sm text-slate-400 mb-4">
                    {details.quotesPerMonth === 'unlimited'
                      ? 'Unlimited quotes'
                      : `${details.quotesPerMonth} quotes/month`}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1 mb-4 text-xs">
                    {details.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start text-slate-400">
                        <svg className="w-3 h-3 text-teal-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  {isCurrent ? (
                    <Button variant="ghost" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      variant={plan === 'pro' ? 'primary' : 'secondary'}
                      className="w-full"
                      onClick={() => handlePlanChange(plan)}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? 'Processing...' : 'Upgrade'}
                    </Button>
                  ) : isDowngrade ? (
                    <Button
                      variant="ghost"
                      className="w-full text-slate-400 hover:text-white"
                      onClick={() => handlePlanChange(plan)}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? 'Processing...' : plan === 'free' ? 'Cancel Plan' : 'Downgrade'}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        {!isStripeConfigured && (
          <p className="text-xs text-slate-500 mt-4 text-center">
            Demo mode: Plan changes are simulated. Configure Stripe for real payments.
          </p>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="mt-6 border-red-500/30">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
        <p className="text-sm text-slate-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
          Delete Account
        </Button>
      </Card>
    </div>
  );
}
