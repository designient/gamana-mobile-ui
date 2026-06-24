// =============================================================================
// Seed data extracted from all SQL migrations, with UPDATEs applied.
// =============================================================================

// --- Types ---

export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  description: string;
  image_url: string;
}

export interface Narrator {
  id: string;
  name: string;
  style: string;
  description: string;
  avatar_url: string | null;
  preview_audio_url: string | null;
}

export interface Story {
  id: string;
  city_id: string;
  title: string;
  subtitle: string;
  why_this_matters: string;
  lat: number;
  lng: number;
  duration_seconds: number;
  trust_level: 'verified' | 'legend' | 'mixed';
  is_featured: boolean;
  image_url: string;
}

export interface StoryNarration {
  id: string;
  story_id: string;
  narrator_id: string;
  audio_url: string;
  duration_seconds: number;
}

export interface QuickModeContent {
  city_id: string;
  mode: 'quick_facts' | 'look_for' | 'respect' | 'stay_safe' | 'languages';
  title: string;
  body: string;
  sort_order: number;
  trust_level: 'verified' | 'legend' | 'mixed';
  duration_seconds: number;
}

export interface StorySource {
  story_id: string;
  label: string;
  url: string;
  source_type: 'academic' | 'oral' | 'archive' | 'news';
  sort_order: number;
}

export interface StoryNotice {
  story_id: string;
  body: string;
  sort_order: number;
}

export interface StoryRelated {
  story_id: string;
  related_story_id: string;
  relationship: 'same_theme' | 'nearby' | 'same_era';
  sort_order: number;
}

export interface StoryPracticalCue {
  story_id: string;
  cue_type: 'respect' | 'stay_safe' | 'languages';
  title: string;
  body: string;
  sort_order: number;
}

export interface CityPack {
  id: string;
  city_id: string;
  title: string;
  subtitle: string;
  image_url: string;
  story_count: number;
  total_duration_seconds: number;
  sort_order: number;
  coin_cost: number;
}

export interface CityPackStory {
  id: string;
  pack_id: string;
  story_id: string;
  sort_order: number;
}

export interface Topic {
  id: string;
  city_id: string;
  title: string;
  subtitle: string;
  icon_name: string;
  story_count: number;
  sort_order: number;
}

export interface TopicStory {
  id: string;
  topic_id: string;
  story_id: string;
  sort_order: number;
}

export interface Coupon {
  code: string;
  coin_value: number;
  max_uses: number;
  description: string;
}

// --- Data ---

