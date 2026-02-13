/**
 * Parses a Google Maps formatted address into individual fields.
 *
 * Expected formats:
 *   "1723 W Colorado Ave, Colorado Springs, CO 80904, United States"
 *   "1723 W Colorado Ave, Colorado Springs, CO 80904"
 *   "123 Main St, Suite 200, New York, NY 10001, United States"
 */

export interface ParsedAddress {
  address: string; // street address (may include suite/unit)
  city: string;
  state: string; // 2-letter code
  zipCode: string;
  country: string; // 2-letter code
}

// US state name → abbreviation
const STATE_MAP: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

// Country name → 2-letter code (expand as needed)
const COUNTRY_MAP: Record<string, string> = {
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  canada: "CA",
  mexico: "MX",
  "united kingdom": "GB",
  uk: "GB",
  australia: "AU",
};

/**
 * Normalizes a state value to a 2-letter abbreviation.
 * Accepts "CO", "Colorado", "colorado", etc.
 */
function normalizeState(raw: string): string {
  const trimmed = raw.trim();

  // Already a 2-letter code
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;

  const lookup = STATE_MAP[trimmed.toLowerCase()];
  return lookup ?? trimmed.toUpperCase().slice(0, 2);
}

/**
 * Normalizes a country value to a 2-letter code.
 * Accepts "United States", "USA", "US", etc.
 */
function normalizeCountry(raw: string): string {
  const trimmed = raw.trim();

  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;

  return COUNTRY_MAP[trimmed.toLowerCase()] ?? trimmed;
}

/**
 * Parse a pasted Google Maps address string.
 *
 * Works right-to-left since the rightmost segments are the most predictable:
 *   [...street parts], city, STATE ZIP, country?
 */
export function parseAddress(raw: string): ParsedAddress | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(",").map((p) => p.trim());

  if (parts.length < 2) return null;

  // Check if the last segment is a country (not a state+zip)
  const lastPart = parts[parts.length - 1];
  const isCountry =
    COUNTRY_MAP[lastPart.toLowerCase()] !== undefined ||
    /^[A-Z]{2}$/.test(lastPart);

  let country = "US";
  let workingParts = [...parts];

  if (isCountry) {
    country = normalizeCountry(lastPart);
    workingParts.pop();
  }

  if (workingParts.length < 2) return null;

  // Last remaining segment should be "STATE ZIP" (e.g. "CO 80904")
  const stateZipRaw = workingParts.pop()!;
  const stateZipMatch = stateZipRaw.match(
    /^([A-Za-z\s]+?)\s+(\d{5}(?:-\d{4})?)$/,
  );

  let state: string;
  let zipCode: string;

  if (stateZipMatch) {
    state = normalizeState(stateZipMatch[1]);
    zipCode = stateZipMatch[2];
  } else {
    // Fallback: might be just a state code with no zip
    state = normalizeState(stateZipRaw);
    zipCode = "";
  }

  if (workingParts.length < 2) return null;

  // Second-to-last is the city
  const city = workingParts.pop()!;

  // Everything remaining is the street address (handles "123 Main St, Suite 200")
  const address = workingParts.join(", ");

  return {
    address,
    city,
    state,
    zipCode,
    country,
  };
}
