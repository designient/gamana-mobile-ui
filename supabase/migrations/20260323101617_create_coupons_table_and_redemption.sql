/*
  # Create coupons table and redemption function

  1. New Tables
    - `coupons` - Promotional coupon codes that grant coins
      - `id` (uuid, primary key)
      - `code` (text, unique, case-insensitive) - The code users type in
      - `coin_value` (integer) - Number of coins awarded on redemption
      - `max_uses` (integer) - Maximum total redemptions allowed (0 = unlimited)
      - `current_uses` (integer) - How many times this coupon has been redeemed
      - `expires_at` (timestamptz, nullable) - When the coupon stops being valid
      - `is_active` (boolean) - Admin can disable a coupon
      - `description` (text) - Internal note for the coupon
      - `created_at` (timestamptz)

    - `coupon_redemptions` - Tracks which user redeemed which coupon
      - `id` (uuid, primary key)
      - `coupon_id` (uuid, references coupons)
      - `user_id` (text, references user_profiles)
      - `created_at` (timestamptz)
      - Unique constraint on (coupon_id, user_id) so each user can only redeem once

  2. New Function
    - `redeem_coupon(p_code text, p_user_id text)` - Atomic coupon redemption
      - Validates the coupon exists, is active, not expired, not over max uses
      - Checks user hasn't already redeemed this coupon
      - Increments current_uses on the coupon
      - Creates a coupon_redemptions record
      - Credits the user's coin_balance
      - Creates a coin_transaction record with type 'coupon_redeem'
      - Returns JSON with success status and new balance

  3. Security
    - RLS enabled on both tables
    - Coupons table is read-only for authenticated/anon (only checks existence)
    - Coupon redemptions: users can only see their own redemptions

  4. Seed Data
    - GAMANA50: 50 coins, unlimited uses, no expiry (welcome promo)
    - HERITAGE25: 25 coins, 100 max uses, no expiry (heritage walk promo)
    - BENGALURU100: 100 coins, 50 max uses, no expiry (city launch promo)

  5. Notes
    - Code comparison is case-insensitive via upper()
    - The redeem function is atomic - no partial state on failure
    - Each user can only redeem each coupon once
*/

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  coin_value integer NOT NULL CHECK (coin_value > 0),
  max_uses integer NOT NULL DEFAULT 0,
  current_uses integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coupons_code_unique UNIQUE (code)
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check coupon existence"
  ON coupons FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES coupons(id),
  user_id text NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_coupon UNIQUE (coupon_id, user_id)
);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own redemptions"
  ON coupon_redemptions FOR SELECT
  TO authenticated, anon
  USING (user_id = coalesce(auth.uid()::text, 'anonymous'));

CREATE POLICY "Users can insert own redemptions"
  ON coupon_redemptions FOR INSERT
  TO authenticated, anon
  WITH CHECK (user_id = coalesce(auth.uid()::text, 'anonymous'));

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(upper(code));
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON coupon_redemptions(user_id);

CREATE OR REPLACE FUNCTION redeem_coupon(p_code text, p_user_id text)
RETURNS json AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_already_redeemed boolean;
  v_new_balance integer;
BEGIN
  SELECT * INTO v_coupon
  FROM coupons
  WHERE upper(code) = upper(p_code)
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid coupon code');
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'This coupon has expired');
  END IF;

  IF v_coupon.max_uses > 0 AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN json_build_object('success', false, 'error', 'This coupon has reached its redemption limit');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM coupon_redemptions
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id
  ) INTO v_already_redeemed;

  IF v_already_redeemed THEN
    RETURN json_build_object('success', false, 'error', 'You have already redeemed this coupon');
  END IF;

  UPDATE coupons SET current_uses = current_uses + 1
  WHERE id = v_coupon.id;

  INSERT INTO coupon_redemptions (coupon_id, user_id)
  VALUES (v_coupon.id, p_user_id);

  UPDATE user_profiles
  SET coin_balance = coin_balance + v_coupon.coin_value
  WHERE id = p_user_id
  RETURNING coin_balance INTO v_new_balance;

  INSERT INTO coin_transactions (user_id, amount, transaction_type, reference_id, description)
  VALUES (
    p_user_id,
    v_coupon.coin_value,
    'coupon_redeem',
    v_coupon.id::text,
    'Coupon: ' || v_coupon.code || ' (+' || v_coupon.coin_value || ' coins)'
  );

  RETURN json_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'coins_awarded', v_coupon.coin_value,
    'coupon_code', v_coupon.code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

INSERT INTO coupons (code, coin_value, max_uses, description)
VALUES
  ('GAMANA50', 50, 0, 'Welcome promo - 50 free coins'),
  ('HERITAGE25', 25, 100, 'Heritage walk promo - 25 coins'),
  ('BENGALURU100', 100, 50, 'Bengaluru city launch - 100 coins')
ON CONFLICT (code) DO NOTHING;
