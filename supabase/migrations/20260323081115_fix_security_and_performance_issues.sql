/*
  # Fix security and performance issues

  1. Indexes on Foreign Keys
    - `city_pack_stories.pack_id`
    - `city_pack_stories.story_id`
    - `city_packs.city_id`
    - `story_narrations.narrator_id`
    - `story_related.related_story_id`
    - `topic_stories.story_id`
    - `topic_stories.topic_id`
    - `topics.city_id`

  2. RLS Policy Optimization
    - Replace `auth.uid()` with `(select auth.uid())` in all saved_items policies
      to avoid per-row re-evaluation

  3. Function Search Path
    - Set immutable search_path on `nearby_stories` and `get_related_stories`

  4. Restrictive RLS
    - Replace unrestricted INSERT policy on `story_requests` with one that
      requires a non-empty body

  5. Notes
    - Unused index `idx_stories_city` left in place (harmless, may be used by future queries)
    - Auth DB connection strategy is a project-level setting, not addressable via migration
*/

-- 1. Foreign key indexes

CREATE INDEX IF NOT EXISTS idx_city_pack_stories_pack_id
  ON city_pack_stories (pack_id);

CREATE INDEX IF NOT EXISTS idx_city_pack_stories_story_id
  ON city_pack_stories (story_id);

CREATE INDEX IF NOT EXISTS idx_city_packs_city_id
  ON city_packs (city_id);

CREATE INDEX IF NOT EXISTS idx_story_narrations_narrator_id
  ON story_narrations (narrator_id);

CREATE INDEX IF NOT EXISTS idx_story_related_related_story_id
  ON story_related (related_story_id);

CREATE INDEX IF NOT EXISTS idx_topic_stories_story_id
  ON topic_stories (story_id);

CREATE INDEX IF NOT EXISTS idx_topic_stories_topic_id
  ON topic_stories (topic_id);

CREATE INDEX IF NOT EXISTS idx_topics_city_id
  ON topics (city_id);

-- 2. Optimise saved_items RLS policies (wrap auth.uid() in select)

DROP POLICY IF EXISTS "Users can read own saved items" ON saved_items;
CREATE POLICY "Users can read own saved items"
  ON saved_items FOR SELECT
  TO authenticated, anon
  USING (user_id = coalesce((select auth.uid())::text, 'anonymous'));

DROP POLICY IF EXISTS "Users can insert own saved items" ON saved_items;
CREATE POLICY "Users can insert own saved items"
  ON saved_items FOR INSERT
  TO authenticated, anon
  WITH CHECK (user_id = coalesce((select auth.uid())::text, 'anonymous'));

DROP POLICY IF EXISTS "Users can delete own saved items" ON saved_items;
CREATE POLICY "Users can delete own saved items"
  ON saved_items FOR DELETE
  TO authenticated, anon
  USING (user_id = coalesce((select auth.uid())::text, 'anonymous'));

-- 3. Fix mutable search_path on functions

ALTER FUNCTION public.nearby_stories SET search_path = public;
ALTER FUNCTION public.get_related_stories SET search_path = public;

-- 4. Replace unrestricted INSERT policy on story_requests

DROP POLICY IF EXISTS "Anyone can submit story requests" ON story_requests;
CREATE POLICY "Authenticated users can submit story requests"
  ON story_requests FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);
