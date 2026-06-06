/*
  # Seed Bengaluru pilot data

  1. Cities
    - Bengaluru with coordinates and description

  2. Narrators
    - Historian narrator
    - Local narrator

  3. Stories
    - 10 stories across Bengaluru landmarks
    - Each with PostGIS geography point
    - Mix of verified, legend, and mixed trust levels

  4. Story Narrations
    - 2 narrations per story (Historian + Local)

  5. Quick Mode Content
    - Quick Facts (4 entries)
    - Look For (4 entries)
    - Respect (4 entries)
    - Stay Safe (4 entries)
    - Languages (3 entries)
*/

INSERT INTO cities (id, name, country, lat, lng, timezone, description, image_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Bengaluru',
  'India',
  12.9716,
  77.5946,
  'Asia/Kolkata',
  'India''s Silicon Valley blends ancient temples with startup culture, garden city parks with craft beer scenes.',
  'https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=800'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO narrators (id, name, style, description) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Arjun', 'Historian', 'Academic perspective with verified historical sources'),
  ('00000000-0000-0000-0000-000000000011', 'Meera', 'Local', 'Warm local voice with neighbourhood insights')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, city_id, title, subtitle, why_this_matters, lat, lng, location, duration_seconds, trust_level, is_featured, image_url) VALUES
