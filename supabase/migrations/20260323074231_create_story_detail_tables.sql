/*
  # Create Story Detail tables and RPC

  1. New Tables
    - `story_sources` - Citation and reference links for stories
      - `id` (uuid, primary key)
      - `story_id` (uuid, FK -> stories)
      - `label` (text) - Display name for the source
      - `url` (text) - Link to the source
      - `source_type` (text) - academic / oral / archive / news
      - `sort_order` (integer) - Display ordering

    - `story_notices` - Things to notice at the location
      - `id` (uuid, primary key)
      - `story_id` (uuid, FK -> stories)
      - `body` (text) - Notice text
      - `sort_order` (integer) - Display ordering

    - `story_related` - Curated relationships between stories
      - `id` (uuid, primary key)
      - `story_id` (uuid, FK -> stories)
      - `related_story_id` (uuid, FK -> stories)
      - `relationship` (text) - nearby / same_era / same_theme / same_route
      - `sort_order` (integer) - Display ordering

    - `story_practical_cues` - Visitor tips per story
      - `id` (uuid, primary key)
      - `story_id` (uuid, FK -> stories)
      - `cue_type` (text) - respect / stay_safe / languages
      - `title` (text) - Short heading
      - `body` (text) - Detail text
      - `sort_order` (integer) - Display ordering

  2. New Function
    - `get_related_stories(target_story_id uuid)` - Returns related stories enriched with story metadata and relationship label

  3. Security
    - RLS enabled on all four tables
    - Read-only access for anon and authenticated users
*/

CREATE TABLE IF NOT EXISTS story_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id),
  label text NOT NULL,
  url text NOT NULL DEFAULT '',
  source_type text NOT NULL DEFAULT 'archive',
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT story_sources_type_check CHECK (source_type IN ('academic', 'oral', 'archive', 'news'))
);

CREATE INDEX IF NOT EXISTS idx_story_sources_story ON story_sources(story_id);

CREATE TABLE IF NOT EXISTS story_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id),
  body text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_story_notices_story ON story_notices(story_id);

CREATE TABLE IF NOT EXISTS story_related (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id),
  related_story_id uuid NOT NULL REFERENCES stories(id),
  relationship text NOT NULL DEFAULT 'nearby',
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT story_related_type_check CHECK (relationship IN ('nearby', 'same_era', 'same_theme', 'same_route'))
);

CREATE INDEX IF NOT EXISTS idx_story_related_story ON story_related(story_id);

CREATE TABLE IF NOT EXISTS story_practical_cues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id),
  cue_type text NOT NULL DEFAULT 'respect',
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT story_practical_cues_type_check CHECK (cue_type IN ('respect', 'stay_safe', 'languages'))
);

CREATE INDEX IF NOT EXISTS idx_story_practical_cues_story ON story_practical_cues(story_id);

ALTER TABLE story_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_related ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_practical_cues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read story sources"
  ON story_sources FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read story notices"
  ON story_notices FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read story related"
  ON story_related FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read story practical cues"
  ON story_practical_cues FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION get_related_stories(target_story_id uuid)
RETURNS TABLE (
  id uuid,
  story_id uuid,
  related_story_id uuid,
  relationship text,
  sort_order integer,
  title text,
  subtitle text,
  image_url text,
  duration_seconds integer,
  trust_level text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    sr.id,
    sr.story_id,
    sr.related_story_id,
    sr.relationship,
    sr.sort_order,
    s.title,
    s.subtitle,
    s.image_url,
    s.duration_seconds,
    s.trust_level
  FROM story_related sr
  JOIN stories s ON s.id = sr.related_story_id
  WHERE sr.story_id = target_story_id
  ORDER BY sr.sort_order ASC;
$$;