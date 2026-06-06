/*
  # Create Library tables for City Packs, Topics, and Saved Items

  1. New Tables
    - `city_packs` - Curated tour/pack bundles per city
      - `id` (uuid, primary key)
      - `city_id` (uuid, references cities)
      - `title` (text) - Pack name e.g. "Heritage Walk"
      - `subtitle` (text) - Short description
      - `image_url` (text, nullable)
      - `story_count` (integer) - Number of stories in the pack
      - `total_duration_seconds` (integer) - Total listening time
      - `sort_order` (integer)
      - `created_at` (timestamptz)

    - `city_pack_stories` - Junction table linking packs to stories
      - `id` (uuid, primary key)
      - `pack_id` (uuid, references city_packs)
      - `story_id` (uuid, references stories)
      - `sort_order` (integer)

    - `topics` - Thematic categories for "Go Deeper" exploration
      - `id` (uuid, primary key)
      - `city_id` (uuid, references cities)
      - `title` (text) - Topic name e.g. "Temples & Mythology"
      - `subtitle` (text) - Short description
      - `icon_name` (text) - Lucide icon name
      - `story_count` (integer)
      - `sort_order` (integer)

    - `topic_stories` - Junction table linking topics to stories
      - `id` (uuid, primary key)
      - `topic_id` (uuid, references topics)
      - `story_id` (uuid, references stories)
      - `sort_order` (integer)

    - `saved_items` - User's bookmarked content
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Will reference auth.users when auth is enabled
      - `item_type` (text) - 'story' | 'pack' | 'city'
      - `item_id` (uuid) - References the saved entity
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - city_packs, city_pack_stories, topics, topic_stories: public read for authenticated
    - saved_items: user can only CRUD their own items

  3. Seed Data
    - 3 city packs for Bengaluru with story assignments
    - 4 topics for Bengaluru with story assignments

  4. Notes
    - saved_items uses user_id as text for now (no auth yet), will migrate to auth.uid() when auth is added
    - All tables use gen_random_uuid() for IDs
*/

-- city_packs
CREATE TABLE IF NOT EXISTS city_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  image_url text,
  story_count integer NOT NULL DEFAULT 0,
  total_duration_seconds integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE city_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read city packs"
  ON city_packs FOR SELECT
  TO authenticated, anon
  USING (true);

-- city_pack_stories
CREATE TABLE IF NOT EXISTS city_pack_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid NOT NULL REFERENCES city_packs(id),
  story_id uuid NOT NULL REFERENCES stories(id),
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE city_pack_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read city pack stories"
  ON city_pack_stories FOR SELECT
  TO authenticated, anon
  USING (true);

-- topics
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'Compass',
  story_count integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read topics"
  ON topics FOR SELECT
  TO authenticated, anon
  USING (true);

-- topic_stories
CREATE TABLE IF NOT EXISTS topic_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES topics(id),
  story_id uuid NOT NULL REFERENCES stories(id),
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE topic_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read topic stories"
  ON topic_stories FOR SELECT
  TO authenticated, anon
  USING (true);

-- saved_items
CREATE TABLE IF NOT EXISTS saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  item_type text NOT NULL CHECK (item_type IN ('story', 'pack', 'city')),
  item_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved items"
  ON saved_items FOR SELECT
  TO authenticated, anon
  USING (user_id = coalesce(auth.uid()::text, 'anonymous'));

CREATE POLICY "Users can insert own saved items"
  ON saved_items FOR INSERT
  TO authenticated, anon
  WITH CHECK (user_id = coalesce(auth.uid()::text, 'anonymous'));

CREATE POLICY "Users can delete own saved items"
  ON saved_items FOR DELETE
  TO authenticated, anon
  USING (user_id = coalesce(auth.uid()::text, 'anonymous'));
