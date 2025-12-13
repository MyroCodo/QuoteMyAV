import type { SubscriptionPlan } from '../types';
import { PLAN_DETAILS } from '../types';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const isStripeConfigured = Boolean(stripePublishableKey);

if (!isStripeConfigured) {
  console.warn('Stripe credentials not configured. Running in demo mode.');
}

// Stripe price IDs (from your Stripe dashboard)
const PRICE_IDS: Record<SubscriptionPlan, string | null> = {
  free: null,
  starter: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || 'price_starter_monthly',
  pro: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  enterprise: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
};

interface CheckoutResult {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

interface PortalResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const stripeService = {
  /**
   * Create a checkout session for upgrading to a paid plan
   */
  async createCheckoutSession(
    userId: string,
    plan: SubscriptionPlan,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutResult> {
    if (!isStripeConfigured) {
      // Demo mode - simulate upgrade
      console.log('[Demo] Creating checkout session for plan:', plan);
      return {
        success: true,
        sessionId: `demo_session_${Date.now()}`,
        url: `/settings?demo_upgrade=${plan}`,
      };
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return { success: false, error: 'Invalid plan selected' };
    }

    try {
      // In production, this would call your backend API which creates the Stripe session
      // For now, we'll use a webhook URL pattern
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL?.replace('/quote', '/stripe-checkout');

      if (!webhookUrl) {
        return { success: false, error: 'Stripe webhook not configured' };
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          priceId,
          plan,
          successUrl,
          cancelUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      return {
        success: true,
        sessionId: data.sessionId,
        url: data.url,
      };
    } catch (err) {
      console.error('Checkout session error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create checkout',
      };
    }
  },

  /**
   * Create a billing portal session for managing subscription
   */
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<PortalResult> {
    if (!isStripeConfigured) {
      // Demo mode
      console.log('[Demo] Creating billing portal session');
      return {
        success: true,
        url: `/settings?demo_portal=true`,
      };
    }

    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL?.replace('/quote', '/stripe-portal');

      if (!webhookUrl) {
        return { success: false, error: 'Stripe webhook not configured' };
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          returnUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();
      return {
        success: true,
        url: data.url,
      };
    } catch (err) {
      console.error('Billing portal error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to open billing portal',
      };
    }
  },

  /**
   * Get plan price display
   */
  getPlanPrice(plan: SubscriptionPlan): string {
    const details = PLAN_DETAILS[plan];
    if (details.price === 0) return 'Free';
    return `$${details.price}/mo`;
  },

  /**
   * Get upgrade URL for a plan
   */
  getUpgradeUrl(plan: SubscriptionPlan): string {
    return `/settings?upgrade=${plan}`;
  },

  /**
   * Check if plan is upgradeable from current
   */
  isUpgrade(currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan): boolean {
    const planOrder: SubscriptionPlan[] = ['free', 'starter', 'pro', 'enterprise'];
    return planOrder.indexOf(targetPlan) > planOrder.indexOf(currentPlan);
  },

  /**
   * Redirect to Stripe Checkout (client-side)
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    if (!isStripeConfigured) {
      console.log('[Demo] Would redirect to checkout:', sessionId);
      return;
    }

    // Dynamically load Stripe.js
    const stripe = await loadStripe();
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
    }
  },
};

// Lazy load Stripe.js only when needed
let stripePromise: Promise<any> | null = null;

async function loadStripe(): Promise<any> {
  if (!stripePublishableKey) return null;

  if (!stripePromise) {
    stripePromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        resolve(window.Stripe?.(stripePublishableKey));
      };
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }

  return stripePromise;
}
