// Country reference data. `schengen: true` marks members of the Schengen area
// (used for the 90/180 rule). The list is intentionally broad but not
// exhaustive — searching is by name, and any country can still be logged for the
// per-country day view even if it's not Schengen.

export const COUNTRIES = [
  // --- Schengen area ---
  { code: 'AT', name: 'Austria', flag: '🇦🇹', schengen: true },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', schengen: true },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', schengen: true },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', schengen: true },
  { code: 'CZ', name: 'Czechia', flag: '🇨🇿', schengen: true },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', schengen: true },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', schengen: true },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', schengen: true },
  { code: 'FR', name: 'France', flag: '🇫🇷', schengen: true },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', schengen: true },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', schengen: true },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', schengen: true },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', schengen: true },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', schengen: true },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', schengen: true },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', schengen: true },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', schengen: true },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', schengen: true },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', schengen: true },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', schengen: true },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', schengen: true },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', schengen: true },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', schengen: true },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', schengen: true },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', schengen: true },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', schengen: true },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', schengen: true },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', schengen: true },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', schengen: true },

  // --- Common non-Schengen destinations / home countries ---
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', schengen: false },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', schengen: false },
  { code: 'US', name: 'United States', flag: '🇺🇸', schengen: false },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', schengen: false },
  { code: 'IN', name: 'India', flag: '🇮🇳', schengen: false },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', schengen: false },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', schengen: false },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', schengen: false },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', schengen: false },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', schengen: false },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', schengen: false },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', schengen: false },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', schengen: false },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', schengen: false },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', schengen: false },
  { code: 'CN', name: 'China', flag: '🇨🇳', schengen: false },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', schengen: false },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', schengen: false },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', schengen: false },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', schengen: false },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', schengen: false },
];

const BY_CODE = COUNTRIES.reduce((acc, c) => {
  acc[c.code] = c;
  return acc;
}, {});

export function getCountry(code) {
  return BY_CODE[code] || { code, name: code, flag: '🏳️', schengen: false };
}

export function isSchengen(code) {
  return !!(BY_CODE[code] && BY_CODE[code].schengen);
}

export function searchCountries(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return COUNTRIES;
  return COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q
  );
}