(
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000001',
  'Lalbagh Botanical Garden',
  'A 240-year-old garden at the heart of the city',
  'Hyder Ali''s 18th-century vision of a world-class garden still anchors Bengaluru''s green identity.',
  12.9507, 77.5848,
  ST_SetSRID(ST_MakePoint(77.5848, 12.9507), 4326)::geography,
  420, 'verified', true,
  'https://images.pexels.com/photos/1485894/pexels-photo-1485894.jpeg?auto=compress&cs=tinysrgb&w=600'
),
(
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'Vidhana Soudha',
  'The seat of Karnataka''s legislature',
  'This neo-Dravidian masterpiece was built as a symbol of India''s post-independence sovereignty.',
  12.9791, 77.5913,
  ST_SetSRID(ST_MakePoint(77.5913, 12.9791), 4326)::geography,
  360, 'verified', false,
  'https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=600'
),
(
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000001',
  'Bull Temple',
  'The sacred Nandi of Basavanagudi',
  'This 16th-century monolithic bull statue carries layers of myth, devotion, and neighbourhood ritual.',
  12.9432, 77.5675,
  ST_SetSRID(ST_MakePoint(77.5675, 12.9432), 4326)::geography,
  300, 'legend', false,
  'https://images.pexels.com/photos/5765818/pexels-photo-5765818.jpeg?auto=compress&cs=tinysrgb&w=600'
),
(
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000001',
  'Bangalore Palace',
  'Tudor-style architecture in tropical India',
  'Built in 1887, this palace reveals how colonial aesthetics blended with local royalty.',
  12.9987, 77.5921,
  ST_SetSRID(ST_MakePoint(77.5921, 12.9987), 4326)::geography,
  480, 'verified', false,
  'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600'
),
(
  '00000000-0000-0000-0000-000000000104',
  '00000000-0000-0000-0000-000000000001',
  'Tipu Sultan''s Summer Palace',
  'An 18th-century indo-Islamic marvel',
  'Tipu Sultan''s teak palace is one of the last standing symbols of Mysore''s resistance to British rule.',
  12.9593, 77.5737,
  ST_SetSRID(ST_MakePoint(77.5737, 12.9593), 4326)::geography,
  340, 'verified', false,
  'https://images.pexels.com/photos/3522880/pexels-photo-3522880.jpeg?auto=compress&cs=tinysrgb&w=600'
),
(
  '00000000-0000-0000-0000-000000000105',
  '00000000-0000-0000-0000-000000000001',
  'Cubbon Park',
  'The green lung of the old cantonment',
  'This 300-acre park was designed as a British recreation ground but became Bengaluru''s public commons.',
  12.9763, 77.5929,
  ST_SetSRID(ST_MakePoint(77.5929, 12.9763), 4326)::geography,
  280, 'verified', false,
  'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=600'
),
(
  '00000000-0000-0000-0000-000000000106',
  '00000000-0000-0000-0000-000000000001',
  'ISKCON Temple',
  'Modern devotion on a hilltop',
  'One of the largest ISKCON temples in the world, it bridges traditional Vaishnavism with modern architecture.',
  13.0098, 77.5510,
  ST_SetSRID(ST_MakePoint(77.5510, 13.0098), 4326)::geography,
  320, 'verified', false,
  'https://images.pexels.com/photos/2846034/pexels-photo-2846034.jpeg?auto=compress&cs=tinysrgb&w=600'
),
(
  '00000000-0000-0000-0000-000000000107',
  '00000000-0000-0000-0000-000000000001',
  'Ulsoor Lake',
  'A Kempegowda-era lake in the city centre',
  'This 16th-century lake is a living example of Bengaluru''s traditional water management system.',
  12.9830, 77.6190,
  ST_SetSRID(ST_MakePoint(77.6190, 12.9830), 4326)::geography,
  260, 'mixed', false,
  'https://images.pexels.com/photos/2635815/pexels-photo-2635815.jpeg?auto=compress&cs=tinysrgb&w=600'
),
(
  '00000000-0000-0000-0000-000000000108',
  '00000000-0000-0000-0000-000000000001',
  'Commercial Street',
  'Bengaluru''s oldest shopping district',
  'A century-old marketplace where bargaining rituals and silk trade traditions still thrive.',
  12.9818, 77.6075,
  ST_SetSRID(ST_MakePoint(77.6075, 12.9818), 4326)::geography,
  240, 'legend', false,
  'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=600'
),
(
  '00000000-0000-0000-0000-000000000109',
  '00000000-0000-0000-0000-000000000001',
  'Bangalore Fort',
  'Remains of Kempegowda''s mud citadel',
  'The original 1537 fort marks the founding spot of the city itself.',
  12.9611, 77.5740,
  ST_SetSRID(ST_MakePoint(77.5740, 12.9611), 4326)::geography,
  200, 'verified', false,
  'https://images.pexels.com/photos/2765873/pexels-photo-2765873.jpeg?auto=compress&cs=tinysrgb&w=600'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO story_narrations (id, story_id, narrator_id, audio_url, duration_seconds) VALUES
  ('00000000-0000-0000-0000-000000001000', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000010', 'https://example.com/audio/lalbagh-historian.mp3', 420),
  ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000011', 'https://example.com/audio/lalbagh-local.mp3', 380),
  ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000010', 'https://example.com/audio/vidhana-historian.mp3', 360),
  ('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000011', 'https://example.com/audio/vidhana-local.mp3', 340),
  ('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000010', 'https://example.com/audio/bull-temple-historian.mp3', 300),
  ('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000011', 'https://example.com/audio/bull-temple-local.mp3', 280),
  ('00000000-0000-0000-0000-000000001006', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000010', 'https://example.com/audio/palace-historian.mp3', 480),
  ('00000000-0000-0000-0000-000000001007', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000011', 'https://example.com/audio/palace-local.mp3', 440),
  ('00000000-0000-0000-0000-000000001008', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000010', 'https://example.com/audio/tipu-historian.mp3', 340),
  ('00000000-0000-0000-0000-000000001009', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000011', 'https://example.com/audio/tipu-local.mp3', 310),
  ('00000000-0000-0000-0000-000000001010', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000010', 'https://example.com/audio/cubbon-historian.mp3', 280),
  ('00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000011', 'https://example.com/audio/cubbon-local.mp3', 260),
  ('00000000-0000-0000-0000-000000001012', '00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000010', 'https://example.com/audio/iskcon-historian.mp3', 320),
  ('00000000-0000-0000-0000-000000001013', '00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000011', 'https://example.com/audio/iskcon-local.mp3', 300),
  ('00000000-0000-0000-0000-000000001014', '00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000010', 'https://example.com/audio/ulsoor-historian.mp3', 260),
  ('00000000-0000-0000-0000-000000001015', '00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000011', 'https://example.com/audio/ulsoor-local.mp3', 240),
  ('00000000-0000-0000-0000-000000001016', '00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000010', 'https://example.com/audio/commercial-historian.mp3', 240),
  ('00000000-0000-0000-0000-000000001017', '00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000011', 'https://example.com/audio/commercial-local.mp3', 220),
  ('00000000-0000-0000-0000-000000001018', '00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000010', 'https://example.com/audio/fort-historian.mp3', 200),
  ('00000000-0000-0000-0000-000000001019', '00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000011', 'https://example.com/audio/fort-local.mp3', 190)
ON CONFLICT (id) DO NOTHING;

INSERT INTO quick_mode_content (city_id, mode, title, body, sort_order, trust_level, duration_seconds) VALUES
  ('00000000-0000-0000-0000-000000000001', 'quick_facts', 'Founded in 1537', 'Kempegowda I, a feudal lord under the Vijayanagara Empire, built a mud fort here that gave birth to the city.', 1, 'verified', 90),
  ('00000000-0000-0000-0000-000000000001', 'quick_facts', 'Garden City', 'Bengaluru has over 1,000 hectares of parks, earning its nickname. The pleasant climate at 920m altitude supports year-round greenery.', 2, 'verified', 75),
  ('00000000-0000-0000-0000-000000000001', 'quick_facts', 'Tech Capital', 'Home to over 10,000 tech companies and India''s largest startup ecosystem, the city generates a third of India''s IT exports.', 3, 'verified', 60),
  ('00000000-0000-0000-0000-000000000001', 'quick_facts', 'Diverse Food Scene', 'From Vidyarthi Bhavan''s dosas since 1943 to modern craft breweries, the city bridges traditional South Indian cuisine with global flavours.', 4, 'verified', 80),

  ('00000000-0000-0000-0000-000000000001', 'look_for', 'Art Deco on MG Road', 'Look up at the buildings along MG Road and Brigade Road for faded Art Deco facades from the 1930s-40s, often hidden behind modern signage.', 1, 'verified', 60),
  ('00000000-0000-0000-0000-000000000001', 'look_for', 'Rain Trees', 'Bengaluru''s iconic canopy comes from Samanea saman trees planted in the 19th century. Their umbrella-shaped crowns define the old neighbourhoods.', 2, 'verified', 70),
  ('00000000-0000-0000-0000-000000000001', 'look_for', 'Step Wells', 'Several historic kalyani (step wells) survive near old temples. The one at Someshwara Temple in Ulsoor dates to the Chola period.', 3, 'legend', 65),
  ('00000000-0000-0000-0000-000000000001', 'look_for', 'Kempegowda Towers', 'Four watchtowers marking the original city limits still stand. Spot them at Lalbagh, Ulsoor, Mekhri Circle, and Kempambudhi Lake.', 4, 'verified', 55),

  ('00000000-0000-0000-0000-000000000001', 'respect', 'Remove Shoes at Temples', 'Always remove footwear before entering any temple. Shoe storage is usually available at the entrance. This applies to all Hindu, Jain, and most Buddhist sites.', 1, 'verified', 45),
  ('00000000-0000-0000-0000-000000000001', 'respect', 'Right Hand for Giving', 'When handing money, food, or gifts to anyone, always use your right hand. The left hand is considered unclean in Indian culture.', 2, 'verified', 40),
  ('00000000-0000-0000-0000-000000000001', 'respect', 'Photography in Sacred Spaces', 'Ask before photographing inside temples or during rituals. Many inner sanctums prohibit cameras entirely. Respect posted signs.', 3, 'verified', 50),
  ('00000000-0000-0000-0000-000000000001', 'respect', 'Dress Modestly at Religious Sites', 'Cover shoulders and knees when visiting temples. Some sites offer wraps at the entrance if needed.', 4, 'verified', 35),

  ('00000000-0000-0000-0000-000000000001', 'stay_safe', 'Auto Rickshaw Pricing', 'Always insist on the meter or agree on a fare before getting in. The base fare is around 30 INR. Use apps like Ola/Uber for transparent pricing.', 1, 'verified', 60),
  ('00000000-0000-0000-0000-000000000001', 'stay_safe', 'Street Food Hygiene', 'Stick to busy stalls with high turnover. Avoid pre-cut fruits from street vendors. Bottled water is widely available and inexpensive.', 2, 'verified', 55),
  ('00000000-0000-0000-0000-000000000001', 'stay_safe', 'Unofficial Tour Guides', 'At popular landmarks like Tipu Sultan''s Palace, unofficial guides may approach offering tours at inflated prices. Official guides have ID badges.', 3, 'verified', 50),
  ('00000000-0000-0000-0000-000000000001', 'stay_safe', 'Traffic Awareness', 'Pedestrian crossings are suggestions, not rules. Always look both ways even on one-way streets. Cross with a group of locals when possible.', 4, 'verified', 45),

  ('00000000-0000-0000-0000-000000000001', 'languages', 'Kannada is Primary', 'Kannada is the official language. While English and Hindi are widely understood in tech areas, learning a few Kannada phrases shows respect.', 1, 'verified', 60),
  ('00000000-0000-0000-0000-000000000001', 'languages', 'Useful Phrases', 'Namaskara (Hello), Dhanyavadagalu (Thank you), Hegiddira (How are you?), Eshthu (How much?). Locals appreciate even basic attempts.', 2, 'verified', 70),
  ('00000000-0000-0000-0000-000000000001', 'languages', 'Script and Signage', 'Kannada script appears on all official signs alongside English. Metro and bus signs are bilingual. Google Translate works well for Kannada.', 3, 'verified', 50)
ON CONFLICT DO NOTHING;
