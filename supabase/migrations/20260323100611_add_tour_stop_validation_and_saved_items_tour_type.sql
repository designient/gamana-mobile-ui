/*
  # Add tour stop validation and update saved_items

  1. New Function & Trigger
    - `validate_tour_stop_unlock()` - Validates that story stops reference
      stories the tour owner has currently unlocked (not expired)
    - Trigger fires BEFORE INSERT on user_tour_stops
    - Pinned location stops (story_id IS NULL) bypass the check

  2. Modified Tables
    - `saved_items` - Updated CHECK constraint to allow 'tour' as item_type

  3. Security
    - Enforces the 30-day rental validity at the database level
    - Users cannot add expired or never-unlocked stories to their tours

  4. Notes
    - The trigger checks unlocked_content for a matching record where
      the user owns the tour, the story is unlocked, and expires_at > now()
*/

CREATE OR REPLACE FUNCTION validate_tour_stop_unlock()
RETURNS trigger AS $$
DECLARE
  v_user_id text;
  v_unlocked boolean;
BEGIN
  IF NEW.story_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_user_id
  FROM user_tours
  WHERE id = NEW.tour_id;

  SELECT EXISTS (
    SELECT 1 FROM unlocked_content
    WHERE user_id = v_user_id
      AND item_type = 'story'
      AND item_id = NEW.story_id
      AND expires_at > now()
  ) INTO v_unlocked;

  IF NOT v_unlocked THEN
    RAISE EXCEPTION 'Story must be unlocked (with valid 30-day access) to add to a tour';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_validate_tour_stop_unlock'
  ) THEN
    CREATE TRIGGER trg_validate_tour_stop_unlock
      BEFORE INSERT ON user_tour_stops
      FOR EACH ROW
      EXECUTE FUNCTION validate_tour_stop_unlock();
  END IF;
END $$;

DO $$
BEGIN
  ALTER TABLE saved_items DROP CONSTRAINT IF EXISTS saved_items_item_type_check;
  ALTER TABLE saved_items ADD CONSTRAINT saved_items_item_type_check
    CHECK (item_type IN ('story', 'pack', 'city', 'tour'));
END $$;