export const cities: City[] = [
  // India
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Bengaluru',
    country: 'India',
    lat: 12.9716,
    lng: 77.5946,
    timezone: 'Asia/Kolkata',
    description: "India's Silicon Valley blends ancient temples with startup culture, garden city parks with craft beer scenes.",
    image_url: 'https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Jaipur',
    country: 'India',
    lat: 26.9124,
    lng: 75.7873,
    timezone: 'Asia/Kolkata',
    description: 'The Pink City dazzles with hilltop forts, ornate palaces, and bazaars bursting with color and craft.',
    image_url: 'https://images.pexels.com/photos/3581364/pexels-photo-3581364.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Varanasi',
    country: 'India',
    lat: 25.3176,
    lng: 82.9739,
    timezone: 'Asia/Kolkata',
    description: 'One of the oldest living cities on earth, where ancient ghats meet the sacred Ganges at dawn.',
    image_url: 'https://images.pexels.com/photos/5458388/pexels-photo-5458388.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Mumbai',
    country: 'India',
    lat: 19.076,
    lng: 72.8777,
    timezone: 'Asia/Kolkata',
    description: 'The city of dreams pulses with Bollywood glamour, colonial architecture, and legendary street food.',
    image_url: 'https://images.pexels.com/photos/2104152/pexels-photo-2104152.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Delhi',
    country: 'India',
    lat: 28.6139,
    lng: 77.209,
    timezone: 'Asia/Kolkata',
    description: 'Layers of empire converge here — Mughal tombs, British-era avenues, and bustling Old Delhi lanes.',
    image_url: 'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Kochi',
    country: 'India',
    lat: 9.9312,
    lng: 76.2673,
    timezone: 'Asia/Kolkata',
    description: 'A spice-trade port where Chinese fishing nets, Dutch palaces, and Kerala backwaters tell centuries of stories.',
    image_url: 'https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  // Southeast Asia
  {
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Bangkok',
    country: 'Thailand',
    lat: 13.7563,
    lng: 100.5018,
    timezone: 'Asia/Bangkok',
    description: 'Glittering temples rise beside neon-lit street markets in this endlessly vibrant capital.',
    image_url: 'https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    name: 'Siem Reap',
    country: 'Cambodia',
    lat: 13.3671,
    lng: 103.8448,
    timezone: 'Asia/Phnom_Penh',
    description: 'Gateway to the awe-inspiring temples of Angkor, wrapped in jungle and centuries of Khmer history.',
    image_url: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    name: 'Hanoi',
    country: 'Vietnam',
    lat: 21.0285,
    lng: 105.8542,
    timezone: 'Asia/Ho_Chi_Minh',
    description: 'A thousand-year-old capital where French-colonial charm mingles with incense-filled temples and phở stalls.',
    image_url: 'https://images.pexels.com/photos/2361600/pexels-photo-2361600.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000013',
    name: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    timezone: 'Asia/Singapore',
    description: 'A futuristic city-state where hawker centres, botanical gardens, and skyscrapers coexist in harmony.',
    image_url: 'https://images.pexels.com/photos/777059/pexels-photo-777059.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  // Americas
  {
    id: '00000000-0000-0000-0000-000000000020',
    name: 'New York',
    country: 'United States',
    lat: 40.7128,
    lng: -74.006,
    timezone: 'America/New_York',
    description: 'The city that never sleeps — iconic skyline, world-class museums, and stories on every street corner.',
    image_url: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000021',
    name: 'Mexico City',
    country: 'Mexico',
    lat: 19.4326,
    lng: -99.1332,
    timezone: 'America/Mexico_City',
    description: 'An Aztec capital reborn — murals by Rivera, floating gardens of Xochimilco, and world-beating tacos.',
    image_url: 'https://images.pexels.com/photos/3290068/pexels-photo-3290068.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000022',
    name: 'Buenos Aires',
    country: 'Argentina',
    lat: -34.6037,
    lng: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
    description: 'The Paris of South America — tango in the streets, steakhouses on every block, and faded grandeur everywhere.',
    image_url: 'https://images.pexels.com/photos/1060803/pexels-photo-1060803.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  // Europe
  {
    id: '00000000-0000-0000-0000-000000000030',
    name: 'Rome',
    country: 'Italy',
    lat: 41.9028,
    lng: 12.4964,
    timezone: 'Europe/Rome',
    description: 'The Eternal City where every cobblestone whispers of emperors, artists, and two millennia of history.',
    image_url: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000031',
    name: 'Lisbon',
    country: 'Portugal',
    lat: 38.7223,
    lng: -9.1393,
    timezone: 'Europe/Lisbon',
    description: 'Sun-drenched hills, rattling trams, fado music, and pastel tiles tell tales of maritime adventure.',
    image_url: 'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '00000000-0000-0000-0000-000000000032',
    name: 'Istanbul',
    country: 'Turkey',
    lat: 41.0082,
    lng: 28.9784,
    timezone: 'Europe/Istanbul',
    description: 'Straddling two continents, where Ottoman mosques, Byzantine mosaics, and grand bazaars collide.',
    image_url: 'https://images.pexels.com/photos/2048865/pexels-photo-2048865.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export const narrators: Narrator[] = [
  {
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Arjun',
    style: 'Historian',
    description: 'Academic perspective with verified historical sources',
    avatar_url: null,
    preview_audio_url: 'https://example.com/audio/preview-arjun.mp3',
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    name: 'Meera',
    style: 'Local',
    description: 'Warm local voice with neighbourhood insights',
    avatar_url: null,
    preview_audio_url: 'https://example.com/audio/preview-meera.mp3',
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    name: 'Kavya',
    style: 'Storyteller',
    description: 'Vivid narrative that brings legends and folklore alive',
    avatar_url: null,
    preview_audio_url: 'https://example.com/audio/preview-kavya.mp3',
  },
  {
    id: '00000000-0000-0000-0000-000000000013',
    name: 'Rohan',
    style: 'Explorer',
    description: 'Curious traveler perspective with hidden gems and tips',
    avatar_url: null,
    preview_audio_url: 'https://example.com/audio/preview-rohan.mp3',
  },
];

export const stories: Story[] = [
  {
    id: '00000000-0000-0000-0000-000000000100',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Lalbagh Botanical Garden',
    subtitle: 'A 240-year-old garden at the heart of the city',
    why_this_matters: "Hyder Ali's 18th-century vision of a world-class garden still anchors Bengaluru's green identity.",
    lat: 12.9507,
    lng: 77.5848,
    duration_seconds: 420,
    trust_level: 'verified',
    is_featured: true,
    image_url: 'https://images.pexels.com/photos/1485894/pexels-photo-1485894.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '00000000-0000-0000-0000-000000000101',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Vidhana Soudha',
    subtitle: "The seat of Karnataka's legislature",
    why_this_matters: "This neo-Dravidian masterpiece was built as a symbol of India's post-independence sovereignty.",
    lat: 12.9791,
    lng: 77.5913,
    duration_seconds: 360,
    trust_level: 'verified',
    is_featured: false,
    image_url: 'https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Bull Temple',
    subtitle: 'The sacred Nandi of Basavanagudi',
    why_this_matters: 'This 16th-century monolithic bull statue carries layers of myth, devotion, and neighbourhood ritual.',
    lat: 12.9432,
    lng: 77.5675,
    duration_seconds: 300,
    trust_level: 'legend',
    is_featured: false,
    image_url: 'https://images.pexels.com/photos/5765818/pexels-photo-5765818.jpeg?auto=compress&cs=tinysrgb&w=600',
    linkedBookableExperienceId: 'exp-001',
    linkedBookableExperienceSlug: 'heritage-old-bengaluru-walk',
    linkedBookableExperienceLabel: 'Book the guided Heritage Walk',
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Bangalore Palace',
    subtitle: 'Tudor-style architecture in tropical India',
    why_this_matters: 'Built in 1887, this palace reveals how colonial aesthetics blended with local royalty.',
    lat: 12.9987,
    lng: 77.5921,
    duration_seconds: 480,
    trust_level: 'verified',
    is_featured: false,
    image_url: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '00000000-0000-0000-0000-000000000104',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: "Tipu Sultan's Summer Palace",
    subtitle: 'An 18th-century indo-Islamic marvel',
    why_this_matters: "Tipu Sultan's teak palace is one of the last standing symbols of Mysore's resistance to British rule.",
    lat: 12.9593,
    lng: 77.5737,
    duration_seconds: 340,
    trust_level: 'verified',
    is_featured: false,
    image_url: 'https://images.pexels.com/photos/3522880/pexels-photo-3522880.jpeg?auto=compress&cs=tinysrgb&w=600',
    linkedBookableExperienceId: 'exp-003',
    linkedBookableExperienceSlug: 'malleswaram-food-walk',
    linkedBookableExperienceLabel: 'Book the Malleswaram Food Walk',
  },
  {
    id: '00000000-0000-0000-0000-000000000105',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Cubbon Park',
    subtitle: 'The green lung of the old cantonment',
    why_this_matters: "This 300-acre park was designed as a British recreation ground but became Bengaluru's public commons.",
    lat: 12.9763,
    lng: 77.5929,
    duration_seconds: 280,
    trust_level: 'verified',
    is_featured: false,
    image_url: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=600',
    linkedBookableExperienceId: 'exp-005',
    linkedBookableExperienceSlug: 'iskcon-temple-spiritual-tour',
    linkedBookableExperienceLabel: 'Book the ISKCON Spiritual Tour',
  },
  {
    id: '00000000-0000-0000-0000-000000000106',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'ISKCON Temple',
    subtitle: 'Modern devotion on a hilltop',
    why_this_matters: 'One of the largest ISKCON temples in the world, it bridges traditional Vaishnavism with modern architecture.',
    lat: 13.0098,
    lng: 77.5510,
    duration_seconds: 320,
    trust_level: 'verified',
    is_featured: false,
    image_url: 'https://images.pexels.com/photos/2846034/pexels-photo-2846034.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '00000000-0000-0000-0000-000000000107',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Ulsoor Lake',
    subtitle: 'A Kempegowda-era lake in the city centre',
    why_this_matters: "This 16th-century lake is a living example of Bengaluru's traditional water management system.",
    lat: 12.9830,
    lng: 77.6190,
    duration_seconds: 260,
    trust_level: 'mixed',
    is_featured: false,
    image_url: 'https://images.pexels.com/photos/2635815/pexels-photo-2635815.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '00000000-0000-0000-0000-000000000108',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Commercial Street',
    subtitle: "Bengaluru's oldest shopping district",
    why_this_matters: 'A century-old marketplace where bargaining rituals and silk trade traditions still thrive.',
    lat: 12.9818,
    lng: 77.6075,
    duration_seconds: 240,
    trust_level: 'legend',
    is_featured: false,
    image_url: 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '00000000-0000-0000-0000-000000000109',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Bangalore Fort',
    subtitle: "Remains of Kempegowda's mud citadel",
    why_this_matters: 'The original 1537 fort marks the founding spot of the city itself.',
    lat: 12.9611,
    lng: 77.5740,
    duration_seconds: 200,
    trust_level: 'verified',
    is_featured: false,
    image_url: 'https://images.pexels.com/photos/2765873/pexels-photo-2765873.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

export const storyNarrations: StoryNarration[] = [
  // Migration 1: Historian (Arjun) + Local (Meera) for all 10 stories
  { id: '00000000-0000-0000-0000-000000001000', story_id: '00000000-0000-0000-0000-000000000100', narrator_id: '00000000-0000-0000-0000-000000000010', audio_url: 'https://example.com/audio/lalbagh-historian.mp3', duration_seconds: 420 },
  { id: '00000000-0000-0000-0000-000000001001', story_id: '00000000-0000-0000-0000-000000000100', narrator_id: '00000000-0000-0000-0000-000000000011', audio_url: 'https://example.com/audio/lalbagh-local.mp3', duration_seconds: 380 },
  { id: '00000000-0000-0000-0000-000000001002', story_id: '00000000-0000-0000-0000-000000000101', narrator_id: '00000000-0000-0000-0000-000000000010', audio_url: 'https://example.com/audio/vidhana-historian.mp3', duration_seconds: 360 },
  { id: '00000000-0000-0000-0000-000000001003', story_id: '00000000-0000-0000-0000-000000000101', narrator_id: '00000000-0000-0000-0000-000000000011', audio_url: 'https://example.com/audio/vidhana-local.mp3', duration_seconds: 340 },
  { id: '00000000-0000-0000-0000-000000001004', story_id: '00000000-0000-0000-0000-000000000102', narrator_id: '00000000-0000-0000-0000-000000000010', audio_url: 'https://example.com/audio/bull-temple-historian.mp3', duration_seconds: 300 },
  { id: '00000000-0000-0000-0000-000000001005', story_id: '00000000-0000-0000-0000-000000000102', narrator_id: '00000000-0000-0000-0000-000000000011', audio_url: 'https://example.com/audio/bull-temple-local.mp3', duration_seconds: 280 },
  { id: '00000000-0000-0000-0000-000000001006', story_id: '00000000-0000-0000-0000-000000000103', narrator_id: '00000000-0000-0000-0000-000000000010', audio_url: 'https://example.com/audio/palace-historian.mp3', duration_seconds: 480 },
  { id: '00000000-0000-0000-0000-000000001007', story_id: '00000000-0000-0000-0000-000000000103', narrator_id: '00000000-0000-0000-0000-000000000011', audio_url: 'https://example.com/audio/palace-local.mp3', duration_seconds: 440 },
  { id: '00000000-0000-0000-0000-000000001008', story_id: '00000000-0000-0000-0000-000000000104', narrator_id: '00000000-0000-0000-0000-000000000010', audio_url: 'https://example.com/audio/tipu-historian.mp3', duration_seconds: 340 },
  { id: '00000000-0000-0000-0000-000000001009', story_id: '00000000-0000-0000-0000-000000000104', narrator_id: '00000000-0000-0000-0000-000000000011', audio_url: 'https://example.com/audio/tipu-local.mp3', duration_seconds: 310 },
  { id: '00000000-0000-0000-0000-000000001010', story_id: '00000000-0000-0000-0000-000000000105', narrator_id: '00000000-0000-0000-0000-000000000010', audio_url: 'https://example.com/audio/cubbon-historian.mp3', duration_seconds: 280 },
  { id: '00000000-0000-0000-0000-000000001011', story_id: '00000000-0000-0000-0000-000000000105', narrator_id: '00000000-0000-0000-0000-000000000011', audio_url: 'https://example.com/audio/cubbon-local.mp3', duration_seconds: 260 },
  { id: '00000000-0000-0000-0000-000000001012', story_id: '00000000-0000-0000-0000-000000000106', narrator_id: '00000000-0000-0000-0000-000000000010', audio_url: 'https://example.com/audio/iskcon-historian.mp3', duration_seconds: 320 },
  { id: '00000000-0000-0000-0000-000000001013', story_id: '00000000-0000-0000-0000-000000000106', narrator_id: '00000000-0000-0000-0000-000000000011', audio_url: 'https://example.com/audio/iskcon-local.mp3', duration_seconds: 300 },
  { id: '00000000-0000-0000-0000-000000001014', story_id: '00000000-0000-0000-0000-000000000107', narrator_id: '00000000-0000-0000-0000-000000000010', audio_url: 'https://example.com/audio/ulsoor-historian.mp3', duration_seconds: 260 },
  { id: '00000000-0000-0000-0000-000000001015', story_id: '00000000-0000-0000-0000-000000000107', narrator_id: '00000000-0000-0000-0000-000000000011', audio_url: 'https://example.com/audio/ulsoor-local.mp3', duration_seconds: 240 },
  { id: '00000000-0000-0000-0000-000000001016', story_id: '00000000-0000-0000-0000-000000000108', narrator_id: '00000000-0000-0000-0000-000000000010', audio_url: 'https://example.com/audio/commercial-historian.mp3', duration_seconds: 240 },
  { id: '00000000-0000-0000-0000-000000001017', story_id: '00000000-0000-0000-0000-000000000108', narrator_id: '00000000-0000-0000-0000-000000000011', audio_url: 'https://example.com/audio/commercial-local.mp3', duration_seconds: 220 },
  { id: '00000000-0000-0000-0000-000000001018', story_id: '00000000-0000-0000-0000-000000000109', narrator_id: '00000000-0000-0000-0000-000000000010', audio_url: 'https://example.com/audio/fort-historian.mp3', duration_seconds: 200 },
  { id: '00000000-0000-0000-0000-000000001019', story_id: '00000000-0000-0000-0000-000000000109', narrator_id: '00000000-0000-0000-0000-000000000011', audio_url: 'https://example.com/audio/fort-local.mp3', duration_seconds: 190 },
  // Migration 3: Storyteller (Kavya) + Explorer (Rohan) for all 10 stories
  { id: '00000000-0000-0000-0000-000000001020', story_id: '00000000-0000-0000-0000-000000000100', narrator_id: '00000000-0000-0000-0000-000000000012', audio_url: 'https://example.com/audio/lalbagh-storyteller.mp3', duration_seconds: 400 },
  { id: '00000000-0000-0000-0000-000000001021', story_id: '00000000-0000-0000-0000-000000000100', narrator_id: '00000000-0000-0000-0000-000000000013', audio_url: 'https://example.com/audio/lalbagh-explorer.mp3', duration_seconds: 350 },
  { id: '00000000-0000-0000-0000-000000001022', story_id: '00000000-0000-0000-0000-000000000101', narrator_id: '00000000-0000-0000-0000-000000000012', audio_url: 'https://example.com/audio/vidhana-storyteller.mp3', duration_seconds: 340 },
  { id: '00000000-0000-0000-0000-000000001023', story_id: '00000000-0000-0000-0000-000000000101', narrator_id: '00000000-0000-0000-0000-000000000013', audio_url: 'https://example.com/audio/vidhana-explorer.mp3', duration_seconds: 320 },
  { id: '00000000-0000-0000-0000-000000001024', story_id: '00000000-0000-0000-0000-000000000102', narrator_id: '00000000-0000-0000-0000-000000000012', audio_url: 'https://example.com/audio/bull-temple-storyteller.mp3', duration_seconds: 290 },
  { id: '00000000-0000-0000-0000-000000001025', story_id: '00000000-0000-0000-0000-000000000102', narrator_id: '00000000-0000-0000-0000-000000000013', audio_url: 'https://example.com/audio/bull-temple-explorer.mp3', duration_seconds: 260 },
  { id: '00000000-0000-0000-0000-000000001026', story_id: '00000000-0000-0000-0000-000000000103', narrator_id: '00000000-0000-0000-0000-000000000012', audio_url: 'https://example.com/audio/palace-storyteller.mp3', duration_seconds: 460 },
  { id: '00000000-0000-0000-0000-000000001027', story_id: '00000000-0000-0000-0000-000000000103', narrator_id: '00000000-0000-0000-0000-000000000013', audio_url: 'https://example.com/audio/palace-explorer.mp3', duration_seconds: 420 },
  { id: '00000000-0000-0000-0000-000000001028', story_id: '00000000-0000-0000-0000-000000000104', narrator_id: '00000000-0000-0000-0000-000000000012', audio_url: 'https://example.com/audio/tipu-storyteller.mp3', duration_seconds: 320 },
  { id: '00000000-0000-0000-0000-000000001029', story_id: '00000000-0000-0000-0000-000000000104', narrator_id: '00000000-0000-0000-0000-000000000013', audio_url: 'https://example.com/audio/tipu-explorer.mp3', duration_seconds: 290 },
  { id: '00000000-0000-0000-0000-000000001030', story_id: '00000000-0000-0000-0000-000000000105', narrator_id: '00000000-0000-0000-0000-000000000012', audio_url: 'https://example.com/audio/cubbon-storyteller.mp3', duration_seconds: 270 },
  { id: '00000000-0000-0000-0000-000000001031', story_id: '00000000-0000-0000-0000-000000000105', narrator_id: '00000000-0000-0000-0000-000000000013', audio_url: 'https://example.com/audio/cubbon-explorer.mp3', duration_seconds: 250 },
  { id: '00000000-0000-0000-0000-000000001032', story_id: '00000000-0000-0000-0000-000000000106', narrator_id: '00000000-0000-0000-0000-000000000012', audio_url: 'https://example.com/audio/iskcon-storyteller.mp3', duration_seconds: 310 },
  { id: '00000000-0000-0000-0000-000000001033', story_id: '00000000-0000-0000-0000-000000000106', narrator_id: '00000000-0000-0000-0000-000000000013', audio_url: 'https://example.com/audio/iskcon-explorer.mp3', duration_seconds: 280 },
  { id: '00000000-0000-0000-0000-000000001034', story_id: '00000000-0000-0000-0000-000000000107', narrator_id: '00000000-0000-0000-0000-000000000012', audio_url: 'https://example.com/audio/ulsoor-storyteller.mp3', duration_seconds: 250 },
  { id: '00000000-0000-0000-0000-000000001035', story_id: '00000000-0000-0000-0000-000000000107', narrator_id: '00000000-0000-0000-0000-000000000013', audio_url: 'https://example.com/audio/ulsoor-explorer.mp3', duration_seconds: 230 },
  { id: '00000000-0000-0000-0000-000000001036', story_id: '00000000-0000-0000-0000-000000000108', narrator_id: '00000000-0000-0000-0000-000000000012', audio_url: 'https://example.com/audio/commercial-storyteller.mp3', duration_seconds: 230 },
  { id: '00000000-0000-0000-0000-000000001037', story_id: '00000000-0000-0000-0000-000000000108', narrator_id: '00000000-0000-0000-0000-000000000013', audio_url: 'https://example.com/audio/commercial-explorer.mp3', duration_seconds: 210 },
  { id: '00000000-0000-0000-0000-000000001038', story_id: '00000000-0000-0000-0000-000000000109', narrator_id: '00000000-0000-0000-0000-000000000012', audio_url: 'https://example.com/audio/fort-storyteller.mp3', duration_seconds: 190 },
  { id: '00000000-0000-0000-0000-000000001039', story_id: '00000000-0000-0000-0000-000000000109', narrator_id: '00000000-0000-0000-0000-000000000013', audio_url: 'https://example.com/audio/fort-explorer.mp3', duration_seconds: 180 },
];

export const quickModeContent: QuickModeContent[] = [
  // quick_facts
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'quick_facts', title: 'Founded in 1537', body: 'Kempegowda I, a feudal lord under the Vijayanagara Empire, built a mud fort here that gave birth to the city.', sort_order: 1, trust_level: 'verified', duration_seconds: 90 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'quick_facts', title: 'Garden City', body: 'Bengaluru has over 1,000 hectares of parks, earning its nickname. The pleasant climate at 920m altitude supports year-round greenery.', sort_order: 2, trust_level: 'verified', duration_seconds: 75 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'quick_facts', title: 'Tech Capital', body: "Home to over 10,000 tech companies and India's largest startup ecosystem, the city generates a third of India's IT exports.", sort_order: 3, trust_level: 'verified', duration_seconds: 60 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'quick_facts', title: 'Diverse Food Scene', body: "From Vidyarthi Bhavan's dosas since 1943 to modern craft breweries, the city bridges traditional South Indian cuisine with global flavours.", sort_order: 4, trust_level: 'verified', duration_seconds: 80 },
  // look_for
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'look_for', title: 'Art Deco on MG Road', body: 'Look up at the buildings along MG Road and Brigade Road for faded Art Deco facades from the 1930s-40s, often hidden behind modern signage.', sort_order: 1, trust_level: 'verified', duration_seconds: 60 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'look_for', title: 'Rain Trees', body: "Bengaluru's iconic canopy comes from Samanea saman trees planted in the 19th century. Their umbrella-shaped crowns define the old neighbourhoods.", sort_order: 2, trust_level: 'verified', duration_seconds: 70 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'look_for', title: 'Step Wells', body: 'Several historic kalyani (step wells) survive near old temples. The one at Someshwara Temple in Ulsoor dates to the Chola period.', sort_order: 3, trust_level: 'legend', duration_seconds: 65 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'look_for', title: 'Kempegowda Towers', body: 'Four watchtowers marking the original city limits still stand. Spot them at Lalbagh, Ulsoor, Mekhri Circle, and Kempambudhi Lake.', sort_order: 4, trust_level: 'verified', duration_seconds: 55 },
  // respect
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'respect', title: 'Remove Shoes at Temples', body: 'Always remove footwear before entering any temple. Shoe storage is usually available at the entrance. This applies to all Hindu, Jain, and most Buddhist sites.', sort_order: 1, trust_level: 'verified', duration_seconds: 45 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'respect', title: 'Right Hand for Giving', body: 'When handing money, food, or gifts to anyone, always use your right hand. The left hand is considered unclean in Indian culture.', sort_order: 2, trust_level: 'verified', duration_seconds: 40 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'respect', title: 'Photography in Sacred Spaces', body: 'Ask before photographing inside temples or during rituals. Many inner sanctums prohibit cameras entirely. Respect posted signs.', sort_order: 3, trust_level: 'verified', duration_seconds: 50 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'respect', title: 'Dress Modestly at Religious Sites', body: 'Cover shoulders and knees when visiting temples. Some sites offer wraps at the entrance if needed.', sort_order: 4, trust_level: 'verified', duration_seconds: 35 },
  // stay_safe
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'stay_safe', title: 'Auto Rickshaw Pricing', body: 'Always insist on the meter or agree on a fare before getting in. The base fare is around 30 INR. Use apps like Ola/Uber for transparent pricing.', sort_order: 1, trust_level: 'verified', duration_seconds: 60 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'stay_safe', title: 'Street Food Hygiene', body: 'Stick to busy stalls with high turnover. Avoid pre-cut fruits from street vendors. Bottled water is widely available and inexpensive.', sort_order: 2, trust_level: 'verified', duration_seconds: 55 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'stay_safe', title: 'Unofficial Tour Guides', body: "At popular landmarks like Tipu Sultan's Palace, unofficial guides may approach offering tours at inflated prices. Official guides have ID badges.", sort_order: 3, trust_level: 'verified', duration_seconds: 50 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'stay_safe', title: 'Traffic Awareness', body: 'Pedestrian crossings are suggestions, not rules. Always look both ways even on one-way streets. Cross with a group of locals when possible.', sort_order: 4, trust_level: 'verified', duration_seconds: 45 },
  // languages
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'languages', title: 'Kannada is Primary', body: 'Kannada is the official language. While English and Hindi are widely understood in tech areas, learning a few Kannada phrases shows respect.', sort_order: 1, trust_level: 'verified', duration_seconds: 60 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'languages', title: 'Useful Phrases', body: 'Namaskara (Hello), Dhanyavadagalu (Thank you), Hegiddira (How are you?), Eshthu (How much?). Locals appreciate even basic attempts.', sort_order: 2, trust_level: 'verified', duration_seconds: 70 },
  { city_id: '00000000-0000-0000-0000-000000000001', mode: 'languages', title: 'Script and Signage', body: 'Kannada script appears on all official signs alongside English. Metro and bus signs are bilingual. Google Translate works well for Kannada.', sort_order: 3, trust_level: 'verified', duration_seconds: 50 },
];

