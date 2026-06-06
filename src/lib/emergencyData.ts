export interface EmergencyService {
  type: 'police' | 'ambulance' | 'fire' | 'rescue' | 'universal';
  label: string;
  number: string;
}

export interface CountryEmergencyInfo {
  countryCode: string;
  countryName: string;
  services: EmergencyService[];
}

const EMERGENCY_DB: CountryEmergencyInfo[] = [
  { countryCode: 'DEFAULT', countryName: 'International', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
  ]},
  { countryCode: 'US', countryName: 'United States', services: [
    { type: 'universal', label: 'Emergency (Police/Fire/Ambulance)', number: '911' },
  ]},
  { countryCode: 'CA', countryName: 'Canada', services: [
    { type: 'universal', label: 'Emergency (Police/Fire/Ambulance)', number: '911' },
  ]},
  { countryCode: 'GB', countryName: 'United Kingdom', services: [
    { type: 'universal', label: 'Emergency', number: '999' },
    { type: 'universal', label: 'EU Emergency', number: '112' },
  ]},
  { countryCode: 'IN', countryName: 'India', services: [
    { type: 'universal', label: 'Emergency Helpline', number: '112' },
    { type: 'police', label: 'Police', number: '100' },
    { type: 'ambulance', label: 'Ambulance', number: '108' },
    { type: 'fire', label: 'Fire', number: '101' },
    { type: 'rescue', label: 'Disaster Management', number: '1078' },
  ]},
  { countryCode: 'AU', countryName: 'Australia', services: [
    { type: 'universal', label: 'Emergency', number: '000' },
    { type: 'universal', label: 'From Mobile', number: '112' },
  ]},
  { countryCode: 'DE', countryName: 'Germany', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '110' },
  ]},
  { countryCode: 'FR', countryName: 'France', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'ambulance', label: 'SAMU (Ambulance)', number: '15' },
    { type: 'police', label: 'Police', number: '17' },
    { type: 'fire', label: 'Fire', number: '18' },
  ]},
  { countryCode: 'JP', countryName: 'Japan', services: [
    { type: 'police', label: 'Police', number: '110' },
    { type: 'fire', label: 'Fire & Ambulance', number: '119' },
  ]},
  { countryCode: 'BR', countryName: 'Brazil', services: [
    { type: 'police', label: 'Police', number: '190' },
    { type: 'ambulance', label: 'Ambulance (SAMU)', number: '192' },
    { type: 'fire', label: 'Fire', number: '193' },
  ]},
  { countryCode: 'ZA', countryName: 'South Africa', services: [
    { type: 'universal', label: 'Emergency from Mobile', number: '112' },
    { type: 'police', label: 'Police', number: '10111' },
    { type: 'ambulance', label: 'Ambulance', number: '10177' },
  ]},
  { countryCode: 'AE', countryName: 'United Arab Emirates', services: [
    { type: 'police', label: 'Police', number: '999' },
    { type: 'ambulance', label: 'Ambulance', number: '998' },
    { type: 'fire', label: 'Fire', number: '997' },
  ]},
  { countryCode: 'SG', countryName: 'Singapore', services: [
    { type: 'police', label: 'Police', number: '999' },
    { type: 'ambulance', label: 'Ambulance & Fire', number: '995' },
  ]},
  { countryCode: 'KR', countryName: 'South Korea', services: [
    { type: 'police', label: 'Police', number: '112' },
    { type: 'fire', label: 'Fire & Ambulance', number: '119' },
  ]},
  { countryCode: 'IT', countryName: 'Italy', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Carabinieri', number: '112' },
    { type: 'ambulance', label: 'Ambulance', number: '118' },
    { type: 'fire', label: 'Fire', number: '115' },
  ]},
  { countryCode: 'ES', countryName: 'Spain', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'National Police', number: '091' },
    { type: 'ambulance', label: 'Ambulance', number: '061' },
    { type: 'fire', label: 'Fire', number: '080' },
  ]},
  { countryCode: 'MX', countryName: 'Mexico', services: [
    { type: 'universal', label: 'Emergency', number: '911' },
  ]},
  { countryCode: 'NZ', countryName: 'New Zealand', services: [
    { type: 'universal', label: 'Emergency', number: '111' },
  ]},
  { countryCode: 'CN', countryName: 'China', services: [
    { type: 'police', label: 'Police', number: '110' },
    { type: 'fire', label: 'Fire', number: '119' },
    { type: 'ambulance', label: 'Ambulance', number: '120' },
  ]},
  { countryCode: 'TH', countryName: 'Thailand', services: [
    { type: 'universal', label: 'Tourist Police', number: '1155' },
    { type: 'police', label: 'Police', number: '191' },
    { type: 'ambulance', label: 'Ambulance', number: '1669' },
    { type: 'fire', label: 'Fire', number: '199' },
  ]},
  { countryCode: 'MY', countryName: 'Malaysia', services: [
    { type: 'universal', label: 'Emergency', number: '999' },
    { type: 'police', label: 'Police', number: '999' },
    { type: 'fire', label: 'Fire & Rescue', number: '994' },
  ]},
  { countryCode: 'ID', countryName: 'Indonesia', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '110' },
    { type: 'ambulance', label: 'Ambulance', number: '118' },
    { type: 'fire', label: 'Fire', number: '113' },
  ]},
  { countryCode: 'PH', countryName: 'Philippines', services: [
    { type: 'universal', label: 'Emergency', number: '911' },
  ]},
  { countryCode: 'VN', countryName: 'Vietnam', services: [
    { type: 'police', label: 'Police', number: '113' },
    { type: 'fire', label: 'Fire', number: '114' },
    { type: 'ambulance', label: 'Ambulance', number: '115' },
  ]},
  { countryCode: 'RU', countryName: 'Russia', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '102' },
    { type: 'ambulance', label: 'Ambulance', number: '103' },
    { type: 'fire', label: 'Fire', number: '101' },
  ]},
  { countryCode: 'TR', countryName: 'Turkey', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '155' },
    { type: 'ambulance', label: 'Ambulance', number: '112' },
    { type: 'fire', label: 'Fire', number: '110' },
  ]},
  { countryCode: 'EG', countryName: 'Egypt', services: [
    { type: 'police', label: 'Police', number: '122' },
    { type: 'ambulance', label: 'Ambulance', number: '123' },
    { type: 'fire', label: 'Fire', number: '180' },
    { type: 'rescue', label: 'Tourist Police', number: '126' },
  ]},
  { countryCode: 'KE', countryName: 'Kenya', services: [
    { type: 'universal', label: 'Emergency', number: '999' },
    { type: 'police', label: 'Police', number: '999' },
    { type: 'ambulance', label: 'Ambulance (St John)', number: '1199' },
  ]},
  { countryCode: 'NG', countryName: 'Nigeria', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '199' },
    { type: 'fire', label: 'Fire', number: '190' },
  ]},
  { countryCode: 'GH', countryName: 'Ghana', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '191' },
    { type: 'fire', label: 'Fire', number: '192' },
    { type: 'ambulance', label: 'Ambulance', number: '193' },
  ]},
  { countryCode: 'SA', countryName: 'Saudi Arabia', services: [
    { type: 'police', label: 'Police', number: '999' },
    { type: 'ambulance', label: 'Ambulance', number: '997' },
    { type: 'fire', label: 'Fire', number: '998' },
  ]},
  { countryCode: 'QA', countryName: 'Qatar', services: [
    { type: 'police', label: 'Police', number: '999' },
    { type: 'ambulance', label: 'Ambulance', number: '999' },
    { type: 'fire', label: 'Fire', number: '999' },
  ]},
  { countryCode: 'IL', countryName: 'Israel', services: [
    { type: 'police', label: 'Police', number: '100' },
    { type: 'ambulance', label: 'Ambulance', number: '101' },
    { type: 'fire', label: 'Fire', number: '102' },
  ]},
  { countryCode: 'SE', countryName: 'Sweden', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
  ]},
  { countryCode: 'NO', countryName: 'Norway', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '112' },
    { type: 'ambulance', label: 'Ambulance', number: '113' },
    { type: 'fire', label: 'Fire', number: '110' },
  ]},
  { countryCode: 'FI', countryName: 'Finland', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
  ]},
  { countryCode: 'DK', countryName: 'Denmark', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
  ]},
  { countryCode: 'NL', countryName: 'Netherlands', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
  ]},
  { countryCode: 'BE', countryName: 'Belgium', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '101' },
    { type: 'ambulance', label: 'Ambulance & Fire', number: '100' },
  ]},
  { countryCode: 'AT', countryName: 'Austria', services: [
    { type: 'universal', label: 'EU Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '133' },
    { type: 'ambulance', label: 'Ambulance', number: '144' },
    { type: 'fire', label: 'Fire', number: '122' },
  ]},
  { countryCode: 'CH', countryName: 'Switzerland', services: [
    { type: 'universal', label: 'EU Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '117' },
    { type: 'ambulance', label: 'Ambulance', number: '144' },
    { type: 'fire', label: 'Fire', number: '118' },
  ]},
  { countryCode: 'PT', countryName: 'Portugal', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
  ]},
  { countryCode: 'GR', countryName: 'Greece', services: [
    { type: 'universal', label: 'EU Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '100' },
    { type: 'ambulance', label: 'Ambulance', number: '166' },
    { type: 'fire', label: 'Fire', number: '199' },
  ]},
  { countryCode: 'PL', countryName: 'Poland', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '997' },
    { type: 'ambulance', label: 'Ambulance', number: '999' },
    { type: 'fire', label: 'Fire', number: '998' },
  ]},
  { countryCode: 'CZ', countryName: 'Czech Republic', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'police', label: 'Police', number: '158' },
    { type: 'ambulance', label: 'Ambulance', number: '155' },
    { type: 'fire', label: 'Fire', number: '150' },
  ]},
  { countryCode: 'IE', countryName: 'Ireland', services: [
    { type: 'universal', label: 'Emergency', number: '112' },
    { type: 'universal', label: 'Emergency', number: '999' },
  ]},
  { countryCode: 'AR', countryName: 'Argentina', services: [
    { type: 'police', label: 'Police', number: '101' },
    { type: 'ambulance', label: 'Ambulance', number: '107' },
    { type: 'fire', label: 'Fire', number: '100' },
  ]},
  { countryCode: 'CL', countryName: 'Chile', services: [
    { type: 'police', label: 'Carabineros', number: '133' },
    { type: 'ambulance', label: 'Ambulance', number: '131' },
    { type: 'fire', label: 'Fire', number: '132' },
  ]},
  { countryCode: 'CO', countryName: 'Colombia', services: [
    { type: 'universal', label: 'Emergency', number: '123' },
  ]},
  { countryCode: 'PE', countryName: 'Peru', services: [
    { type: 'police', label: 'Police', number: '105' },
    { type: 'ambulance', label: 'Ambulance', number: '106' },
    { type: 'fire', label: 'Fire', number: '116' },
  ]},
  { countryCode: 'LK', countryName: 'Sri Lanka', services: [
    { type: 'universal', label: 'Emergency', number: '119' },
    { type: 'police', label: 'Police', number: '119' },
    { type: 'ambulance', label: 'Ambulance', number: '1990' },
    { type: 'fire', label: 'Fire', number: '110' },
  ]},
  { countryCode: 'NP', countryName: 'Nepal', services: [
    { type: 'police', label: 'Police', number: '100' },
    { type: 'ambulance', label: 'Ambulance', number: '102' },
    { type: 'fire', label: 'Fire', number: '101' },
  ]},
  { countryCode: 'BD', countryName: 'Bangladesh', services: [
    { type: 'universal', label: 'Emergency', number: '999' },
  ]},
  { countryCode: 'PK', countryName: 'Pakistan', services: [
    { type: 'universal', label: 'Emergency (Rescue)', number: '1122' },
    { type: 'police', label: 'Police', number: '15' },
    { type: 'fire', label: 'Fire', number: '16' },
    { type: 'ambulance', label: 'Ambulance (Edhi)', number: '115' },
  ]},
  { countryCode: 'HK', countryName: 'Hong Kong', services: [
    { type: 'universal', label: 'Emergency', number: '999' },
  ]},
  { countryCode: 'TW', countryName: 'Taiwan', services: [
    { type: 'police', label: 'Police', number: '110' },
    { type: 'fire', label: 'Fire & Ambulance', number: '119' },
  ]},
];

