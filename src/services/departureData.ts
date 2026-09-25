export interface DepartureHub {
  city: string;
  code: string;
  airportName: string;
  displayName: string;
}

export interface DepartureCountry {
  country: string;
  code: string;
  flag: string;
  region: 'North America' | 'Europe' | 'Asia' | 'Oceania' | 'Middle East';
  hubs: DepartureHub[];
}

export const DEPARTURE_COUNTRIES: DepartureCountry[] = [
  {
    country: 'United States',
    code: 'US',
    flag: '🇺🇸',
    region: 'North America',
    hubs: [
      { city: 'San Francisco', code: 'SFO', airportName: 'San Francisco International', displayName: 'San Francisco (SFO)' },
      { city: 'New York', code: 'JFK', airportName: 'John F. Kennedy International', displayName: 'New York (JFK)' },
      { city: 'Los Angeles', code: 'LAX', airportName: 'Los Angeles International', displayName: 'Los Angeles (LAX)' },
      { city: 'Chicago', code: 'ORD', airportName: "O'Hare International", displayName: 'Chicago (ORD)' },
      { city: 'Seattle', code: 'SEA', airportName: 'Seattle-Tacoma International', displayName: 'Seattle (SEA)' },
      { city: 'Miami', code: 'MIA', airportName: 'Miami International', displayName: 'Miami (MIA)' },
    ],
  },
  {
    country: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    region: 'Europe',
    hubs: [
      { city: 'London', code: 'LHR', airportName: 'London Heathrow Airport', displayName: 'London Heathrow (LHR)' },
      { city: 'London', code: 'LGW', airportName: 'London Gatwick Airport', displayName: 'London Gatwick (LGW)' },
      { city: 'Manchester', code: 'MAN', airportName: 'Manchester Airport', displayName: 'Manchester (MAN)' },
      { city: 'Edinburgh', code: 'EDI', airportName: 'Edinburgh Airport', displayName: 'Edinburgh (EDI)' },
    ],
  },
  {
    country: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    region: 'North America',
    hubs: [
      { city: 'Vancouver', code: 'YVR', airportName: 'Vancouver International', displayName: 'Vancouver (YVR)' },
      { city: 'Toronto', code: 'YYZ', airportName: 'Toronto Pearson International', displayName: 'Toronto (YYZ)' },
      { city: 'Montreal', code: 'YUL', airportName: 'Montréal-Trudeau International', displayName: 'Montreal (YUL)' },
      { city: 'Calgary', code: 'YYC', airportName: 'Calgary International', displayName: 'Calgary (YYC)' },
    ],
  },
  {
    country: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    region: 'Oceania',
    hubs: [
      { city: 'Sydney', code: 'SYD', airportName: 'Sydney Kingsford Smith Airport', displayName: 'Sydney (SYD)' },
      { city: 'Melbourne', code: 'MEL', airportName: 'Melbourne Tullamarine Airport', displayName: 'Melbourne (MEL)' },
      { city: 'Brisbane', code: 'BNE', airportName: 'Brisbane Airport', displayName: 'Brisbane (BNE)' },
      { city: 'Perth', code: 'PER', airportName: 'Perth Airport', displayName: 'Perth (PER)' },
    ],
  },
  {
    country: 'Singapore',
    code: 'SG',
    flag: '🇸🇬',
    region: 'Asia',
    hubs: [
      { city: 'Singapore', code: 'SIN', airportName: 'Singapore Changi Airport', displayName: 'Singapore (SIN)' },
    ],
  },
  {
    country: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    region: 'Asia',
    hubs: [
      { city: 'Tokyo', code: 'HND', airportName: 'Tokyo Haneda Airport', displayName: 'Tokyo Haneda (HND)' },
      { city: 'Tokyo', code: 'NRT', airportName: 'Tokyo Narita International', displayName: 'Tokyo Narita (NRT)' },
      { city: 'Osaka', code: 'KIX', airportName: 'Kansai International Airport', displayName: 'Osaka Kansai (KIX)' },
    ],
  },
  {
    country: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    region: 'Europe',
    hubs: [
      { city: 'Frankfurt', code: 'FRA', airportName: 'Frankfurt Airport', displayName: 'Frankfurt (FRA)' },
      { city: 'Munich', code: 'MUC', airportName: 'Munich Airport', displayName: 'Munich (MUC)' },
      { city: 'Berlin', code: 'BER', airportName: 'Berlin Brandenburg Airport', displayName: 'Berlin (BER)' },
    ],
  },
  {
    country: 'France',
    code: 'FR',
    flag: '🇫🇷',
    region: 'Europe',
    hubs: [
      { city: 'Paris', code: 'CDG', airportName: 'Paris Charles de Gaulle', displayName: 'Paris (CDG)' },
      { city: 'Nice', code: 'NCE', airportName: 'Nice Côte d’Azur Airport', displayName: 'Nice (NCE)' },
      { city: 'Lyon', code: 'LYS', airportName: 'Lyon-Saint Exupéry Airport', displayName: 'Lyon (LYS)' },
    ],
  },
  {
    country: 'United Arab Emirates',
    code: 'AE',
    flag: '🇦🇪',
    region: 'Middle East',
    hubs: [
      { city: 'Dubai', code: 'DXB', airportName: 'Dubai International Airport', displayName: 'Dubai (DXB)' },
      { city: 'Abu Dhabi', code: 'AUH', airportName: 'Zayed International Airport', displayName: 'Abu Dhabi (AUH)' },
    ],
  },
  {
    country: 'Hong Kong & China',
    code: 'HK',
    flag: '🇭🇰',
    region: 'Asia',
    hubs: [
      { city: 'Hong Kong', code: 'HKG', airportName: 'Hong Kong International', displayName: 'Hong Kong (HKG)' },
      { city: 'Shanghai', code: 'PVG', airportName: 'Shanghai Pudong International', displayName: 'Shanghai (PVG)' },
      { city: 'Beijing', code: 'PEK', airportName: 'Beijing Capital International', displayName: 'Beijing (PEK)' },
    ],
  },
  {
    country: 'South Korea',
    code: 'KR',
    flag: '🇰🇷',
    region: 'Asia',
    hubs: [
      { city: 'Seoul', code: 'ICN', airportName: 'Incheon International Airport', displayName: 'Seoul Incheon (ICN)' },
      { city: 'Busan', code: 'PUS', airportName: 'Gimhae International Airport', displayName: 'Busan (PUS)' },
    ],
  },
  {
    country: 'Netherlands',
    code: 'NL',
    flag: '🇳🇱',
    region: 'Europe',
    hubs: [
      { city: 'Amsterdam', code: 'AMS', airportName: 'Amsterdam Airport Schiphol', displayName: 'Amsterdam (AMS)' },
    ],
  },
  {
    country: 'Switzerland',
    code: 'CH',
    flag: '🇨🇭',
    region: 'Europe',
    hubs: [
      { city: 'Zurich', code: 'ZRH', airportName: 'Zurich Airport', displayName: 'Zurich (ZRH)' },
      { city: 'Geneva', code: 'GVA', airportName: 'Geneva Airport', displayName: 'Geneva (GVA)' },
    ],
  },
  {
    country: 'Spain',
    code: 'ES',
    flag: '🇪🇸',
    region: 'Europe',
    hubs: [
      { city: 'Madrid', code: 'MAD', airportName: 'Adolfo Suárez Madrid-Barajas', displayName: 'Madrid (MAD)' },
      { city: 'Barcelona', code: 'BCN', airportName: 'Josep Tarradellas Barcelona-El Prat', displayName: 'Barcelona (BCN)' },
    ],
  },
  {
    country: 'Italy',
    code: 'IT',
    flag: '🇮🇹',
    region: 'Europe',
    hubs: [
      { city: 'Rome', code: 'FCO', airportName: 'Leonardo da Vinci-Fiumicino', displayName: 'Rome (FCO)' },
      { city: 'Milan', code: 'MXP', airportName: 'Milan Malpensa Airport', displayName: 'Milan (MXP)' },
    ],
  },
  {
    country: 'New Zealand',
    code: 'NZ',
    flag: '🇳🇿',
    region: 'Oceania',
    hubs: [
      { city: 'Auckland', code: 'AKL', airportName: 'Auckland Airport', displayName: 'Auckland (AKL)' },
      { city: 'Christchurch', code: 'CHC', airportName: 'Christchurch International', displayName: 'Christchurch (CHC)' },
    ],
  },
];

// Lookup country details from an originCity string (e.g. "San Francisco (SFO)")
export function getCountryForOriginCity(originCity: string): DepartureCountry {
  for (const country of DEPARTURE_COUNTRIES) {
    if (country.hubs.some((h) => h.displayName === originCity || originCity.includes(h.code) || originCity.includes(h.city))) {
      return country;
    }
  }
  return DEPARTURE_COUNTRIES[0];
}

export function getCountryByCountryName(countryName: string): DepartureCountry | undefined {
  return DEPARTURE_COUNTRIES.find((c) => c.country.toLowerCase() === countryName.toLowerCase());
}
