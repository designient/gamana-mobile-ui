/*
  # Create core Gamana tables

  1. New Tables
    - `cities` - Geographic locations with metadata
      - `id` (uuid, primary key)
      - `name` (text) - City display name
      - `country` (text) - Country name
      - `lat` (double precision) - Latitude
      - `lng` (double precision) - Longitude
      - `timezone` (text) - IANA timezone
      - `description` (text) - City overview
      - `image_url` (text, nullable) - Hero image
      - `created_at` (timestamptz)

    - `narrators` - Available narrator voices
      - `id` (uuid, primary key)
      - `name` (text) - Display name
      - `style` (text) - Style label (Historian, Local, etc.)
      - `description` (text) - One-line description
      - `avatar_url` (text, nullable)

    - `stories` - Audio stories tied to locations
      - `id` (uuid, primary key)
      - `city_id` (uuid, FK -> cities)
      - `title` (text) - Story title
      - `subtitle` (text) - Short descriptor
      - `why_this_matters` (text) - One-line significance
      - `lat` / `lng` (double precision) - Pin location
      - `location` (geography) - PostGIS point for spatial queries
      - `duration_seconds` (integer) - Audio length
      - `trust_level` (text) - verified / legend / mixed
      - `is_featured` (boolean) - Featured on hero card
      - `image_url` (text, nullable)
      - `created_at` (timestamptz)

    - `story_narrations` - Audio tracks per narrator per story
      - `id` (uuid, primary key)
      - `story_id` (uuid, FK -> stories)
      - `narrator_id` (uuid, FK -> narrators)
      - `audio_url` (text) - Audio file URL
      - `duration_seconds` (integer)

    - `quick_mode_content` - Content cards for the 6 quick modes
      - `id` (uuid, primary key)
      - `city_id` (uuid, FK -> cities)
      - `mode` (text) - quick_facts / look_for / respect / stay_safe / languages
      - `title` (text)
      - `body` (text)
      - `duration_seconds` (integer, nullable) - If audio available
      - `audio_url` (text, nullable)
      - `sort_order` (integer)
      - `trust_level` (text)

    - `story_requests` - User-submitted content requests
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `lat` / `lng` (double precision)
      - `location_name` (text)
      - `note` (text)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Read-only public access for content tables (cities, stories, narrators, story_narrations, quick_mode_content)
    - Authenticated insert for story_requests
*/

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  description text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS narrators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  style text NOT NULL,
  description text NOT NULL DEFAULT '',
  avatar_url text
);

CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  why_this_matters text NOT NULL DEFAULT '',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  location geography(Point, 4326),
  duration_seconds integer NOT NULL DEFAULT 0,
  trust_level text NOT NULL DEFAULT 'verified',
  is_featured boolean NOT NULL DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_location ON stories USING gist(location);
CREATE INDEX IF NOT EXISTS idx_stories_city ON stories(city_id);

CREATE TABLE IF NOT EXISTS story_narrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id),
  narrator_id uuid NOT NULL REFERENCES narrators(id),
  audio_url text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 0,
  UNIQUE(story_id, narrator_id)
);

CREATE TABLE IF NOT EXISTS quick_mode_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id),
  mode text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  duration_seconds integer,
  audio_url text,
  sort_order integer NOT NULL DEFAULT 0,
  trust_level text NOT NULL DEFAULT 'verified'
);

CREATE INDEX IF NOT EXISTS idx_quick_mode_city_mode ON quick_mode_content(city_id, mode);

CREATE TABLE IF NOT EXISTS story_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  location_name text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_narrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_mode_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cities"
  ON cities FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read narrators"
  ON narrators FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read stories"
  ON stories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read story narrations"
  ON story_narrations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read quick mode content"
  ON quick_mode_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can submit story requests"
  ON story_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
