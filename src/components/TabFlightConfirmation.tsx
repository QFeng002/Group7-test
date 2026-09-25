import React from 'react';
import {
  Plane,
  Clock,
  Luggage,
  Leaf,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CloudSun,
  Banknote,
  Sparkles,
  MapPin,
  ChevronLeft,
} from 'lucide-react';
import {
  DestinationProposal,
  FlightOption,
  TripPreferences,
} from '../types/travel';
import { formatPrice } from '../services/localStorageDb';

interface TabFlightConfirmationProps {
  destination: DestinationProposal | null;
  preferences: TripPreferences;
  flights: FlightOption[];
  selectedFlight: FlightOption | null;
  onSelectFlight: (flight: FlightOption) => void;
  onConfirmAndBuildItinerary: () => void;
  onBackToDiscovery: () => void;
  isGeneratingItinerary: boolean;
}

export const TabFlightConfirmation: React.FC<TabFlightConfirmationProps> = ({
  destination,
  preferences,
  flights,
  selectedFlight,
  onSelectFlight,
  onConfirmAndBuildItinerary,
  onBackToDiscovery,
  isGeneratingItinerary,
}) => {
  if (!destination) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900/80 border border-slate-800 p-8 rounded-xl">
          <Plane className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-2">No Destination Selected</h3>
          <p className="text-xs text-slate-400 mb-4">
            Please choose a destination from Tab 1 (Preferences & Discovery) to review flights and build your itinerary.
          </p>
          <button
            onClick={onBackToDiscovery}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-md text-xs font-semibold cursor-pointer"
          >
            ← Back to Discovery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col xl:flex-row min-h-0 overflow-hidden bg-slate-950">
      {/* LEFT PANEL: Selected Destination Deep-Dive (Localized scrolling) */}
      <div className="w-full xl:w-[420px] shrink-0 border-b xl:border-b-0 xl:border-r border-slate-800/80 bg-slate-900/40 flex flex-col min-h-0">
        {/* Header toolbar */}
        <div className="p-3.5 border-b border-slate-800/80 shrink-0 flex items-center justify-between">
          <button
            onClick={onBackToDiscovery}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Change Destination</span>
          </button>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
            Pulse + Google Hotels MCP
          </span>
        </div>

        {/* Scrollable deep-dive content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-3 custom-scrollbar text-xs">
          {/* Destination Hero Card */}
          <div className="rounded-xl overflow-hidden border border-slate-800 relative bg-slate-900">
            <div className="h-40 w-full relative">
              <img
                src={destination.coverImage}
                alt={destination.city}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[10px] uppercase tracking-wider text-sky-400 font-bold block">
                  Locked Destination
                </span>
                <h2 className="text-2xl font-black text-white leading-tight">
                  {destination.city}, {destination.country}
                </h2>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-slate-300 text-xs italic leading-relaxed">
                "{destination.tagline}"
              </p>
            </div>
          </div>

          {/* Quick Real-Time Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 flex items-center mb-1">
                <CloudSun className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Live Autumn Weather
              </span>
              <span className="text-sm font-bold text-white">
                {destination.weatherForecast?.tempC ?? 22}°C / {destination.weatherForecast?.condition ?? 'Clear'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {destination.weatherForecast?.rainProbability ?? 15}% rain probability
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 flex items-center mb-1">
                <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Local Currency Rate
              </span>
              <span className="text-sm font-bold text-white font-mono">
                1 USD ≈ {destination.currencyRate} {destination.code === 'TYO' ? 'JPY' : destination.code}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Target daily exp: ~{formatPrice(destination.estimatedDailyExpense, preferences.currency)}
              </span>
            </div>
          </div>

          {/* Seasonality Context */}
          <div className="p-3 rounded-lg bg-slate-850 border border-slate-700/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                {destination.seasonality.seasonName}
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-medium rounded border border-emerald-500/20">
                {destination.seasonality.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {destination.seasonality.description}
            </p>
          </div>

          {/* Key landmarks curated by TourismMCP */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 mr-1.5" />
              Must-Visit Landmarks in Base Itinerary
            </h4>
            <div className="space-y-1.5">
              {destination.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-2 p-2 rounded-md bg-slate-800/40 border border-slate-700/50"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-slate-200 text-xs">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Travel window recap */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 shrink-0 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>
              {preferences.startDate} → {preferences.endDate}
            </span>
          </div>
          <span className="text-slate-400">
            {preferences.partySize} {preferences.partySize === 1 ? 'Traveler' : 'Travelers'}
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: Flight Search MCP Inventory & Confirmation */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-950">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/30 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center">
              <Plane className="w-4 h-4 mr-2 text-sky-400" />
              Flight Search MCP Options ({preferences.originCity} → {destination.city})
            </h1>
            <p className="text-xs text-slate-400">
              Live airline pricing, cabin baggage policies, and verified arrival slots
            </p>
          </div>

          {/* Action button */}
          <div>
            <button
              onClick={onConfirmAndBuildItinerary}
              disabled={isGeneratingItinerary || !selectedFlight}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 disabled:opacity-50 text-white rounded-md text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition cursor-pointer"
            >
              <span>{isGeneratingItinerary ? 'Orchestrating Base Itinerary...' : 'Lock Destination & Generate Itinerary'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Flight Options List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
          {flights.map((flight) => {
            const isSelected = selectedFlight?.id === flight.id;

            return (
              <div
                key={flight.id}
                onClick={() => onSelectFlight(flight)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                {/* Airline & Schedule details */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <Plane className="w-5 h-5 text-sky-400" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">
                        {flight.airline}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-[10px] font-mono text-slate-400 rounded">
                        {flight.flightNumber}
                      </span>
                      <span className="px-1.5 py-0.5 bg-sky-500/10 text-sky-400 text-[10px] font-medium rounded">
                        {flight.cabinClass}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mt-2">
                      <div>
                        <span className="text-base font-bold text-white font-mono">
                          {flight.departureTime}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {flight.departureAirport}
                        </span>
                      </div>

                      <div className="flex flex-col items-center px-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {flight.duration}
                        </span>
                        <div className="w-24 h-0.5 bg-slate-700 relative my-1">
                          <div className="absolute left-1/2 -top-1 w-2 h-2 rounded-full bg-sky-400 -translate-x-1/2" />
                        </div>
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}
                        </span>
                      </div>

                      <div>
                        <span className="text-base font-bold text-white font-mono">
                          {flight.arrivalTime}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {flight.arrivalAirport}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                      <span className="flex items-center">
                        <Luggage className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {flight.baggage}
                      </span>
                      <span className="flex items-center">
                        <Leaf className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        {flight.carbonKg} kg CO2
                      </span>
                      <span className="text-slate-500">• {flight.aircraft}</span>
                    </div>
                  </div>
                </div>

                {/* Price and selection CTA */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 block">Roundtrip / person</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {formatPrice(flight.price, preferences.currency)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Total: {formatPrice(flight.price * preferences.partySize, preferences.currency)}
                    </span>
                  </div>

                  <div className="mt-2">
                    {isSelected ? (
                      <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-md text-xs font-semibold flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-sky-400" />
                        Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium cursor-pointer"
                      >
                        Select Flight
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