const EMERGENCY_MAP = new Map<string, CountryEmergencyInfo>();
for (const entry of EMERGENCY_DB) {
  EMERGENCY_MAP.set(entry.countryCode, entry);
}

export function getAllCountries(): CountryEmergencyInfo[] {
  return EMERGENCY_DB.filter((e) => e.countryCode !== 'DEFAULT')
    .sort((a, b) => a.countryName.localeCompare(b.countryName));
}

export function getEmergencyInfo(countryCode: string): CountryEmergencyInfo {
  return EMERGENCY_MAP.get(countryCode) ?? EMERGENCY_MAP.get('DEFAULT')!;
}

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'America/Edmonton': 'CA', 'America/Winnipeg': 'CA', 'America/Halifax': 'CA',
  'Europe/London': 'GB', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU',
  'Europe/Berlin': 'DE', 'Europe/Paris': 'FR', 'Asia/Tokyo': 'JP',
  'America/Sao_Paulo': 'BR', 'America/Rio_Branco': 'BR',
  'Africa/Johannesburg': 'ZA', 'Asia/Dubai': 'AE', 'Asia/Singapore': 'SG',
  'Asia/Seoul': 'KR', 'Europe/Rome': 'IT', 'Europe/Madrid': 'ES',
  'America/Mexico_City': 'MX', 'Pacific/Auckland': 'NZ',
  'Asia/Shanghai': 'CN', 'Asia/Chongqing': 'CN', 'Asia/Bangkok': 'TH',
  'Asia/Kuala_Lumpur': 'MY', 'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH',
  'Asia/Ho_Chi_Minh': 'VN', 'Europe/Moscow': 'RU', 'Europe/Istanbul': 'TR',
  'Africa/Cairo': 'EG', 'Africa/Nairobi': 'KE', 'Africa/Lagos': 'NG',
  'Africa/Accra': 'GH', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA',
  'Asia/Jerusalem': 'IL', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
  'Europe/Helsinki': 'FI', 'Europe/Copenhagen': 'DK', 'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT', 'Europe/Zurich': 'CH',
  'Europe/Lisbon': 'PT', 'Europe/Athens': 'GR', 'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ', 'Europe/Dublin': 'IE',
  'America/Argentina/Buenos_Aires': 'AR', 'America/Santiago': 'CL',
  'America/Bogota': 'CO', 'America/Lima': 'PE',
  'Asia/Colombo': 'LK', 'Asia/Kathmandu': 'NP', 'Asia/Dhaka': 'BD',
  'Asia/Karachi': 'PK', 'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW',
};

const OVERRIDE_KEY = 'gamana_emergency_country';

export function getEmergencyCountryOverride(): string | null {
  return localStorage.getItem(OVERRIDE_KEY);
}

export function setEmergencyCountryOverride(code: string): void {
  localStorage.setItem(OVERRIDE_KEY, code);
}

export function detectUserCountry(): string {
  const override = getEmergencyCountryOverride();
  if (override && EMERGENCY_MAP.has(override)) return override;

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fromTz = TIMEZONE_TO_COUNTRY[tz];
    if (fromTz && EMERGENCY_MAP.has(fromTz)) return fromTz;
  } catch { /* ignore */ }

  try {
    const lang = navigator.language;
    const parts = lang.split('-');
    if (parts.length >= 2) {
      const region = parts[parts.length - 1].toUpperCase();
      if (EMERGENCY_MAP.has(region)) return region;
    }
  } catch { /* ignore */ }

  return 'DEFAULT';
}
