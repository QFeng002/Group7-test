export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'SGD';

export interface TripPreferences {
  currency: CurrencyCode;
  totalBudget: number;
  startDate: string;
  endDate: string;
  partySize: number;
  originCountry: string;
  originCity: string;
  vibes: string[];
}

export interface DestinationProposal {
  id: string;
  city: string;
  country: string;
  code: string;
  tagline: string;
  coverImage: string;
  vibeMatch: number;
  vibeHighlights: string[];
  estimatedFlightCost: number;
  seasonality: {
    isPeak: boolean;
    seasonName: string;
    label: string;
    description: string;
  };
  weatherForecast: {
    tempC: number;
    condition: string;
    icon: string;
    rainProbability: number;
    seasonForecastSummary: string;
  };
  highlights: string[];
  estimatedDailyExpense: number;
  currencyRate: number; // 1 USD in target currency
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  logoUrl?: string;
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  stops: number;
  layoverInfo?: string;
  price: number;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business';
  baggage: string;
  carbonKg: number;
  aircraft: string;
}

export type ActivityCategory =
  | 'Sightseeing'
  | 'Cultural'
  | 'Dining'
  | 'Outdoor'
  | 'Indoor'
  | 'Event'
  | 'Festival'
  | 'Transit';

export interface ActivityItem {
  id: string;
  timeSlot: string;
  title: string;
  category: ActivityCategory;
  location: string;
  isOutdoor: boolean;
  isAnchorEvent: boolean; // Cannot be replaced during wet-weather replanning (e.g. booked festival/theatre)
  cost: number;
  description: string;
  recommendedDuration: string;
  weatherImpact?: string;
  indoorAlternative?: {
    title: string;
    location: string;
    description: string;
    cost: number;
    reason: string;
  };
  transitNote?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  theme: string;
  forecast: {
    tempC: number;
    condition: string;
    rainProb: number;
    rainAlert: boolean;
  };
  activities: ActivityItem[];
  rainModeActive: boolean;
  originalActivities?: ActivityItem[]; // Non-destructive backup of original sunny plan
  replanningReason?: string;
}

export type BookingType = 'flight' | 'hotel' | 'transit' | 'attraction';
export type BookingStatus = 'confirmed' | 'pending' | 'hold';

export interface BookingItem {
  id: string;
  type: BookingType;
  title: string;
  provider: string;
  details: string;
  price: number;
  status: BookingStatus;
  bookingRef?: string;
  confirmationDate?: string;
  badge: string;
  rating?: number;
  cancellationPolicy: string;
  image?: string;
  datesOrTimeSlot?: string;
}

export type MCPServerName =
  | 'pulse-mcp'
  | 'flight-search-mcp'
  | 'hotel-booking-mcp'
  | 'open-meteo-weather-mcp'
  | 'tourism-events-mcp'
  | 'maps-routing-mcp'
  | 'transit-mcp'
  | 'travel-orchestrator-mcp';

export interface MCPLogEntry {
  id: string;
  timestamp: string;
  server: MCPServerName;
  tool: string;
  latencyMs: number;
  status: 'success' | 'fallback' | 'cached';
  params: Record<string, any>;
  responseSummary: string;
}

export interface MCPStatus {
  name: MCPServerName;
  displayName: string;
  description: string;
  status: 'healthy' | 'busy' | 'offline';
  averageLatencyMs: number;
  totalCalls: number;
  endpoint: string;
}

export interface TripState {
  preferences: TripPreferences;
  selectedDestination: DestinationProposal | null;
  selectedFlight: FlightOption | null;
  itinerary: ItineraryDay[];
  bookings: BookingItem[];
  lastSavedAt: string;
  tripName: string;
}
