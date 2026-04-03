import { supabase } from '@/lib/supabase';
import { LoyaltyCard, LoyaltyPlan } from '@/types/database';

export const loyaltyService = {
  async getUserLoyaltyCard(userId: string): Promise<LoyaltyCard | null> {
    const { data, error } = await supabase
      .from('loyalty_cards')
      .select('*, loyalty_plans(*)')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getLoyaltyPlans(): Promise<LoyaltyPlan[]> {
    const { data, error } = await supabase
      .from('loyalty_plans')
      .select('*')
      .eq('active', true)
      .order('required_washes', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addWash(userId: string, employeeId: string, notes?: string) {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/add-wash`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ userId, employeeId, notes }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add wash');
    }

    return response.json();
  },

  async redeemReward(userId: string, employeeId: string, notes?: string) {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/redeem-reward`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ userId, employeeId, notes }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to redeem reward');
    }

    return response.json();
  },

  subscribeLoyaltyCard(userId: string, callback: (card: LoyaltyCard | null) => void) {
    const channel = supabase
      .channel('loyalty-card-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_cards',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const card = await this.getUserLoyaltyCard(userId);
          callback(card);
        }
      )
      .subscribe();

    return channel;
  },
};
