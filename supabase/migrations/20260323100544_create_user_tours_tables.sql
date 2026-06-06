/*
  # Create User Tours tables

  1. New Tables
    - `user_tours` - User-created walking tours
      - `id` (uuid, primary key)
      - `user_id` (text, references user_profiles) - Tour creator
      - `city_id` (uuid, references cities) - Which city this tour is in
      - `title` (text) - Tour name given by the user
      - `description` (text) - Optional tour description
      - `is_shared` (boolean) - Whether the tour has a public share link
      - `share_code` (text, unique, nullable) - Short code for sharing
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_tour_stops` - Individual stops in a user tour
      - `id` (uuid, primary key)
      - `tour_id` (uuid, references user_tours, cascade delete)
      - `story_id` (uuid, nullable, references stories) - null for pinned locations
      - `pinned_lat` (float, nullable) - GPS latitude for user-pinned location
      - `pinned_lng` (float, nullable) - GPS longitude for user-pinned location
      - `pinned_label` (text, nullable) - User-entered place name
      - `sort_order` (integer) - Order of stops in the tour

  2. Security
    - RLS enabled on both tables
    - Users can only CRUD their own tours and stops
    - Shared tours (is_shared = true) are readable by anyone

  3. Constraints
    - Each stop must be either a story stop (story_id not null) or a pinned location (pinned_lat and pinned_lng not null)

  4. Indexes
    - user_tours(user_id, city_id) for fast lookup
    - user_tour_stops(tour_id) for fast stop listing

  5. Notes
    - Uses text user_id to match existing user_profiles pattern (no auth yet)
    - share_code is unique to enable URL-based sharing
*/

CREATE TABLE IF NOT EXISTS user_tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES user_profiles(id),
  city_id uuid NOT NULL REFERENCES cities(id),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_shared boolean NOT NULL DEFAULT false,
  share_code text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tours"
  ON user_tours FOR SELECT
  TO authenticated, anon
  USING (user_id = coalesce(auth.uid()::text, 'anonymous'));

CREATE POLICY "Anyone can read shared tours"
  ON user_tours FOR SELECT
  TO authenticated, anon
  USING (is_shared = true);

CREATE POLICY "Users can insert own tours"
  ON user_tours FOR INSERT
  TO authenticated, anon
  WITH CHECK (user_id = coalesce(auth.uid()::text, 'anonymous'));

CREATE POLICY "Users can update own tours"
  ON user_tours FOR UPDATE
  TO authenticated, anon
  USING (user_id = coalesce(auth.uid()::text, 'anonymous'))
  WITH CHECK (user_id = coalesce(auth.uid()::text, 'anonymous'));

CREATE POLICY "Users can delete own tours"
  ON user_tours FOR DELETE
  TO authenticated, anon
  USING (user_id = coalesce(auth.uid()::text, 'anonymous'));

CREATE INDEX IF NOT EXISTS idx_user_tours_user_city ON user_tours(user_id, city_id);

CREATE TABLE IF NOT EXISTS user_tour_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES user_tours(id) ON DELETE CASCADE,
  story_id uuid REFERENCES stories(id),
  pinned_lat double precision,
  pinned_lng double precision,
  pinned_label text,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT valid_stop CHECK (
    (story_id IS NOT NULL) OR (pinned_lat IS NOT NULL AND pinned_lng IS NOT NULL)
  )
);

ALTER TABLE user_tour_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tour stops"
  ON user_tour_stops FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM user_tours
      WHERE user_tours.id = user_tour_stops.tour_id
      AND user_tours.user_id = coalesce(auth.uid()::text, 'anonymous')
    )
  );

CREATE POLICY "Anyone can read shared tour stops"
  ON user_tour_stops FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM user_tours
      WHERE user_tours.id = user_tour_stops.tour_id
      AND user_tours.is_shared = true
    )
  );

CREATE POLICY "Users can insert own tour stops"
  ON user_tour_stops FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tours
      WHERE user_tours.id = user_tour_stops.tour_id
      AND user_tours.user_id = coalesce(auth.uid()::text, 'anonymous')
    )
  );

CREATE POLICY "Users can update own tour stops"
  ON user_tour_stops FOR UPDATE
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM user_tours
      WHERE user_tours.id = user_tour_stops.tour_id
      AND user_tours.user_id = coalesce(auth.uid()::text, 'anonymous')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tours
      WHERE user_tours.id = user_tour_stops.tour_id
      AND user_tours.user_id = coalesce(auth.uid()::text, 'anonymous')
    )
  );

CREATE POLICY "Users can delete own tour stops"
  ON user_tour_stops FOR DELETE
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM user_tours
      WHERE user_tours.id = user_tour_stops.tour_id
      AND user_tours.user_id = coalesce(auth.uid()::text, 'anonymous')
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_tour_stops_tour ON user_tour_stops(tour_id);
