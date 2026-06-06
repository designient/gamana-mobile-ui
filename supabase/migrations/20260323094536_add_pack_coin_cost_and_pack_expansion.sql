/*
  # Add coin pricing to city packs and enable pack story expansion on unlock

  1. Modified Tables
    - `city_packs`
      - Added `coin_cost` (integer, default 10) - the coin price to unlock the full tour pack

  2. Updated Functions
    - `unlock_content` - Now when unlocking a pack, also creates unlock records for each story in that pack
      so they appear as individually unlocked throughout the app

  3. Data Changes
    - Heritage Walk (4 stories): 12 coins
    - Temple Trail (3 stories): 10 coins
    - Garden City (3 stories): 10 coins
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'city_packs' AND column_name = 'coin_cost'
  ) THEN
    ALTER TABLE city_packs ADD COLUMN coin_cost integer NOT NULL DEFAULT 10;
  END IF;
END $$;

UPDATE city_packs SET coin_cost = 12 WHERE id = '00000000-0000-0000-0000-000000000201';
UPDATE city_packs SET coin_cost = 10 WHERE id = '00000000-0000-0000-0000-000000000202';
UPDATE city_packs SET coin_cost = 10 WHERE id = '00000000-0000-0000-0000-000000000203';

CREATE OR REPLACE FUNCTION public.unlock_content(p_user_id text, p_item_type text, p_item_id uuid, p_cost integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_balance integer;
  v_new_balance integer;
  v_existing_id uuid;
  v_story_record RECORD;
BEGIN
  SELECT coin_balance INTO v_balance
  FROM user_profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;

  IF v_balance < p_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_balance', 'balance', v_balance);
  END IF;

  v_new_balance := v_balance - p_cost;

  UPDATE user_profiles
  SET coin_balance = v_new_balance
  WHERE id = p_user_id;

  SELECT id INTO v_existing_id
  FROM unlocked_content
  WHERE user_id = p_user_id AND item_type = p_item_type AND item_id = p_item_id;

  IF v_existing_id IS NOT NULL THEN
    UPDATE unlocked_content
    SET unlocked_at = now(),
        expires_at = now() + interval '30 days',
        coin_cost = p_cost
    WHERE id = v_existing_id;
  ELSE
    INSERT INTO unlocked_content (user_id, item_type, item_id, coin_cost)
    VALUES (p_user_id, p_item_type, p_item_id, p_cost);
  END IF;

  IF p_item_type = 'pack' THEN
    FOR v_story_record IN
      SELECT story_id FROM city_pack_stories WHERE pack_id = p_item_id
    LOOP
      SELECT id INTO v_existing_id
      FROM unlocked_content
      WHERE user_id = p_user_id AND item_type = 'story' AND item_id = v_story_record.story_id;

      IF v_existing_id IS NOT NULL THEN
        UPDATE unlocked_content
        SET unlocked_at = now(),
            expires_at = now() + interval '30 days',
            coin_cost = 0
        WHERE id = v_existing_id;
      ELSE
        INSERT INTO unlocked_content (user_id, item_type, item_id, coin_cost)
        VALUES (p_user_id, 'story', v_story_record.story_id, 0);
      END IF;
    END LOOP;
  END IF;

  INSERT INTO coin_transactions (user_id, amount, transaction_type, reference_id, description)
  VALUES (
    p_user_id,
    -p_cost,
    CASE WHEN p_item_type = 'pack' THEN 'pack_unlock' ELSE 'story_unlock' END,
    p_item_id,
    'Unlocked ' || p_item_type || ' for ' || p_cost || ' coins'
  );

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$function$;
