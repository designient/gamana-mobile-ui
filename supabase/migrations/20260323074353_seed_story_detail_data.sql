/*
  # Seed story detail data for Bengaluru stories

  Populates the four new detail tables with realistic data for all 10 stories:

  1. story_sources - 2-3 sources per story (academic, oral, archive, news types)
  2. story_notices - 2 notices per story describing things to observe on location
  3. story_related - 2 curated related links per story with relationship types
  4. story_practical_cues - 2-3 practical visitor tips per story
*/

-- Story Sources
INSERT INTO story_sources (story_id, label, url, source_type, sort_order) VALUES
  -- Lalbagh
  ('00000000-0000-0000-0000-000000000100', 'Karnataka Gazetteer: Lalbagh History', 'https://example.com/sources/lalbagh-gazetteer', 'academic', 1),
  ('00000000-0000-0000-0000-000000000100', 'Head Gardener Oral Account, 2019', 'https://example.com/sources/lalbagh-oral', 'oral', 2),
  ('00000000-0000-0000-0000-000000000100', 'ASI Conservation Report', 'https://example.com/sources/lalbagh-asi', 'archive', 3),
  -- Vidhana Soudha
  ('00000000-0000-0000-0000-000000000101', 'Architecture of Independent India, K. Doshi', 'https://example.com/sources/vidhana-doshi', 'academic', 1),
  ('00000000-0000-0000-0000-000000000101', 'Deccan Herald Archives, 1956', 'https://example.com/sources/vidhana-herald', 'news', 2),
  -- Bull Temple
  ('00000000-0000-0000-0000-000000000102', 'Folklore of Southern Karnataka, M. Rao', 'https://example.com/sources/bull-folklore', 'academic', 1),
  ('00000000-0000-0000-0000-000000000102', 'Temple Priest Interview, 2021', 'https://example.com/sources/bull-priest', 'oral', 2),
  -- Bangalore Palace
  ('00000000-0000-0000-0000-000000000103', 'Mysore Royal Family Archives', 'https://example.com/sources/palace-archives', 'archive', 1),
  ('00000000-0000-0000-0000-000000000103', 'Indo-Colonial Architecture Review, 2018', 'https://example.com/sources/palace-review', 'academic', 2),
  -- Tipu Sultan Palace
  ('00000000-0000-0000-0000-000000000104', 'Tipu Sultan: A Life History, K. Brittlebank', 'https://example.com/sources/tipu-brittlebank', 'academic', 1),
  ('00000000-0000-0000-0000-000000000104', 'ASI Monument Report', 'https://example.com/sources/tipu-asi', 'archive', 2),
  ('00000000-0000-0000-0000-000000000104', 'The Hindu Heritage Feature', 'https://example.com/sources/tipu-hindu', 'news', 3),
  -- Cubbon Park
  ('00000000-0000-0000-0000-000000000105', 'Bengaluru Green Spaces Study, IISc 2020', 'https://example.com/sources/cubbon-iisc', 'academic', 1),
  ('00000000-0000-0000-0000-000000000105', 'Park Ranger Community Stories', 'https://example.com/sources/cubbon-ranger', 'oral', 2),
  -- ISKCON Temple
  ('00000000-0000-0000-0000-000000000106', 'ISKCON Official History', 'https://example.com/sources/iskcon-official', 'archive', 1),
  ('00000000-0000-0000-0000-000000000106', 'Modern Temple Architecture in India, 2017', 'https://example.com/sources/iskcon-architecture', 'academic', 2),
  -- Ulsoor Lake
  ('00000000-0000-0000-0000-000000000107', 'Bengaluru Lake Conservation Report, 2022', 'https://example.com/sources/ulsoor-conservation', 'academic', 1),
  ('00000000-0000-0000-0000-000000000107', 'Fishermen Community Oral History', 'https://example.com/sources/ulsoor-fishermen', 'oral', 2),
  -- Commercial Street
  ('00000000-0000-0000-0000-000000000108', 'Bazaars of Bangalore, S. Nair', 'https://example.com/sources/commercial-nair', 'academic', 1),
  ('00000000-0000-0000-0000-000000000108', 'Shopkeeper Interviews, 2023', 'https://example.com/sources/commercial-shopkeepers', 'oral', 2),
  -- Bangalore Fort
  ('00000000-0000-0000-0000-000000000109', 'Kempegowda and the Founding of Bangalore, R. Narasimhachar', 'https://example.com/sources/fort-narasimhachar', 'academic', 1),
  ('00000000-0000-0000-0000-000000000109', 'ASI Excavation Notes, 2015', 'https://example.com/sources/fort-asi', 'archive', 2)
