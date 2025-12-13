import { create } from 'zustand';
import type { Subscription, SubscriptionPlan } from '../types';
import { PLAN_DETAILS } from '../types';

const STORAGE_KEY = 'quotemyav_subscription';

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;

  // Computed helpers
  canCreateQuote: () => boolean;
  getQuotaUsage: () => { used: number; limit: number; percentage: number };
  getRemainingQuotes: () => number | 'unlimited';
  isAtLimit: () => boolean;

  // Actions
  initialize: (userId: string) => void;
  incrementUsage: () => void;
  resetUsage: () => void;
  upgradePlan: (plan: SubscriptionPlan) => void;
  loadFromStorage: () => void;
}

// Get the start of the current billing period (1st of current month)
const getCurrentPeriodStart = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

// Get the end of the current billing period (1st of next month)
const getCurrentPeriodEnd = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
};

// Get the quota limit for a plan
const getQuotaLimit = (plan: SubscriptionPlan): number => {
  const details = PLAN_DETAILS[plan];
  return details.quotesPerMonth === 'unlimited' ? Infinity : details.quotesPerMonth;
};

// Check if we need to reset usage (new billing period)
const shouldResetUsage = (subscription: Subscription): boolean => {
  const periodEnd = new Date(subscription.currentPeriodEnd);
  return new Date() >= periodEnd;
};

// Create default subscription for a user
const createDefaultSubscription = (userId: string): Subscription => ({
  id: `sub_${Date.now()}`,
  userId,
  plan: 'free',
  quotesUsed: 0,
  quotesLimit: 3,
  currentPeriodStart: getCurrentPeriodStart(),
  currentPeriodEnd: getCurrentPeriodEnd(),
  createdAt: new Date().toISOString(),
});

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  isLoading: false,
  error: null,

  canCreateQuote: () => {
    const { subscription } = get();
    if (!subscription) return false;

    const details = PLAN_DETAILS[subscription.plan];
    if (details.quotesPerMonth === 'unlimited') return true;

    return subscription.quotesUsed < subscription.quotesLimit;
  },

  getQuotaUsage: () => {
    const { subscription } = get();
    if (!subscription) return { used: 0, limit: 0, percentage: 0 };

    const details = PLAN_DETAILS[subscription.plan];
    if (details.quotesPerMonth === 'unlimited') {
      return { used: subscription.quotesUsed, limit: Infinity, percentage: 0 };
    }

    const percentage = Math.round((subscription.quotesUsed / subscription.quotesLimit) * 100);
    return {
      used: subscription.quotesUsed,
      limit: subscription.quotesLimit,
      percentage: Math.min(percentage, 100),
    };
  },

  getRemainingQuotes: () => {
    const { subscription } = get();
    if (!subscription) return 0;

    const details = PLAN_DETAILS[subscription.plan];
    if (details.quotesPerMonth === 'unlimited') return 'unlimited';

    return Math.max(0, subscription.quotesLimit - subscription.quotesUsed);
  },

  isAtLimit: () => {
    const { subscription } = get();
    if (!subscription) return true;

    const details = PLAN_DETAILS[subscription.plan];
    if (details.quotesPerMonth === 'unlimited') return false;

    return subscription.quotesUsed >= subscription.quotesLimit;
  },

  initialize: (userId: string) => {
    set({ isLoading: true });

    try {
      // Try to load from storage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const subscriptions: Record<string, Subscription> = JSON.parse(stored);
        let userSub = subscriptions[userId];

        if (userSub) {
          // Check if we need to reset usage for new billing period
          if (shouldResetUsage(userSub)) {
            userSub = {
              ...userSub,
              quotesUsed: 0,
              currentPeriodStart: getCurrentPeriodStart(),
              currentPeriodEnd: getCurrentPeriodEnd(),
            };
            subscriptions[userId] = userSub;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
          }

          set({ subscription: userSub, isLoading: false, error: null });
          return;
        }
      }

      // Create new subscription for user
      const newSub = createDefaultSubscription(userId);
      const subscriptions = stored ? JSON.parse(stored) : {};
      subscriptions[userId] = newSub;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));

      set({ subscription: newSub, isLoading: false, error: null });
    } catch (err) {
      console.error('Failed to initialize subscription:', err);
      set({ isLoading: false, error: 'Failed to load subscription' });
    }
  },

  incrementUsage: () => {
    const { subscription } = get();
    if (!subscription) return;

    const updated: Subscription = {
      ...subscription,
      quotesUsed: subscription.quotesUsed + 1,
    };

    // Save to storage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const subscriptions = stored ? JSON.parse(stored) : {};
      subscriptions[subscription.userId] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (err) {
      console.error('Failed to save usage:', err);
    }

    set({ subscription: updated });
  },

  resetUsage: () => {
    const { subscription } = get();
    if (!subscription) return;

    const updated: Subscription = {
      ...subscription,
      quotesUsed: 0,
      currentPeriodStart: getCurrentPeriodStart(),
      currentPeriodEnd: getCurrentPeriodEnd(),
    };

    // Save to storage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const subscriptions = stored ? JSON.parse(stored) : {};
      subscriptions[subscription.userId] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (err) {
      console.error('Failed to reset usage:', err);
    }

    set({ subscription: updated });
  },

  upgradePlan: (plan: SubscriptionPlan) => {
    const { subscription } = get();
    if (!subscription) return;

    const updated: Subscription = {
      ...subscription,
      plan,
      quotesLimit: getQuotaLimit(plan),
      // Reset period on upgrade
      currentPeriodStart: getCurrentPeriodStart(),
      currentPeriodEnd: getCurrentPeriodEnd(),
    };

    // Save to storage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const subscriptions = stored ? JSON.parse(stored) : {};
      subscriptions[subscription.userId] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (err) {
      console.error('Failed to upgrade plan:', err);
    }

    set({ subscription: updated });
  },

  loadFromStorage: () => {
    // This is a no-op now since initialize handles loading
    // Kept for API consistency
  },
}));
