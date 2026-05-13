-- =============================================
-- REFERRAL SYSTEM
-- =============================================

-- 1. Add referral_code to tenants (unique code each professional gets)
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Generate referral codes for existing tenants that don't have one
UPDATE tenants
SET referral_code = LOWER(
  SUBSTR(MD5(id::text || slug), 1, 8)
)
WHERE referral_code IS NULL;

-- 2. Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  referred_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_name     TEXT,
  referred_email    TEXT,
  rewarded          BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_tenant_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view own referrals"
  ON referrals FOR SELECT
  USING (
    referrer_tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to referrals"
  ON referrals FOR ALL
  USING (true);

-- 3. Update handle_new_user trigger to handle referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role          user_role;
  v_slug          TEXT;
  v_area          TEXT;
  v_tenant_id     UUID;
  v_ref_code      TEXT;
  v_referrer_id   UUID;
  v_new_ref_code  TEXT;
  v_trial_days    INT := 14;
BEGIN
  v_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'CLIENT');

  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email,
    v_role
  );

  IF v_role = 'PROFESSIONAL' THEN
    v_slug := COALESCE(
      new.raw_user_meta_data->>'slug',
      REPLACE(LOWER(COALESCE(new.raw_user_meta_data->>'name', new.email)), ' ', '-')
    );
    v_area     := new.raw_user_meta_data->>'area';
    v_ref_code := new.raw_user_meta_data->>'referral_code';

    -- Check if a valid referral code was provided
    IF v_ref_code IS NOT NULL AND v_ref_code != '' THEN
      SELECT id INTO v_referrer_id
      FROM public.tenants
      WHERE referral_code = v_ref_code
        AND status = 'ACTIVE'
      LIMIT 1;

      -- If referral code is valid, new user gets extra 30 days (14 + 30 = 44 total)
      IF v_referrer_id IS NOT NULL THEN
        v_trial_days := 44;
      END IF;
    END IF;

    -- Generate a unique referral code for the new tenant
    v_new_ref_code := LOWER(SUBSTR(MD5(gen_random_uuid()::text), 1, 8));

    -- Create the tenant with trial
    INSERT INTO public.tenants (slug, name, owner_id, status, plan, trial_ends_at, referral_code)
    VALUES (
      v_slug,
      COALESCE(new.raw_user_meta_data->>'name', new.email),
      new.id,
      'ACTIVE',
      'PRO',
      NOW() + (v_trial_days || ' days')::INTERVAL,
      v_new_ref_code
    )
    RETURNING id INTO v_tenant_id;

    -- Create professional profile
    INSERT INTO public.professional_profiles (tenant_id, areas)
    VALUES (
      v_tenant_id,
      CASE WHEN v_area IS NOT NULL AND v_area != ''
        THEN ARRAY[v_area::engineering_area]
        ELSE '{}'
      END
    );

    -- If referral was valid: create referral record and reward the referrer
    IF v_referrer_id IS NOT NULL THEN
      INSERT INTO public.referrals (referrer_tenant_id, referred_user_id, referred_name, referred_email, rewarded)
      VALUES (
        v_referrer_id,
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', ''),
        new.email,
        TRUE
      );

      -- Extend referrer's trial by 30 days (or extend from now if trial already expired)
      UPDATE public.tenants
      SET trial_ends_at = GREATEST(trial_ends_at, NOW()) + INTERVAL '30 days'
      WHERE id = v_referrer_id;
    END IF;
  END IF;

  RETURN new;
END;
$$;