ON CONFLICT DO NOTHING;

-- Story Notices
INSERT INTO story_notices (story_id, body, sort_order) VALUES
  -- Lalbagh
  ('00000000-0000-0000-0000-000000000100', 'Look for the 3,000-million-year-old rock formation near the Glass House — one of the oldest exposed rocks on Earth.', 1),
  ('00000000-0000-0000-0000-000000000100', 'Notice how the pathways radiate outward from the central bandstand, following Hyder Ali''s original French garden layout.', 2),
  -- Vidhana Soudha
  ('00000000-0000-0000-0000-000000000101', 'The inscription above the entrance reads "Government Work is God''s Work" in Kannada — a deliberate post-independence statement.', 1),
  ('00000000-0000-0000-0000-000000000101', 'Count the granite pillars: there are over 300, each hand-carved by artisans from across Karnataka.', 2),
  -- Bull Temple
  ('00000000-0000-0000-0000-000000000102', 'The Nandi statue appears to grow slightly each year due to the constant application of coconut oil and butter by devotees.', 1),
  ('00000000-0000-0000-0000-000000000102', 'Notice the peanut offerings — they connect to the annual Kadalekai Parishe groundnut fair held just outside.', 2),
  -- Bangalore Palace
  ('00000000-0000-0000-0000-000000000103', 'The fortified towers and turrets are directly inspired by Windsor Castle, which the young Maharaja visited in 1887.', 1),
  ('00000000-0000-0000-0000-000000000103', 'Look for the ornate woodwork on the ceiling of the Durbar Hall — it mixes floral Victorian patterns with Mysore rosewood craft.', 2),
  -- Tipu Sultan Palace
  ('00000000-0000-0000-0000-000000000104', 'The entire structure is built from teak wood without a single nail — the joints use traditional mortise-and-tenon joinery.', 1),
  ('00000000-0000-0000-0000-000000000104', 'Look up at the painted arches showing floral motifs — they blend Persian artistic traditions with South Indian temple art.', 2),
  -- Cubbon Park
  ('00000000-0000-0000-0000-000000000105', 'The bamboo grove near the library is home to over 60 bird species — listen for the distinctive call of the Asian Koel.', 1),
  ('00000000-0000-0000-0000-000000000105', 'Notice the red-painted Victorian bandstand at the centre — it still hosts occasional weekend concerts.', 2),
  -- ISKCON Temple
  ('00000000-0000-0000-0000-000000000106', 'The main gopuram blends traditional Dravidian temple architecture with modern glass and steel elements.', 1),
  ('00000000-0000-0000-0000-000000000106', 'The Vedic art gallery on the lower level contains 3D dioramas that took artisans over five years to complete.', 2),
  -- Ulsoor Lake
  ('00000000-0000-0000-0000-000000000107', 'The small island in the centre is accessible only by boat and contains a shrine that predates the British cantonment.', 1),
  ('00000000-0000-0000-0000-000000000107', 'Watch for cormorants drying their wings on the boundary stones — a sign the lake ecosystem is recovering.', 2),
  -- Commercial Street
  ('00000000-0000-0000-0000-000000000108', 'The oldest shops near the Jumma Masjid end have been run by the same families for over four generations.', 1),
  ('00000000-0000-0000-0000-000000000108', 'Look up above the modern signage to spot original Art Deco facades from the 1930s still intact on upper floors.', 2),
  -- Bangalore Fort
  ('00000000-0000-0000-0000-000000000109', 'The Delhi Gate still has visible cannon ball marks from the 1791 siege when Cornwallis attacked Tipu Sultan.', 1),
  ('00000000-0000-0000-0000-000000000109', 'Notice the Ganapathi temple built into the fort walls — it has been in continuous worship since Kempegowda''s time.', 2)
