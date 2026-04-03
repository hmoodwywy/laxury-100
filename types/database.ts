export type UserRole = 'customer' | 'employee' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'suspended';
export type ActionType = 'wash_added' | 'reward_redeemed';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyPlan {
  id: string;
  name: string;
  required_washes: number;
  reward: string;
  active: boolean;
  created_at: string;
}

export interface LoyaltyCard {
  id: string;
  user_id: string;
  plan_id: string;
  current_washes: number;
  reward_available: boolean;
  completed: boolean;
  created_at: string;
  updated_at: string;
  loyalty_plans?: LoyaltyPlan;
}

export interface WashLog {
  id: string;
  user_id: string;
  employee_id: string;
  action: ActionType;
  card_id?: string;
  notes?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'cancelled';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}
