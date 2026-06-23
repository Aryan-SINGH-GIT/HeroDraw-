-- =============================================================================
-- Digital Hero - Complete Database Schema
-- =============================================================================
-- Golf subscription platform with charity integration
-- Run this migration against your Supabase project
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CHARITIES TABLE
-- Must be created before profiles (FK dependency)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.charities IS 'Registered charities that receive a percentage of subscription revenue.';

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  charity_percentage INTEGER NOT NULL DEFAULT 10 CHECK (charity_percentage >= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profiles linked 1:1 with auth.users. Every authenticated user gets a profile row.';
COMMENT ON COLUMN public.profiles.charity_percentage IS 'Percentage of subscription fee directed to the chosen charity. Minimum 10%.';

-- =============================================================================
-- SUBSCRIPTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'Stripe subscription records. Managed by webhooks — never written directly by client.';

-- =============================================================================
-- SCORES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, played_date)
);

COMMENT ON TABLE public.scores IS 'Daily golf scores submitted by subscribers. One score per user per day.';
COMMENT ON COLUMN public.scores.score IS 'Golf score number between 1 and 45. Used as lottery entry for draws.';

-- =============================================================================
-- DRAWS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_date DATE NOT NULL,
  draw_month TEXT NOT NULL,
  numbers INTEGER[] NOT NULL DEFAULT '{}',
  draw_type TEXT NOT NULL DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  status TEXT NOT NULL DEFAULT 'simulated' CHECK (status IN ('simulated', 'published')),
  total_pool DECIMAL(12, 2) NOT NULL DEFAULT 0,
  jackpot_pool DECIMAL(12, 2) NOT NULL DEFAULT 0,
  four_match_pool DECIMAL(12, 2) NOT NULL DEFAULT 0,
  three_match_pool DECIMAL(12, 2) NOT NULL DEFAULT 0,
  accumulated_jackpot DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

COMMENT ON TABLE public.draws IS 'Monthly lottery draws. Numbers are drawn from the pool of submitted scores.';
COMMENT ON COLUMN public.draws.draw_month IS 'Human-readable month identifier, e.g. "June 2026".';
COMMENT ON COLUMN public.draws.accumulated_jackpot IS 'Rolled-over jackpot from previous draws with no 5-match winner.';

-- =============================================================================
-- WINNERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_count INTEGER NOT NULL CHECK (match_count IN (3, 4, 5)),
  matched_numbers INTEGER[] NOT NULL DEFAULT '{}',
  prize_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  proof_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ
);

COMMENT ON TABLE public.winners IS 'Draw winners with verification workflow. Proof uploads required before payout.';

-- =============================================================================
-- CHARITY CONTRIBUTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.charity_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE RESTRICT,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  contribution_type TEXT NOT NULL DEFAULT 'subscription' CHECK (contribution_type IN ('subscription', 'donation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.charity_contributions IS 'Ledger of all charity contributions — auto-created from subscription payments.';

-- =============================================================================
-- TRIGGER: Auto-create profile on auth.users insert
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if present, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TRIGGER: Auto-update updated_at on row modification
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all tables that have the column
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.subscriptions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.scores;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.charities;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.charities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_charity_id ON public.profiles(charity_id);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Scores
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_played_date ON public.scores(played_date);
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON public.scores(user_id, played_date);

-- Draws
CREATE INDEX IF NOT EXISTS idx_draws_draw_date ON public.draws(draw_date);
CREATE INDEX IF NOT EXISTS idx_draws_status ON public.draws(status);
CREATE INDEX IF NOT EXISTS idx_draws_draw_month ON public.draws(draw_month);

-- Winners
CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON public.winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON public.winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_verification_status ON public.winners(verification_status);
CREATE INDEX IF NOT EXISTS idx_winners_payment_status ON public.winners(payment_status);

-- Charity Contributions
CREATE INDEX IF NOT EXISTS idx_charity_contributions_user_id ON public.charity_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_charity_id ON public.charity_contributions(charity_id);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_subscription_id ON public.charity_contributions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_type ON public.charity_contributions(contribution_type);

-- =============================================================================
-- STORAGE BUCKET: Winner proof uploads
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('winner-proofs', 'winner-proofs', false)
ON CONFLICT (id) DO NOTHING;