ON CONFLICT DO NOTHING;

-- Story Related (curated connections)
INSERT INTO story_related (story_id, related_story_id, relationship, sort_order) VALUES
  -- Lalbagh -> Cubbon Park (same_theme: green spaces), Bull Temple (nearby)
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000105', 'same_theme', 1),
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000102', 'nearby', 2),
  -- Vidhana Soudha -> Cubbon Park (nearby), Bangalore Palace (same_era)
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000105', 'nearby', 1),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000103', 'same_era', 2),
  -- Bull Temple -> Bangalore Fort (same_era), Lalbagh (nearby)
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000109', 'same_era', 1),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000100', 'nearby', 2),
  -- Bangalore Palace -> Vidhana Soudha (same_theme: governance), Tipu Palace (same_theme: royalty)
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000101', 'same_theme', 1),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000104', 'same_theme', 2),
  -- Tipu Palace -> Bangalore Fort (same_era), Bangalore Palace (same_theme)
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000109', 'same_era', 1),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000103', 'same_theme', 2),
  -- Cubbon Park -> Vidhana Soudha (nearby), Ulsoor Lake (same_theme: open spaces)
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000101', 'nearby', 1),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000107', 'same_theme', 2),
  -- ISKCON -> Bangalore Palace (nearby), Bull Temple (same_theme: devotion)
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000103', 'nearby', 1),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000102', 'same_theme', 2),
  -- Ulsoor Lake -> Commercial Street (nearby), Cubbon Park (same_theme)
  ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000108', 'nearby', 1),
  ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000105', 'same_theme', 2),
  -- Commercial Street -> Ulsoor Lake (nearby), Bangalore Fort (same_era)
  ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000107', 'nearby', 1),
  ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000109', 'same_era', 2),
  -- Bangalore Fort -> Tipu Palace (same_era), Bull Temple (same_era)
  ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000104', 'same_era', 1),
  ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000102', 'same_era', 2)
ON CONFLICT DO NOTHING;

