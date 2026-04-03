import { supabase } from '@/lib/supabase';
import { Subscription } from '@/types/database';

export const subscriptionService = {
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async manageSubscription(
    userId: string,
    action: 'activate' | 'deactivate' | 'cancel',
    endDate?: string
  ) {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/manage-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ userId, action, endDate }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to manage subscription');
    }

    return response.json();
  },

  subscribeToSubscription(userId: string, callback: (subscription: Subscription | null) => void) {
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const subscription = await this.getUserSubscription(userId);
          callback(subscription);
        }
      )
      .subscribe();

    return channel;
  },
};
