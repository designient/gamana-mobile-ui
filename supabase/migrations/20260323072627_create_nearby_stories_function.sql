/*
  # Create nearby stories RPC function

  Creates a PostGIS-powered function to find stories within a given radius
  of a user's coordinates, ordered by distance.

  Parameters:
    - user_lat (double precision) - User latitude
    - user_lng (double precision) - User longitude
    - radius_meters (double precision) - Search radius in meters (default 5000)

  Returns stories with distance_meters column appended.
*/

CREATE OR REPLACE FUNCTION nearby_stories(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision DEFAULT 5000
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
    ST_Distance(
      s.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_meters
  FROM stories s
  WHERE ST_DWithin(
    s.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters ASC;
$$;
