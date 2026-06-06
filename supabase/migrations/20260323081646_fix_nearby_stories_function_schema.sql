/*
  # Fix nearby_stories function PostGIS schema references

  1. Changes
    - Drops and recreates the `nearby_stories` function
    - Uses `extensions.` schema prefix for all PostGIS types and functions
    - This fixes the "type geography does not exist" error

  2. Notes
    - PostGIS is installed in the `extensions` schema
    - All PostGIS calls (ST_Distance, ST_DWithin, ST_SetSRID, ST_MakePoint) and the geography type must be schema-qualified
*/

DROP FUNCTION IF EXISTS nearby_stories(double precision, double precision, double precision);

CREATE OR REPLACE FUNCTION nearby_stories(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision DEFAULT 10000
)
RETURNS TABLE (
  id uuid,
  city_id uuid,
  title text,
  subtitle text,
  why_this_matters text,
  lat double precision,
  lng double precision,
  duration_seconds integer,
  trust_level text,
  is_featured boolean,
  image_url text,
  created_at timestamptz,
  distance_meters double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.id,
    s.city_id,
    s.title,
    s.subtitle,
    s.why_this_matters,
    s.lat,
    s.lng,
    s.duration_seconds,
    s.trust_level,
    s.is_featured,
    s.image_url,
    s.created_at,
    extensions.ST_Distance(
      s.location,
      extensions.ST_SetSRID(extensions.ST_MakePoint(user_lng, user_lat), 4326)::extensions.geography
    ) AS distance_meters
  FROM stories s
  WHERE extensions.ST_DWithin(
    s.location,
    extensions.ST_SetSRID(extensions.ST_MakePoint(user_lng, user_lat), 4326)::extensions.geography,
    radius_meters
  )
  ORDER BY distance_meters ASC;
$$;