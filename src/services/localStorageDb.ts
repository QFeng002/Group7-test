import { TripPreferences, TripState, DestinationProposal, FlightOption, ItineraryDay, BookingItem } from '../types/travel';
import { getCountryForOriginCity } from './departureData';

const STORAGE_KEY = 'wanderpulse_trip_state_v1';

export const DEFAULT_PREFERENCES: TripPreferences = {
  currency: 'USD',
  totalBudget: 4200,
  startDate: '2026-10-12',
  endDate: '2026-10-18',
  partySize: 2,
  originCountry: 'United States',
  originCity: 'San Francisco (SFO)',
  vibes: ['Culture & Heritage', 'Culinary & Foodie', 'Urban & Architecture', 'Art & Museums'],
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
};

export const CURRENCY_RATES_FROM_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 153.5,
  AUD: 1.52,
  CAD: 1.36,
  SGD: 1.34,
};

export function formatPrice(amountInUSD: number, targetCurrency: string = 'USD'): string {
  const rate = CURRENCY_RATES_FROM_USD[targetCurrency] || 1;
  const converted = amountInUSD * rate;
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || '$';

  if (targetCurrency === 'JPY') {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${symbol}${Math.round(converted).toLocaleString()}`;
}

export function saveTripToStorage(state: TripState): void {
  try {
    const updated = {
      ...state,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save trip to localStorage:', err);
  }
}

export function loadTripFromStorage(): TripState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TripState;
    if (parsed.preferences && !parsed.preferences.originCountry) {
      const deduced = getCountryForOriginCity(parsed.preferences.originCity || 'San Francisco (SFO)');
      parsed.preferences.originCountry = deduced.country;
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to parse saved trip from localStorage:', err);
    return null;
  }
}

export function clearTripStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear trip storage:', err);
  }
}
