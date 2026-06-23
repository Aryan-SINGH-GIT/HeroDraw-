-- =============================================================================
-- Digital Hero - Seed Data
-- =============================================================================
-- Run AFTER schema.sql and rls_policies.sql
-- Seeds the database with sample charities and an admin profile.
--
-- NOTE: The admin profile references a fixed UUID. You must create a
-- matching auth.users entry in Supabase Auth (via dashboard or CLI)
-- with this same ID, or update the UUID below to match your admin user.
-- =============================================================================

-- =============================================================================
-- CHARITIES
-- =============================================================================

INSERT INTO public.charities (id, name, description, image_url, website_url, is_featured, is_active)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-100000000001',
    'Akshaya Patra Foundation',
    'Operates one of the largest mid-day meal programmes in the world, serving freshly cooked meals to over 2 million school children daily across India. Every meal keeps a child in school.',
    '/images/charities/akshaya-patra.jpg',
    'https://www.akshayapatra.org',
    true,
    true
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-100000000002',
    'Goonj',
    'Transforms urban surplus into rural development resources. Works across 28 states to channel clothing, household materials, and disaster relief to underserved communities while preserving dignity.',
    '/images/charities/goonj.jpg',
    'https://goonj.org',
    true,
    true
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-100000000003',
    'Pratham Education Foundation',
    'India''s largest non-governmental education organisation. Reaches millions of children through innovative learning programmes, remedial tutoring, and community-based interventions in rural and urban areas.',
    '/images/charities/pratham.jpg',
    'https://www.pratham.org',
    true,
    true
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-100000000004',
    'Smile Foundation',
    'Empowers underprivileged children, youth, and women through education, healthcare, livelihood, and women empowerment programmes. Operates in over 2,000 remote villages and urban slums across 25 states.',
    '/images/charities/smile-foundation.jpg',
    'https://www.smilefoundationindia.org',
    false,
    true
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-100000000005',
    'Wildlife Trust of India',
    'Conserves wildlife and its habitats across the Indian subcontinent. Runs rescue operations, anti-poaching patrols, and habitat restoration projects for endangered species including tigers and elephants.',
    '/images/charities/wildlife-trust.jpg',
    'https://www.wti.org.in',
    false,
    true
  )
ON CONFLICT (id) DO NOTHING;


