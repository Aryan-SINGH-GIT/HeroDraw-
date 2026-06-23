-- =============================================================================
-- Digital Hero - Row Level Security Policies
-- =============================================================================
-- Run AFTER schema.sql. Enables RLS on every public table and defines
-- granular access for subscribers, admins, and the service role.
-- =============================================================================

-- =============================================================================
-- Helper: Check if current user is an admin
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- =============================================================================
-- PROFILES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can insert profiles (trigger runs as SECURITY DEFINER)
-- No explicit INSERT policy needed for regular users — the trigger handles it.

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all subscriptions
CREATE POLICY "subscriptions_select_admin"
  ON public.subscriptions
  FOR SELECT
  USING (public.is_admin());

-- Service role (Stripe webhooks) can insert subscriptions
-- The service role bypasses RLS, so no INSERT policy is needed for webhooks.
-- However, we add an admin policy for manual operations.
CREATE POLICY "subscriptions_insert_admin"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Service role can update subscriptions (webhook-driven)
CREATE POLICY "subscriptions_update_admin"
  ON public.subscriptions
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- SCORES
-- =============================================================================

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Users can read their own scores
CREATE POLICY "scores_select_own"
  ON public.scores
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all scores
CREATE POLICY "scores_select_admin"
  ON public.scores
  FOR SELECT
  USING (public.is_admin());

-- Users can insert their own scores
CREATE POLICY "scores_insert_own"
  ON public.scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scores
CREATE POLICY "scores_update_own"
  ON public.scores
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scores
CREATE POLICY "scores_delete_own"
  ON public.scores
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- CHARITIES
-- =============================================================================

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read active charities
CREATE POLICY "charities_select_active"
  ON public.charities
  FOR SELECT
  USING (is_active = true);

-- Admins can read all charities (including inactive)
CREATE POLICY "charities_select_admin"
  ON public.charities
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert charities
CREATE POLICY "charities_insert_admin"
  ON public.charities
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update charities
CREATE POLICY "charities_update_admin"
  ON public.charities
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete charities
CREATE POLICY "charities_delete_admin"
  ON public.charities
  FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- DRAWS
-- =============================================================================

ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

-- Anyone can read published draws
CREATE POLICY "draws_select_published"
  ON public.draws
  FOR SELECT
  USING (status = 'published');

-- Admins can read all draws (including simulated)
CREATE POLICY "draws_select_admin"
  ON public.draws
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert draws
CREATE POLICY "draws_insert_admin"
  ON public.draws
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update draws
CREATE POLICY "draws_update_admin"
  ON public.draws
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete draws
CREATE POLICY "draws_delete_admin"
  ON public.draws
  FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- WINNERS
-- =============================================================================

ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Users can read their own winner records
CREATE POLICY "winners_select_own"
  ON public.winners
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all winner records
CREATE POLICY "winners_select_admin"
  ON public.winners
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert winner records
CREATE POLICY "winners_insert_admin"
  ON public.winners
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update winner records (verification, payment status)
CREATE POLICY "winners_update_admin"
  ON public.winners
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete winner records
CREATE POLICY "winners_delete_admin"
  ON public.winners
  FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- CHARITY CONTRIBUTIONS
-- =============================================================================

ALTER TABLE public.charity_contributions ENABLE ROW LEVEL SECURITY;

-- Users can read their own contributions
CREATE POLICY "contributions_select_own"
  ON public.charity_contributions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all contributions
CREATE POLICY "contributions_select_admin"
  ON public.charity_contributions
  FOR SELECT
  USING (public.is_admin());

-- Service role inserts contributions (via webhook). Admin fallback policy:
CREATE POLICY "contributions_insert_admin"
  ON public.charity_contributions
  FOR INSERT
  WITH CHECK (public.is_admin());

-- =============================================================================
-- STORAGE: winner-proofs bucket policies
-- =============================================================================

-- Users can upload proof files to their own folder: winner-proofs/{user_id}/*
CREATE POLICY "winner_proofs_upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'winner-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own proof files
CREATE POLICY "winner_proofs_select_own"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'winner-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can view all proof files
CREATE POLICY "winner_proofs_select_admin"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'winner-proofs'
    AND public.is_admin()
  );

-- Users can update (overwrite) their own proof files
CREATE POLICY "winner_proofs_update_own"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'winner-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'winner-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own proof files
CREATE POLICY "winner_proofs_delete_own"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'winner-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can delete any proof files
CREATE POLICY "winner_proofs_delete_admin"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'winner-proofs'
    AND public.is_admin()
  );
