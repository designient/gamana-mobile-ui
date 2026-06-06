import type { Experience } from '../types/experience';
import { bokunDefaults, mockReviews, pickupItinerary } from './experience-seed-helpers';

const IMG = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

type RichOverlay = Partial<Experience>;

const bokun = (vendorId: string) => bokunDefaults(vendorId);

export const RICH_OVERLAYS: Record<string, RichOverlay> = {
  'exp-001': {
    operatorDisplayName: 'Gamana Experiences',
    groupType: 'small_group',
    freeCancellationHours: 24,
    photoUrls: [IMG(5765818), IMG(3522880), IMG(3581368)],
    highlights: [
      'Explore Basavanagudi lanes with a licensed heritage guide',
      'Stop at Bull Temple with optional Gamana audio story',
      'Visit Chickpet wholesale markets and hidden courtyards',
      'Taste filter coffee at a century-old café',
      'Small groups for easier conversation and pacing',
    ],
    itinerary: pickupItinerary('Bengaluru', {
      id: 'heritage-walk',
      title: 'Old Bengaluru heritage circuit',
      subtitle: 'Basavanagudi · Chickpet',
      activities: ['Temple visit', 'Market walk', 'Coffee stop'],
      isMainStop: true,
    }),
    whatToBring: ['Comfortable walking shoes', 'Sun hat', 'Water bottle'],
    notSuitableFor: ['Guests with limited mobility on uneven lanes'],
    importantInformation: ['Modest dress required at temple stops', 'Tour runs rain or shine'],
    reviewSummary: mockReviews(128, 4.8, [
      { author: 'Priya M.', text: 'Perfect blend of history and neighbourhood life—not a rushed bus tour.', rating: 5 },
      { author: 'James T.', text: 'The linked Gamana story at Bull Temple made the stop unforgettable.', rating: 5 },
    ]),
  },
  'exp-002': {
    ...bokun('vendor-karnataka-heritage'),
    photoUrls: [IMG(3522880), IMG(5765818), IMG(2846217)],
    longDescription:
      "Step inside Tipu Sultan's teak summer palace and trace Mysore's resistance to British expansion with an expert guide. You'll explore Indo-Islamic architecture, military history, and the fort precinct with time for questions and photos at each major stop.",
    highlights: [
      'Skip the queue with pre-arranged palace entry',
      'Expert commentary on Tipu Sultan and the Anglo-Mysore wars',
      'Explore palace interiors and surrounding fort remains',
      'Optional hotel pickup in central Bengaluru',
      "Ideal pairing with Gamana's Tipu Sultan audio story",
    ],
    itinerary: pickupItinerary('Bengaluru', {
      id: 'tipu-palace',
      title: "Tipu Sultan's Summer Palace",
      activities: ['Palace entry', 'Guided interiors tour', 'Fort precinct walk'],
      isMainStop: true,
    }),
    whatToBring: ['Photo ID', 'Comfortable shoes'],
    notSuitableFor: ['Very young children without supervision on busy roads'],
    importantInformation: ['Photography restrictions may apply in some rooms'],
    reviewSummary: mockReviews(342, 4.6, [
      { author: 'Anita R.', text: 'Guide was knowledgeable and pacing was relaxed.', rating: 5 },
      { author: 'Marco L.', text: 'Worth it for the palace interiors alone.', rating: 4 },
    ]),
  },
  'exp-003': {
    ...bokun('vendor-blr-food'),
    photoUrls: [IMG(9585454), IMG(1485894), IMG(1179229)],
    longDescription:
      'Discover Malleswaram through its tiffin counters, filter coffee houses, and market snacks. Your guide introduces each stop with context on South Indian breakfast culture while you sample dosas, sweets, and seasonal specialties in a residential quarter tourists often miss.',
    highlights: [
      'Six curated tastings across iconic local spots',
      'Learn the story behind filter coffee and tiffin culture',
      'Walk a safe, guide-led route away from tourist traps',
      'Vegetarian-friendly options throughout',
      'Morning departure for freshest counters',
    ],
    itinerary: pickupItinerary('Bengaluru', {
      id: 'malleswaram',
      title: 'Malleswaram food circuit',
      activities: ['Coffee house', 'Dosa counter', 'Market snacks', 'Sweet shop'],
      isMainStop: true,
    }),
    whatToBring: ['Light appetite', 'Cash for optional extras'],
    notSuitableFor: ['Guests with severe food allergies without prior notice'],
    importantInformation: ['Notify guide of dietary restrictions when booking'],
    reviewSummary: mockReviews(89, 4.9, [
      { author: 'Sneha K.', text: 'Best food walk we did in India—authentic and filling.', rating: 5 },
    ]),
  },
  'exp-004': {
    ...bokun('vendor-blr-nature'),
    photoUrls: [IMG(1179229), IMG(1485894), IMG(5765818)],
    longDescription:
      "Join a naturalist for an early walk through Cubbon Park's colonial-era layout, specimen trees, and bird habitats. The route covers the bandstand, statuary, and quieter groves while your guide points out seasonal flora and common urban wildlife.",
    highlights: [
      'Dawn start for birds and cooler temperatures',
      'Naturalist guide with local ecology expertise',
      'Colonial history woven into botanical commentary',
      'Flat, accessible paths within the main park',
      'Pairs with Gamana Cubbon Park audio story',
    ],
    itinerary: pickupItinerary('Bengaluru', {
      id: 'cubbon',
      title: 'Cubbon Park',
      activities: ['Guided nature walk', 'Bird spotting', 'Heritage statuary'],
      isMainStop: true,
    }),
    whatToBring: ['Binoculars optional', 'Mosquito repellent'],
    notSuitableFor: [],
    reviewSummary: mockReviews(56, 4.5, [
      { author: 'David W.', text: 'Peaceful morning—saw hoopoes and learned tree names.', rating: 5 },
    ]),
  },
  'exp-005': {
    ...bokun('vendor-blr-spiritual'),
    photoUrls: [IMG(5765818), IMG(3581368), IMG(2846217)],
    longDescription:
      "Visit the ISKCON hill temple with a cultural host who explains architecture, aarti timing, and respectful etiquette before you enter. Includes prasad and optional pickup from central hotels—ideal after listening to Gamana's temple story.",
    highlights: [
      'Evening timing aligned with aarti when schedule allows',
      'Etiquette briefing before entering sacred spaces',
      'Hotel pickup available in select zones',
      'Prasad included',
      'Photography guidance for permitted areas only',
    ],
    itinerary: pickupItinerary('Bengaluru', {
      id: 'iskcon',
      title: 'ISKCON Hill Temple',
      activities: ['Orientation', 'Temple visit', 'Aarti viewing'],
      isMainStop: true,
    }),
    whatToBring: ['Modest clothing covering shoulders and knees'],
    notSuitableFor: ['Guests unwilling to remove shoes at temple'],
    importantInformation: ['No photography inside inner sanctum'],
    reviewSummary: mockReviews(71, 4.7, [
      { author: 'Rachel H.', text: 'Host made us feel welcome without pressure.', rating: 5 },
    ]),
  },
  'exp-006': {
    ...bokun('vendor-blr-daytrips'),
    groupType: 'private',
    photoUrls: [IMG(1485894), IMG(1365425), IMG(3522880)],
    longDescription:
      "Leave Bengaluru before dawn for Nandi Hills' fort viewpoints, misty sunrise vistas, and a hilltop breakfast. Travel in an air-conditioned vehicle with a driver-guide who handles tickets and timing so you can focus on the scenery.",
    highlights: [
      'Sunrise viewpoints above the cloud line when weather permits',
      'Round-trip transport from central Bengaluru',
      'Hilltop breakfast included',
      'Fort walls and Tipu-era history stops',
      'Private vehicle option for your group',
    ],
    itinerary: [
      { id: 'pickup', title: 'Pickup', subtitle: 'Bengaluru', activities: ['Hotel pickup'] },
      {
        id: 'nandi',
        title: 'Nandi Hills',
        subtitle: 'Chikkaballapur district',
        activities: ['Sunrise viewpoint', 'Fort walk', 'Breakfast'],
        isMainStop: true,
      },
      { id: 'return', title: 'Return to Bengaluru', activities: ['Drop-off'] },
    ],
    whatToBring: ['Warm layer', 'Sunglasses', 'Camera'],
    notSuitableFor: ['Guests with serious altitude sensitivity', 'Infants without car seat arrangement'],
    importantInformation: ['Departure times vary by season—confirmed after booking'],
    reviewSummary: mockReviews(203, 4.4, [
      { author: 'Tom B.', text: 'Early start but sunrise was spectacular.', rating: 5 },
    ]),
  },
  'exp-007': {
    operatorDisplayName: 'Gamana Experiences',
    groupType: 'shared',
    freeCancellationHours: 48,
    photoUrls: [IMG(1485894), IMG(5765818), IMG(1179229)],
    longDescription:
      "Unlock Gamana audio stories at Lalbagh's key gates and glasshouse, then wander at your pace with an optional map of botanical highlights. A lightweight alternative to a full guided tour when you want flexibility.",
    highlights: [
      'Self-paced audio at Lalbagh landmarks',
      'Offline-ready story downloads in app',
      'Map of recommended tree and heritage stops',
      'Affordable entry-level city experience',
      'Combine with Gamana Lalbagh story for depth',
    ],
    itinerary: [
      { id: 'start', title: 'Lalbagh West Gate', subtitle: 'Check-in & audio unlock' },
      { id: 'main', title: 'Garden circuit', activities: ['Glasshouse', 'Lake walk', 'Bonsai garden'], isMainStop: true },
    ],
    whatToBring: ['Headphones', 'Sun protection'],
    reviewSummary: mockReviews(44, 4.9, [
      { author: 'Meera S.', text: 'Loved pacing ourselves with the audio guide.', rating: 5 },
    ]),
  },
  'exp-008': {
    ...bokun('vendor-blr-daytrips'),
    groupType: 'private',
    reserveNowPayLater: false,
    photoUrls: [IMG(3581368), IMG(1485894), IMG(2846217)],
    longDescription:
      'A full-day excursion to Mysore Palace with round-trip transport from Bengaluru, palace entry, and guided interiors tour. On-request confirmation ensures vehicle and guide availability on your preferred date.',
    highlights: [
      'Mysore Palace interiors with licensed guide',
      'Air-conditioned transport both ways',
      'Palace entry tickets arranged',
      'Time for palace façade photos',
      'Long day—pack snacks and water',
    ],
    itinerary: [
      { id: 'pickup', title: 'Pickup Bengaluru', activities: ['Early departure'] },
      {
        id: 'mysore',
        title: 'Mysore Palace',
        activities: ['Palace tour', 'Photo stops'],
        isMainStop: true,
      },
      { id: 'return', title: 'Return Bengaluru', activities: ['Evening drop-off'] },
    ],
    whatToBring: ['Comfortable shoes', 'Snacks', 'Power bank'],
    notSuitableFor: ['Young children without breaks plan', 'Guests who cannot sit 3+ hours in vehicle'],
    importantInformation: ['Lunch not included—stop en route at guest expense'],
    reviewSummary: mockReviews(167, 4.3, [
      { author: 'Helen P.', text: 'Tiring but palace was magnificent.', rating: 4 },
    ]),
  },
  'exp-009': {
    ...bokun('vendor-blr-workshops'),
    groupType: 'small_group',
    photoUrls: [IMG(9585454), IMG(1485894), IMG(5765818)],
    longDescription:
      'Cook alongside a home chef in Indiranagar: grind batter, season sambar, and flip dosas on a traditional tawa. Sit down for the lunch you helped prepare and leave with printed recipes.',
    highlights: [
      'Hands-on dosa and sambar session',
      'Maximum eight guests per class',
      'Lunch included',
      'Recipe cards to take home',
      'English-speaking host',
    ],
    itinerary: [
      { id: 'welcome', title: 'Home kitchen welcome', activities: ['Introduction', 'Ingredients overview'] },
      { id: 'cook', title: 'Cooking session', activities: ['Dosa', 'Sambar', 'Chutneys'], isMainStop: true },
      { id: 'lunch', title: 'Sit-down lunch', activities: ['Meal with host'] },
    ],
    whatToBring: ['Apron provided', 'Notify allergies in advance'],
    notSuitableFor: ['Guests under 12 without adult', 'Severe nut allergies'],
    reviewSummary: mockReviews(52, 5.0, [
      { author: 'Claire D.', text: 'Best cooking class—we still make those dosas at home.', rating: 5 },
    ]),
  },
  'exp-010': {
    ...bokun('vendor-blr-adventure'),
    groupType: 'small_group',
    photoUrls: [IMG(1365425), IMG(1485894), IMG(3522880)],
    longDescription:
      'Half-day whitewater introduction on a graded section suited to beginners with safety briefing, gear, and certified instructors. Transport from Bengaluru included.',
    highlights: [
      'Safety gear and briefing included',
      'Certified river guides',
      'Pickup from central Bengaluru',
      'Post-run snack',
      'Moderate fitness required',
    ],
    itinerary: [
      { id: 'pickup', title: 'Pickup', subtitle: 'Bengaluru' },
      { id: 'raft', title: 'River session', activities: ['Briefing', 'Rafting', 'Snack'], isMainStop: true },
      { id: 'return', title: 'Return', subtitle: 'Bengaluru' },
    ],
    whatToBring: ['Swimwear', 'Towel', 'Change of clothes'],
    notSuitableFor: ['Non-swimmers', 'Guests prone to seasickness', 'Under 14'],
    importantInformation: ['Seasonal—runs when water levels permit'],
    reviewSummary: mockReviews(38, 4.2, [
      { author: 'Alex G.', text: 'Adrenaline hit—guides were professional.', rating: 4 },
    ]),
  },
  'exp-011': {
    ...bokun('vendor-blr-tickets'),
    priceWas: 499,
    groupType: 'shared',
    photoUrls: [IMG(2846217), IMG(1179229), IMG(3581368)],
    longDescription:
      'Timed entry to Visvesvaraya Industrial & Technological Museum with optional science demo add-on—ideal for families on a rainy Bengaluru afternoon.',
    highlights: [
      'Skip main queue with timed ticket',
      'Family-friendly interactive galleries',
      'Optional live science demo',
      'Near Cubbon Park for same-day pairing',
      'Instant confirmation',
    ],
    itinerary: [
      { id: 'entry', title: 'Museum main gate', activities: ['Timed entry', 'Self-guided galleries'], isMainStop: true },
    ],
    whatToBring: ['Photo ID for adults'],
    notSuitableFor: [],
    reviewSummary: mockReviews(210, 4.1, [
      { author: 'Kavitha N.', text: 'Kids loved the engines hall.', rating: 4 },
    ]),
  },
  'exp-012': {
    ...bokun('vendor-blr-food'),
    priceWas: 2800,
    photoUrls: [IMG(9585454), IMG(1267320), IMG(5765818)],
    longDescription:
      "Explore VV Puram's legendary night food street with a guide who selects hygienic, high-turnover stalls for dosa, chaat, and seasonal sweets.",
    highlights: [
      'Five tastings across night market lanes',
      'Guide-led hygiene-conscious route',
      'Evening atmosphere and local drink pairing',
      'Vegetarian-forward options',
      'Small group for easier navigation',
    ],
    itinerary: pickupItinerary('Bengaluru', {
      id: 'vv-puram',
      title: 'VV Puram food street',
      activities: ['Chaat', 'Dosa', 'Sweets', 'Local drink'],
      isMainStop: true,
    }),
    whatToBring: ['Light dinner beforehand recommended'],
    notSuitableFor: ['Guests with severe spice intolerance without notice'],
    reviewSummary: mockReviews(64, 4.8, [
      { author: 'Omar F.', text: 'Electric vibe—guide knew every stall.', rating: 5 },
    ]),
  },
  'exp-013': {
    ...bokun('vendor-blr-crafts'),
    reserveNowPayLater: false,
    photoUrls: [IMG(3581364), IMG(9585454), IMG(2846217)],
    longDescription:
      'Visit a silk weaving cooperative to watch handloom work, try a simple pattern, and understand how saree motifs are designed. Includes a small souvenir swatch.',
    highlights: [
      'Live loom demonstration',
      'Meet artisan weavers',
      'Hands-on pattern trial',
      'Cooperative supports fair wages',
      'Pickup optional',
    ],
    itinerary: [
      { id: 'studio', title: 'Weaving studio', activities: ['Demo', 'Hands-on trial', 'Q&A'], isMainStop: true },
    ],
    whatToBring: ['Camera for non-flash photography where permitted'],
    reviewSummary: mockReviews(29, 4.6, [
      { author: 'Lisa M.', text: 'Meaningful souvenir context—not mall silk.', rating: 5 },
    ]),
  },
  'exp-014': {
    ...bokun('vendor-blr-nature'),
    photoUrls: [IMG(1485894), IMG(1179229), IMG(5765818)],
    longDescription:
      'Meet a naturalist at Lalbagh before sunrise for a focused birding session with borrowed binoculars and a species checklist for the season.',
    highlights: [
      'Dawn birding with naturalist',
      'Binoculars provided',
      'Seasonal species checklist',
      'Quiet routes away from joggers',
      'Pairs with Lalbagh Gamana story',
    ],
    itinerary: [
      { id: 'gate', title: 'Lalbagh East Gate', subtitle: 'Pre-dawn meet' },
      { id: 'birding', title: 'Birding circuit', activities: ['Spotting', 'Species log'], isMainStop: true },
    ],
    whatToBring: ['Quiet clothing colours', 'Notebook optional'],
    notSuitableFor: ['Guests who cannot start before 6 AM'],
    reviewSummary: mockReviews(41, 4.7, [
      { author: 'Nikhil V.', text: 'Saw paradise flycatcher—worth the early alarm.', rating: 5 },
    ]),
  },
  'exp-015': {
    ...bokun('vendor-blr-night'),
    priceWas: 3600,
    photoUrls: [IMG(1267320), IMG(9585454), IMG(2846217)],
    longDescription:
      'Sample three craft beers at microbreweries in central Bengaluru with food pairings and transport between venues. 21+ only.',
    highlights: [
      'Three brewery tastings with snacks',
      'Driver between venues included',
      'English-speaking beer host',
      'Central Bengaluru route',
      '21+ age verified at start',
    ],
    itinerary: [
      { id: 'pickup', title: 'Pickup', activities: ['Hotel pickup'] },
      { id: 'breweries', title: 'Brewery circuit', activities: ['3 tastings', 'Food pairings'], isMainStop: true },
      { id: 'drop', title: 'Drop-off' },
    ],
    whatToBring: ['Photo ID'],
    notSuitableFor: ['Under 21', 'Pregnant guests', 'Non-drinkers seeking full value'],
    reviewSummary: mockReviews(33, 4.5, [
      { author: 'Chris A.', text: 'Fun evening—driver made it stress-free.', rating: 5 },
    ]),
  },
  'exp-016': {
    ...bokun('vendor-blr-transport'),
    groupType: 'private',
    photoUrls: [IMG(2104152), IMG(2846217), IMG(3581368)],
    longDescription:
      'Private meet-and-greet transfer from Kempegowda International Airport to Bengaluru hotels with flight tracking and fixed pricing.',
    highlights: [
      'Flight tracking for delays',
      'Meet-and-greet at arrivals',
      'Private sedan or SUV',
      'Fixed price—no meter surprises',
      'Instant confirmation',
    ],
    itinerary: [
      { id: 'airport', title: 'BLR Airport T1/T2', activities: ['Meet driver', 'Luggage assist'] },
      { id: 'hotel', title: 'Hotel drop-off', isMainStop: true },
    ],
    whatToBring: ['Flight number when booking'],
    notSuitableFor: [],
    importantInformation: ['Tolls may be billed separately per route'],
    reviewSummary: mockReviews(412, 4.4, [
      { author: 'Sarah L.', text: 'Driver was waiting despite delayed landing.', rating: 5 },
    ]),
  },
};