export const storySources: StorySource[] = [
  // Lalbagh
  { story_id: '00000000-0000-0000-0000-000000000100', label: 'Karnataka Gazetteer: Lalbagh History', url: 'https://example.com/sources/lalbagh-gazetteer', source_type: 'academic', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000100', label: 'Head Gardener Oral Account, 2019', url: 'https://example.com/sources/lalbagh-oral', source_type: 'oral', sort_order: 2 },
  { story_id: '00000000-0000-0000-0000-000000000100', label: 'ASI Conservation Report', url: 'https://example.com/sources/lalbagh-asi', source_type: 'archive', sort_order: 3 },
  // Vidhana Soudha
  { story_id: '00000000-0000-0000-0000-000000000101', label: 'Architecture of Independent India, K. Doshi', url: 'https://example.com/sources/vidhana-doshi', source_type: 'academic', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000101', label: 'Deccan Herald Archives, 1956', url: 'https://example.com/sources/vidhana-herald', source_type: 'news', sort_order: 2 },
  // Bull Temple
  { story_id: '00000000-0000-0000-0000-000000000102', label: 'Folklore of Southern Karnataka, M. Rao', url: 'https://example.com/sources/bull-folklore', source_type: 'academic', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000102', label: 'Temple Priest Interview, 2021', url: 'https://example.com/sources/bull-priest', source_type: 'oral', sort_order: 2 },
  // Bangalore Palace
  { story_id: '00000000-0000-0000-0000-000000000103', label: 'Mysore Royal Family Archives', url: 'https://example.com/sources/palace-archives', source_type: 'archive', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000103', label: 'Indo-Colonial Architecture Review, 2018', url: 'https://example.com/sources/palace-review', source_type: 'academic', sort_order: 2 },
  // Tipu Sultan Palace
  { story_id: '00000000-0000-0000-0000-000000000104', label: 'Tipu Sultan: A Life History, K. Brittlebank', url: 'https://example.com/sources/tipu-brittlebank', source_type: 'academic', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000104', label: 'ASI Monument Report', url: 'https://example.com/sources/tipu-asi', source_type: 'archive', sort_order: 2 },
  { story_id: '00000000-0000-0000-0000-000000000104', label: 'The Hindu Heritage Feature', url: 'https://example.com/sources/tipu-hindu', source_type: 'news', sort_order: 3 },
  // Cubbon Park
  { story_id: '00000000-0000-0000-0000-000000000105', label: 'Bengaluru Green Spaces Study, IISc 2020', url: 'https://example.com/sources/cubbon-iisc', source_type: 'academic', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000105', label: 'Park Ranger Community Stories', url: 'https://example.com/sources/cubbon-ranger', source_type: 'oral', sort_order: 2 },
  // ISKCON Temple
  { story_id: '00000000-0000-0000-0000-000000000106', label: 'ISKCON Official History', url: 'https://example.com/sources/iskcon-official', source_type: 'archive', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000106', label: 'Modern Temple Architecture in India, 2017', url: 'https://example.com/sources/iskcon-architecture', source_type: 'academic', sort_order: 2 },
  // Ulsoor Lake
  { story_id: '00000000-0000-0000-0000-000000000107', label: 'Bengaluru Lake Conservation Report, 2022', url: 'https://example.com/sources/ulsoor-conservation', source_type: 'academic', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000107', label: 'Fishermen Community Oral History', url: 'https://example.com/sources/ulsoor-fishermen', source_type: 'oral', sort_order: 2 },
  // Commercial Street
  { story_id: '00000000-0000-0000-0000-000000000108', label: 'Bazaars of Bangalore, S. Nair', url: 'https://example.com/sources/commercial-nair', source_type: 'academic', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000108', label: 'Shopkeeper Interviews, 2023', url: 'https://example.com/sources/commercial-shopkeepers', source_type: 'oral', sort_order: 2 },
  // Bangalore Fort
  { story_id: '00000000-0000-0000-0000-000000000109', label: 'Kempegowda and the Founding of Bangalore, R. Narasimhachar', url: 'https://example.com/sources/fort-narasimhachar', source_type: 'academic', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000109', label: 'ASI Excavation Notes, 2015', url: 'https://example.com/sources/fort-asi', source_type: 'archive', sort_order: 2 },
];

export const storyNotices: StoryNotice[] = [
  // Lalbagh
  { story_id: '00000000-0000-0000-0000-000000000100', body: 'Look for the 3,000-million-year-old rock formation near the Glass House \u2014 one of the oldest exposed rocks on Earth.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000100', body: "Notice how the pathways radiate outward from the central bandstand, following Hyder Ali's original French garden layout.", sort_order: 2 },
  // Vidhana Soudha
  { story_id: '00000000-0000-0000-0000-000000000101', body: 'The inscription above the entrance reads "Government Work is God\'s Work" in Kannada \u2014 a deliberate post-independence statement.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000101', body: 'Count the granite pillars: there are over 300, each hand-carved by artisans from across Karnataka.', sort_order: 2 },
  // Bull Temple
  { story_id: '00000000-0000-0000-0000-000000000102', body: 'The Nandi statue appears to grow slightly each year due to the constant application of coconut oil and butter by devotees.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000102', body: 'Notice the peanut offerings \u2014 they connect to the annual Kadalekai Parishe groundnut fair held just outside.', sort_order: 2 },
  // Bangalore Palace
  { story_id: '00000000-0000-0000-0000-000000000103', body: 'The fortified towers and turrets are directly inspired by Windsor Castle, which the young Maharaja visited in 1887.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000103', body: 'Look for the ornate woodwork on the ceiling of the Durbar Hall \u2014 it mixes floral Victorian patterns with Mysore rosewood craft.', sort_order: 2 },
  // Tipu Sultan Palace
  { story_id: '00000000-0000-0000-0000-000000000104', body: 'The entire structure is built from teak wood without a single nail \u2014 the joints use traditional mortise-and-tenon joinery.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000104', body: 'Look up at the painted arches showing floral motifs \u2014 they blend Persian artistic traditions with South Indian temple art.', sort_order: 2 },
  // Cubbon Park
  { story_id: '00000000-0000-0000-0000-000000000105', body: 'The bamboo grove near the library is home to over 60 bird species \u2014 listen for the distinctive call of the Asian Koel.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000105', body: 'Notice the red-painted Victorian bandstand at the centre \u2014 it still hosts occasional weekend concerts.', sort_order: 2 },
  // ISKCON Temple
  { story_id: '00000000-0000-0000-0000-000000000106', body: 'The main gopuram blends traditional Dravidian temple architecture with modern glass and steel elements.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000106', body: 'The Vedic art gallery on the lower level contains 3D dioramas that took artisans over five years to complete.', sort_order: 2 },
  // Ulsoor Lake
  { story_id: '00000000-0000-0000-0000-000000000107', body: 'The small island in the centre is accessible only by boat and contains a shrine that predates the British cantonment.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000107', body: 'Watch for cormorants drying their wings on the boundary stones \u2014 a sign the lake ecosystem is recovering.', sort_order: 2 },
  // Commercial Street
  { story_id: '00000000-0000-0000-0000-000000000108', body: 'The oldest shops near the Jumma Masjid end have been run by the same families for over four generations.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000108', body: 'Look up above the modern signage to spot original Art Deco facades from the 1930s still intact on upper floors.', sort_order: 2 },
  // Bangalore Fort
  { story_id: '00000000-0000-0000-0000-000000000109', body: 'The Delhi Gate still has visible cannon ball marks from the 1791 siege when Cornwallis attacked Tipu Sultan.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000109', body: "Notice the Ganapathi temple built into the fort walls \u2014 it has been in continuous worship since Kempegowda's time.", sort_order: 2 },
];

export const storyRelated: StoryRelated[] = [
  // Lalbagh -> Cubbon Park (same_theme), Bull Temple (nearby)
  { story_id: '00000000-0000-0000-0000-000000000100', related_story_id: '00000000-0000-0000-0000-000000000105', relationship: 'same_theme', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000100', related_story_id: '00000000-0000-0000-0000-000000000102', relationship: 'nearby', sort_order: 2 },
  // Vidhana Soudha -> Cubbon Park (nearby), Bangalore Palace (same_era)
  { story_id: '00000000-0000-0000-0000-000000000101', related_story_id: '00000000-0000-0000-0000-000000000105', relationship: 'nearby', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000101', related_story_id: '00000000-0000-0000-0000-000000000103', relationship: 'same_era', sort_order: 2 },
  // Bull Temple -> Bangalore Fort (same_era), Lalbagh (nearby)
  { story_id: '00000000-0000-0000-0000-000000000102', related_story_id: '00000000-0000-0000-0000-000000000109', relationship: 'same_era', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000102', related_story_id: '00000000-0000-0000-0000-000000000100', relationship: 'nearby', sort_order: 2 },
  // Bangalore Palace -> Vidhana Soudha (same_theme), Tipu Palace (same_theme)
  { story_id: '00000000-0000-0000-0000-000000000103', related_story_id: '00000000-0000-0000-0000-000000000101', relationship: 'same_theme', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000103', related_story_id: '00000000-0000-0000-0000-000000000104', relationship: 'same_theme', sort_order: 2 },
  // Tipu Palace -> Bangalore Fort (same_era), Bangalore Palace (same_theme)
  { story_id: '00000000-0000-0000-0000-000000000104', related_story_id: '00000000-0000-0000-0000-000000000109', relationship: 'same_era', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000104', related_story_id: '00000000-0000-0000-0000-000000000103', relationship: 'same_theme', sort_order: 2 },
  // Cubbon Park -> Vidhana Soudha (nearby), Ulsoor Lake (same_theme)
  { story_id: '00000000-0000-0000-0000-000000000105', related_story_id: '00000000-0000-0000-0000-000000000101', relationship: 'nearby', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000105', related_story_id: '00000000-0000-0000-0000-000000000107', relationship: 'same_theme', sort_order: 2 },
  // ISKCON -> Bangalore Palace (nearby), Bull Temple (same_theme)
  { story_id: '00000000-0000-0000-0000-000000000106', related_story_id: '00000000-0000-0000-0000-000000000103', relationship: 'nearby', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000106', related_story_id: '00000000-0000-0000-0000-000000000102', relationship: 'same_theme', sort_order: 2 },
  // Ulsoor Lake -> Commercial Street (nearby), Cubbon Park (same_theme)
  { story_id: '00000000-0000-0000-0000-000000000107', related_story_id: '00000000-0000-0000-0000-000000000108', relationship: 'nearby', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000107', related_story_id: '00000000-0000-0000-0000-000000000105', relationship: 'same_theme', sort_order: 2 },
  // Commercial Street -> Ulsoor Lake (nearby), Bangalore Fort (same_era)
  { story_id: '00000000-0000-0000-0000-000000000108', related_story_id: '00000000-0000-0000-0000-000000000107', relationship: 'nearby', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000108', related_story_id: '00000000-0000-0000-0000-000000000109', relationship: 'same_era', sort_order: 2 },
  // Bangalore Fort -> Tipu Palace (same_era), Bull Temple (same_era)
  { story_id: '00000000-0000-0000-0000-000000000109', related_story_id: '00000000-0000-0000-0000-000000000104', relationship: 'same_era', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000109', related_story_id: '00000000-0000-0000-0000-000000000102', relationship: 'same_era', sort_order: 2 },
];

export const storyPracticalCues: StoryPracticalCue[] = [
  // Lalbagh
  { story_id: '00000000-0000-0000-0000-000000000100', cue_type: 'respect', title: 'Quiet near flower shows', body: 'During biannual flower shows the garden gets crowded. Keep voices low near the Glass House exhibition area.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000100', cue_type: 'stay_safe', title: 'Uneven paths', body: 'Some paths near the rock formation have uneven stones. Wear sturdy footwear, especially after rain.', sort_order: 2 },
  { story_id: '00000000-0000-0000-0000-000000000100', cue_type: 'languages', title: 'Garden signage', body: 'Plant labels are in Kannada, English, and Latin. The entry ticket booth staff speak English and Kannada.', sort_order: 3 },
  // Vidhana Soudha
  { story_id: '00000000-0000-0000-0000-000000000101', cue_type: 'respect', title: 'No public entry', body: 'The building is a working legislature. Public entry is restricted to specific galleries during sessions only.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000101', cue_type: 'stay_safe', title: 'Security zone', body: 'Heavy security around the building. Photography of the exterior is allowed but avoid photographing security personnel.', sort_order: 2 },
  // Bull Temple
  { story_id: '00000000-0000-0000-0000-000000000102', cue_type: 'respect', title: 'Remove footwear', body: 'Shoes must be removed before entering the temple. Free shoe storage is available at the entrance.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000102', cue_type: 'respect', title: 'Join the ritual', body: "Visitors are welcome to participate in the evening aarti. Stand respectfully and follow others' lead.", sort_order: 2 },
  { story_id: '00000000-0000-0000-0000-000000000102', cue_type: 'languages', title: 'Temple language', body: 'Priests speak Kannada and some Hindi. Basic English is understood. "Namaskara" is appreciated.', sort_order: 3 },
  // Bangalore Palace
  { story_id: '00000000-0000-0000-0000-000000000103', cue_type: 'stay_safe', title: 'Camera fees', body: 'Photography inside requires a separate ticket (extra 200 INR). Video recording is not permitted.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000103', cue_type: 'respect', title: 'Private property', body: 'The palace is still owned by the Mysore royal family. Respect roped-off areas and do not touch artefacts.', sort_order: 2 },
  // Tipu Sultan Palace
  { story_id: '00000000-0000-0000-0000-000000000104', cue_type: 'respect', title: 'Modest dress', body: 'As a historical monument with religious significance, cover shoulders and knees when visiting.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000104', cue_type: 'stay_safe', title: 'Official guides only', body: 'Use only ASI-certified guides with visible ID badges. Unofficial guides may give inaccurate information.', sort_order: 2 },
  { story_id: '00000000-0000-0000-0000-000000000104', cue_type: 'languages', title: 'Audio guide', body: 'ASI provides audio guides in English, Kannada, and Hindi at the ticket counter for 50 INR.', sort_order: 3 },
  // Cubbon Park
  { story_id: '00000000-0000-0000-0000-000000000105', cue_type: 'stay_safe', title: 'After dark', body: 'The park is well-patrolled until sunset. Avoid the interior paths after dark as lighting is limited.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000105', cue_type: 'respect', title: 'Wildlife corridors', body: 'Stay on marked paths. The park is home to monitor lizards and nesting birds in certain areas.', sort_order: 2 },
  // ISKCON
  { story_id: '00000000-0000-0000-0000-000000000106', cue_type: 'respect', title: 'Dress code enforced', body: 'The temple enforces a dress code. Shorts, sleeveless tops, and short skirts are not permitted inside.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000106', cue_type: 'stay_safe', title: 'Queue times', body: 'Weekend evenings see 1-2 hour queues for darshan. Weekday mornings are significantly quieter.', sort_order: 2 },
  { story_id: '00000000-0000-0000-0000-000000000106', cue_type: 'languages', title: 'Multilingual campus', body: 'Signs and announcements are in Kannada, English, Hindi, and Sanskrit. Staff speak multiple languages.', sort_order: 3 },
  // Ulsoor Lake
  { story_id: '00000000-0000-0000-0000-000000000107', cue_type: 'stay_safe', title: 'Boat safety', body: 'Use only official BBMP boats with life jackets. Avoid private operators offering cheaper rides.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000107', cue_type: 'respect', title: 'Fishing community', body: 'The lake supports a small fishing community. Do not disturb their nets or equipment along the banks.', sort_order: 2 },
  // Commercial Street
  { story_id: '00000000-0000-0000-0000-000000000108', cue_type: 'stay_safe', title: 'Watch your belongings', body: 'The market gets extremely crowded, especially on weekends. Keep valuables in front pockets.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000108', cue_type: 'stay_safe', title: 'Bargaining expected', body: 'Vendors expect negotiation. Start at 40-50% of the quoted price and work upward.', sort_order: 2 },
  { story_id: '00000000-0000-0000-0000-000000000108', cue_type: 'languages', title: 'Market phrases', body: 'Learn "Eshthu" (how much?) in Kannada. Most shopkeepers also speak Hindi and English.', sort_order: 3 },
  // Bangalore Fort
  { story_id: '00000000-0000-0000-0000-000000000109', cue_type: 'respect', title: 'Heritage site', body: 'Do not climb on walls or touch the cannon ball marks. This is a protected ASI monument.', sort_order: 1 },
  { story_id: '00000000-0000-0000-0000-000000000109', cue_type: 'stay_safe', title: 'Surrounding area', body: 'The fort is in a busy market area. Cross roads carefully and watch for traffic near the gates.', sort_order: 2 },
];

export const cityPacks: CityPack[] = [
  {
    id: '00000000-0000-0000-0000-000000000201',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Heritage Walk',
    subtitle: "Trace Bengaluru's rich history through its iconic landmarks",
    image_url: 'https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=600',
    story_count: 4,
    total_duration_seconds: 1650,
    sort_order: 1,
    coin_cost: 12,
  },
  {
    id: '00000000-0000-0000-0000-000000000202',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Temple Trail',
    subtitle: 'Sacred spaces and the legends that shaped them',
    image_url: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=600',
    story_count: 3,
    total_duration_seconds: 1010,
    sort_order: 2,
    coin_cost: 10,
  },
  {
    id: '00000000-0000-0000-0000-000000000203',
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Garden City',
    subtitle: 'Discover the green lungs that give Bengaluru its name',
    image_url: 'https://images.pexels.com/photos/158028/bellingrath-gardens-702702-702700-702698-158028.jpeg?auto=compress&cs=tinysrgb&w=600',
    story_count: 3,
    total_duration_seconds: 760,
    sort_order: 3,
    coin_cost: 10,
  },
];

export const cityPackStories: CityPackStory[] = [
  // Heritage Walk
  { id: '00000000-0000-0000-0000-000000000301', pack_id: '00000000-0000-0000-0000-000000000201', story_id: '00000000-0000-0000-0000-000000000101', sort_order: 1 },
  { id: '00000000-0000-0000-0000-000000000302', pack_id: '00000000-0000-0000-0000-000000000201', story_id: '00000000-0000-0000-0000-000000000103', sort_order: 2 },
  { id: '00000000-0000-0000-0000-000000000303', pack_id: '00000000-0000-0000-0000-000000000201', story_id: '00000000-0000-0000-0000-000000000104', sort_order: 3 },
  { id: '00000000-0000-0000-0000-000000000304', pack_id: '00000000-0000-0000-0000-000000000201', story_id: '00000000-0000-0000-0000-000000000109', sort_order: 4 },
  // Temple Trail
  { id: '00000000-0000-0000-0000-000000000305', pack_id: '00000000-0000-0000-0000-000000000202', story_id: '00000000-0000-0000-0000-000000000102', sort_order: 1 },
  { id: '00000000-0000-0000-0000-000000000306', pack_id: '00000000-0000-0000-0000-000000000202', story_id: '00000000-0000-0000-0000-000000000106', sort_order: 2 },
  { id: '00000000-0000-0000-0000-000000000307', pack_id: '00000000-0000-0000-0000-000000000202', story_id: '00000000-0000-0000-0000-000000000104', sort_order: 3 },
  // Garden City
  { id: '00000000-0000-0000-0000-000000000308', pack_id: '00000000-0000-0000-0000-000000000203', story_id: '00000000-0000-0000-0000-000000000100', sort_order: 1 },
  { id: '00000000-0000-0000-0000-000000000309', pack_id: '00000000-0000-0000-0000-000000000203', story_id: '00000000-0000-0000-0000-000000000105', sort_order: 2 },
  { id: '00000000-0000-0000-0000-000000000310', pack_id: '00000000-0000-0000-0000-000000000203', story_id: '00000000-0000-0000-0000-000000000107', sort_order: 3 },
];

export const topics: Topic[] = [
  { id: '00000000-0000-0000-0000-000000000401', city_id: '00000000-0000-0000-0000-000000000001', title: 'Temples & Mythology', subtitle: 'Sacred stories etched in stone', icon_name: 'Flame', story_count: 3, sort_order: 1 },
  { id: '00000000-0000-0000-0000-000000000402', city_id: '00000000-0000-0000-0000-000000000001', title: 'Colonial History', subtitle: 'The British chapter of the Garden City', icon_name: 'Landmark', story_count: 3, sort_order: 2 },
  { id: '00000000-0000-0000-0000-000000000403', city_id: '00000000-0000-0000-0000-000000000001', title: 'Parks & Nature', subtitle: 'Green spaces, botanical wonders, and lakeside calm', icon_name: 'TreePine', story_count: 3, sort_order: 3 },
  { id: '00000000-0000-0000-0000-000000000404', city_id: '00000000-0000-0000-0000-000000000001', title: 'Markets & Culture', subtitle: 'The living pulse of Bengaluru', icon_name: 'Store', story_count: 2, sort_order: 4 },
];

export const topicStories: TopicStory[] = [
  // Temples & Mythology
  { id: '00000000-0000-0000-0000-000000000501', topic_id: '00000000-0000-0000-0000-000000000401', story_id: '00000000-0000-0000-0000-000000000102', sort_order: 1 },
  { id: '00000000-0000-0000-0000-000000000502', topic_id: '00000000-0000-0000-0000-000000000401', story_id: '00000000-0000-0000-0000-000000000106', sort_order: 2 },
  { id: '00000000-0000-0000-0000-000000000503', topic_id: '00000000-0000-0000-0000-000000000401', story_id: '00000000-0000-0000-0000-000000000104', sort_order: 3 },
  // Colonial History
  { id: '00000000-0000-0000-0000-000000000504', topic_id: '00000000-0000-0000-0000-000000000402', story_id: '00000000-0000-0000-0000-000000000101', sort_order: 1 },
  { id: '00000000-0000-0000-0000-000000000505', topic_id: '00000000-0000-0000-0000-000000000402', story_id: '00000000-0000-0000-0000-000000000103', sort_order: 2 },
  { id: '00000000-0000-0000-0000-000000000506', topic_id: '00000000-0000-0000-0000-000000000402', story_id: '00000000-0000-0000-0000-000000000105', sort_order: 3 },
  // Parks & Nature
  { id: '00000000-0000-0000-0000-000000000507', topic_id: '00000000-0000-0000-0000-000000000403', story_id: '00000000-0000-0000-0000-000000000100', sort_order: 1 },
  { id: '00000000-0000-0000-0000-000000000508', topic_id: '00000000-0000-0000-0000-000000000403', story_id: '00000000-0000-0000-0000-000000000105', sort_order: 2 },
  { id: '00000000-0000-0000-0000-000000000509', topic_id: '00000000-0000-0000-0000-000000000403', story_id: '00000000-0000-0000-0000-000000000107', sort_order: 3 },
  // Markets & Culture
  { id: '00000000-0000-0000-0000-000000000510', topic_id: '00000000-0000-0000-0000-000000000404', story_id: '00000000-0000-0000-0000-000000000108', sort_order: 1 },
  { id: '00000000-0000-0000-0000-000000000511', topic_id: '00000000-0000-0000-0000-000000000404', story_id: '00000000-0000-0000-0000-000000000109', sort_order: 2 },
];

export const coupons: Coupon[] = [
  { code: 'GAMANA50', coin_value: 50, max_uses: 0, description: 'Welcome promo - 50 free coins' },
  { code: 'HERITAGE25', coin_value: 25, max_uses: 100, description: 'Heritage walk promo - 25 coins' },
  { code: 'BENGALURU100', coin_value: 100, max_uses: 50, description: 'Bengaluru city launch - 100 coins' },
];
