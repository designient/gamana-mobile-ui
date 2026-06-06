/*
  # Enable PostGIS extension

  Enables the PostGIS extension for geographic distance calculations.
  Used for querying nearby stories based on user coordinates.
*/

CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;
