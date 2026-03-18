-- Add referrer_user_id, referrer_organization_id, and converted_at to the referrals table.
-- The signup route needs these columns to grant credit rewards on referral conversion.

ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS referrer_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referrer_organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS converted_at timestamptz;

-- Back-fill referrer_user_id and referrer_organization_id from the existing referrer_id
-- referrer_id maps to users.id
UPDATE public.referrals r
SET referrer_user_id = r.referrer_id
WHERE referrer_user_id IS NULL;

-- Back-fill referrer_organization_id via organization_members (current_organization_id on users)
UPDATE public.referrals r
SET referrer_organization_id = u.current_organization_id
FROM public.users u
WHERE u.id = r.referrer_id
  AND r.referrer_organization_id IS NULL
  AND u.current_organization_id IS NOT NULL;