-- Story Practical Cues
INSERT INTO story_practical_cues (story_id, cue_type, title, body, sort_order) VALUES
  -- Lalbagh
  ('00000000-0000-0000-0000-000000000100', 'respect', 'Quiet near flower shows', 'During biannual flower shows the garden gets crowded. Keep voices low near the Glass House exhibition area.', 1),
  ('00000000-0000-0000-0000-000000000100', 'stay_safe', 'Uneven paths', 'Some paths near the rock formation have uneven stones. Wear sturdy footwear, especially after rain.', 2),
  ('00000000-0000-0000-0000-000000000100', 'languages', 'Garden signage', 'Plant labels are in Kannada, English, and Latin. The entry ticket booth staff speak English and Kannada.', 3),
  -- Vidhana Soudha
  ('00000000-0000-0000-0000-000000000101', 'respect', 'No public entry', 'The building is a working legislature. Public entry is restricted to specific galleries during sessions only.', 1),
  ('00000000-0000-0000-0000-000000000101', 'stay_safe', 'Security zone', 'Heavy security around the building. Photography of the exterior is allowed but avoid photographing security personnel.', 2),
  -- Bull Temple
  ('00000000-0000-0000-0000-000000000102', 'respect', 'Remove footwear', 'Shoes must be removed before entering the temple. Free shoe storage is available at the entrance.', 1),
  ('00000000-0000-0000-0000-000000000102', 'respect', 'Join the ritual', 'Visitors are welcome to participate in the evening aarti. Stand respectfully and follow others'' lead.', 2),
  ('00000000-0000-0000-0000-000000000102', 'languages', 'Temple language', 'Priests speak Kannada and some Hindi. Basic English is understood. "Namaskara" is appreciated.', 3),
  -- Bangalore Palace
  ('00000000-0000-0000-0000-000000000103', 'stay_safe', 'Camera fees', 'Photography inside requires a separate ticket (extra 200 INR). Video recording is not permitted.', 1),
  ('00000000-0000-0000-0000-000000000103', 'respect', 'Private property', 'The palace is still owned by the Mysore royal family. Respect roped-off areas and do not touch artefacts.', 2),
  -- Tipu Sultan Palace
  ('00000000-0000-0000-0000-000000000104', 'respect', 'Modest dress', 'As a historical monument with religious significance, cover shoulders and knees when visiting.', 1),
  ('00000000-0000-0000-0000-000000000104', 'stay_safe', 'Official guides only', 'Use only ASI-certified guides with visible ID badges. Unofficial guides may give inaccurate information.', 2),
  ('00000000-0000-0000-0000-000000000104', 'languages', 'Audio guide', 'ASI provides audio guides in English, Kannada, and Hindi at the ticket counter for 50 INR.', 3),
  -- Cubbon Park
  ('00000000-0000-0000-0000-000000000105', 'stay_safe', 'After dark', 'The park is well-patrolled until sunset. Avoid the interior paths after dark as lighting is limited.', 1),
  ('00000000-0000-0000-0000-000000000105', 'respect', 'Wildlife corridors', 'Stay on marked paths. The park is home to monitor lizards and nesting birds in certain areas.', 2),
  -- ISKCON
  ('00000000-0000-0000-0000-000000000106', 'respect', 'Dress code enforced', 'The temple enforces a dress code. Shorts, sleeveless tops, and short skirts are not permitted inside.', 1),
  ('00000000-0000-0000-0000-000000000106', 'stay_safe', 'Queue times', 'Weekend evenings see 1-2 hour queues for darshan. Weekday mornings are significantly quieter.', 2),
  ('00000000-0000-0000-0000-000000000106', 'languages', 'Multilingual campus', 'Signs and announcements are in Kannada, English, Hindi, and Sanskrit. Staff speak multiple languages.', 3),
  -- Ulsoor Lake
  ('00000000-0000-0000-0000-000000000107', 'stay_safe', 'Boat safety', 'Use only official BBMP boats with life jackets. Avoid private operators offering cheaper rides.', 1),
  ('00000000-0000-0000-0000-000000000107', 'respect', 'Fishing community', 'The lake supports a small fishing community. Do not disturb their nets or equipment along the banks.', 2),
  -- Commercial Street
  ('00000000-0000-0000-0000-000000000108', 'stay_safe', 'Watch your belongings', 'The market gets extremely crowded, especially on weekends. Keep valuables in front pockets.', 1),
  ('00000000-0000-0000-0000-000000000108', 'stay_safe', 'Bargaining expected', 'Vendors expect negotiation. Start at 40-50% of the quoted price and work upward.', 2),
  ('00000000-0000-0000-0000-000000000108', 'languages', 'Market phrases', 'Learn "Eshthu" (how much?) in Kannada. Most shopkeepers also speak Hindi and English.', 3),
  -- Bangalore Fort
  ('00000000-0000-0000-0000-000000000109', 'respect', 'Heritage site', 'Do not climb on walls or touch the cannon ball marks. This is a protected ASI monument.', 1),
  ('00000000-0000-0000-0000-000000000109', 'stay_safe', 'Surrounding area', 'The fort is in a busy market area. Cross roads carefully and watch for traffic near the gates.', 2)
ON CONFLICT DO NOTHING;