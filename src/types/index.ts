export type Role = 'subscriber' | 'admin';
export type PlanType = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
export type DrawType = 'random' | 'algorithmic';
export type DrawStatus = 'simulated' | 'published';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'paid';
export type ContributionType = 'subscription' | 'donation';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  charity_id: string | null;
  charity_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_type: PlanType | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  played_date: string;
  created_at: string;
  updated_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Draw {
  id: string;
  draw_date: string;
  draw_month: string;
  numbers: number[];
  draw_type: DrawType;
  status: DrawStatus;
  total_pool: number;
  jackpot_pool: number;
  four_match_pool: number;
  three_match_pool: number;
  accumulated_jackpot: number;
  created_at: string;
  published_at: string | null;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_count: 3 | 4 | 5;
  matched_numbers: number[];
  prize_amount: number;
  proof_url: string | null;
  verification_status: VerificationStatus;
  payment_status: PaymentStatus;
  created_at: string;
  verified_at: string | null;
}

export interface CharityContribution {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  subscription_id: string | null;
  contribution_type: ContributionType;
  created_at: string;
}
