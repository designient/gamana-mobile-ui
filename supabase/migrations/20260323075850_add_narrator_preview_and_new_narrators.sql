/*
  # Add narrator preview audio and new narrators

  1. Modified Tables
    - `narrators`
      - Added `preview_audio_url` (text, nullable) - short 5-10s audio sample for preview playback

  2. New Data
    - Added 2 new narrators: Kavya (Storyteller) and Rohan (Explorer)
    - Added story_narrations for both new narrators across all 10 existing stories

  3. Updated Data
    - Added preview_audio_url for all 4 narrators

  4. Notes
    - Existing narrators Arjun (Historian) and Meera (Local) are untouched except for preview URL addition
    - All new narration entries follow the same UUID pattern for consistency
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'narrators' AND column_name = 'preview_audio_url'
  ) THEN
    ALTER TABLE narrators ADD COLUMN preview_audio_url text;
  END IF;
END $$;

UPDATE narrators SET preview_audio_url = 'https://example.com/audio/preview-arjun.mp3' WHERE id = '00000000-0000-0000-0000-000000000010';
UPDATE narrators SET preview_audio_url = 'https://example.com/audio/preview-meera.mp3' WHERE id = '00000000-0000-0000-0000-000000000011';

INSERT INTO narrators (id, name, style, description, avatar_url, preview_audio_url)
VALUES
  ('00000000-0000-0000-0000-000000000012', 'Kavya', 'Storyteller', 'Vivid narrative that brings legends and folklore alive', null, 'https://example.com/audio/preview-kavya.mp3'),
  ('00000000-0000-0000-0000-000000000013', 'Rohan', 'Explorer', 'Curious traveler perspective with hidden gems and tips', null, 'https://example.com/audio/preview-rohan.mp3')
ON CONFLICT (id) DO NOTHING;

INSERT INTO story_narrations (id, story_id, narrator_id, audio_url, duration_seconds)
VALUES
  ('00000000-0000-0000-0000-000000001020', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000012', 'https://example.com/audio/lalbagh-storyteller.mp3', 400),
  ('00000000-0000-0000-0000-000000001021', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000013', 'https://example.com/audio/lalbagh-explorer.mp3', 350),
  ('00000000-0000-0000-0000-000000001022', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000012', 'https://example.com/audio/vidhana-storyteller.mp3', 340),
  ('00000000-0000-0000-0000-000000001023', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000013', 'https://example.com/audio/vidhana-explorer.mp3', 320),
  ('00000000-0000-0000-0000-000000001024', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000012', 'https://example.com/audio/bull-temple-storyteller.mp3', 290),
  ('00000000-0000-0000-0000-000000001025', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000013', 'https://example.com/audio/bull-temple-explorer.mp3', 260),
  ('00000000-0000-0000-0000-000000001026', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000012', 'https://example.com/audio/palace-storyteller.mp3', 460),
  ('00000000-0000-0000-0000-000000001027', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000013', 'https://example.com/audio/palace-explorer.mp3', 420),
  ('00000000-0000-0000-0000-000000001028', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000012', 'https://example.com/audio/tipu-storyteller.mp3', 320),
  ('00000000-0000-0000-0000-000000001029', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000013', 'https://example.com/audio/tipu-explorer.mp3', 290),
  ('00000000-0000-0000-0000-000000001030', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000012', 'https://example.com/audio/cubbon-storyteller.mp3', 270),
  ('00000000-0000-0000-0000-000000001031', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000013', 'https://example.com/audio/cubbon-explorer.mp3', 250),
  ('00000000-0000-0000-0000-000000001032', '00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000012', 'https://example.com/audio/iskcon-storyteller.mp3', 310),
  ('00000000-0000-0000-0000-000000001033', '00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000013', 'https://example.com/audio/iskcon-explorer.mp3', 280),
  ('00000000-0000-0000-0000-000000001034', '00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000012', 'https://example.com/audio/ulsoor-storyteller.mp3', 250),
  ('00000000-0000-0000-0000-000000001035', '00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000013', 'https://example.com/audio/ulsoor-explorer.mp3', 230),
  ('00000000-0000-0000-0000-000000001036', '00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000012', 'https://example.com/audio/commercial-storyteller.mp3', 230),
  ('00000000-0000-0000-0000-000000001037', '00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000013', 'https://example.com/audio/commercial-explorer.mp3', 210),
  ('00000000-0000-0000-0000-000000001038', '00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000012', 'https://example.com/audio/fort-storyteller.mp3', 190),
  ('00000000-0000-0000-0000-000000001039', '00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000013', 'https://example.com/audio/fort-explorer.mp3', 180)
ON CONFLICT (id) DO NOTHING;
