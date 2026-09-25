import React, { useState } from 'react';
import {
  Compass,
  DollarSign,
  Calendar,
  Users,
  Sparkles,
  CloudSun,
  Flame,
  ArrowRight,
  TrendingDown,
  Info,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  TripPreferences,
  DestinationProposal,
  CurrencyCode,
} from '../types/travel';
import { formatPrice } from '../services/localStorageDb';

interface TabPreferencesDiscoveryProps {
  preferences: TripPreferences;
  onUpdatePreferences: (updated: Partial<TripPreferences>) => void;
  destinations: DestinationProposal[];
  selectedDestination: DestinationProposal | null;
  onSelectDestination: (dest: DestinationProposal) => void;
  onProceedToFlights: () => void;
  isLoading: boolean;
  onRefreshProposals: () => void;
}

const AVAILABLE_VIBES = [
  { name: 'Culture & Heritage', icon: '🏛️' },
  { name: 'Culinary & Foodie', icon: '🍜' },
  { name: 'Urban & Architecture', icon: '🏙️' },
  { name: 'Nature & Outdoors', icon: '🌲' },
  { name: 'Art & Museums', icon: '🎨' },
  { name: 'Relaxation & Wellness', icon: '♨️' },
  { name: 'Adventure & Thrills', icon: '🌋' },
];

const ORIGIN_CITIES = [
  'San Francisco (SFO)',
  'New York (JFK)',
  'London (LHR)',
  'Singapore (SIN)',
  'Tokyo (HND)',
  'Sydney (SYD)',
  'Vancouver (YVR)',
  'Frankfurt (FRA)',
];

export const TabPreferencesDiscovery: React.FC<TabPreferencesDiscoveryProps> = ({
  preferences,
  onUpdatePreferences,
  destinations,
  selectedDestination,
  onSelectDestination,
  onProceedToFlights,
  isLoading,
  onRefreshProposals,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const toggleVibe = (vibeName: string) => {
    const current = preferences.vibes;
    if (current.includes(vibeName)) {
      onUpdatePreferences({ vibes: current.filter((v) => v !== vibeName) });
    } else {
      onUpdatePreferences({ vibes: [...current, vibeName] });
    }
  };

  const filteredDestinations = destinations.filter(
    (d) =>
      d.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.country.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.tagline.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col lg:flex-row min-h-0 overflow-hidden bg-slate-950">
      {/* LEFT PANEL: Preferences Form (Fixed column with localized scrollbar) */}
      <div className="w-full lg:w-96 xl:w-[410px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/40 flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-800/80 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Trip Preferences & Constraints
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Pulse MCP</span>
        </div>

        {/* Localized vertical scrolling container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-3 custom-scrollbar text-xs">
          {/* Origin City */}
          <div>
            <label className="text-slate-300 font-medium block mb-1.5 flex items-center">
              <Search className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Departure Airport / Origin
            </label>
            <select
              value={preferences.originCity}
              onChange={(e) => onUpdatePreferences({ originCity: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 transition"
            >
              {ORIGIN_CITIES.map((city) => (
                <option key={city} value={city} className="bg-slate-900">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-300 font-medium flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Total Budget
              </label>
              <span className="font-bold text-emerald-400 text-sm font-mono">
                {formatPrice(preferences.totalBudget, preferences.currency)}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="15000"
              step="200"
              value={preferences.totalBudget}
              onChange={(e) => onUpdatePreferences({ totalBudget: Number(e.target.value) })}
              className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>{formatPrice(1000, preferences.currency)}</span>
              <span>{formatPrice(8000, preferences.currency)}</span>
              <span>{formatPrice(15000, preferences.currency)}</span>
            </div>
          </div>

          {/* Travel Dates */}
          <div>
            <label className="text-slate-300 font-medium block mb-1.5 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-sky-400" />
              Travel Window
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Start Date</span>
                <input
                  type="date"
                  value={preferences.startDate}
                  onChange={(e) => onUpdatePreferences({ startDate: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">End Date</span>
                <input
                  type="date"
                  value={preferences.endDate}
                  onChange={(e) => onUpdatePreferences({ endDate: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-md px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Party Size */}
          <div>
            <label className="text-slate-300 font-medium block mb-1.5 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Party Size
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onUpdatePreferences({ partySize: num })}
                  className={`py-1.5 rounded-md font-medium text-xs transition border cursor-pointer ${
                    preferences.partySize === num
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200'
                  }`}
                >
                  {num} {num === 1 ? 'Solo' : 'Pax'}
                </button>
              ))}
            </div>
          </div>

          {/* Trip Vibe & Interests */}
          <div>
            <label className="text-slate-300 font-medium block mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <Compass className="w-3.5 h-3.5 mr-1 text-pink-400" />
                Trip Vibe & Interests
              </span>
              <span className="text-[10px] text-slate-400">
                {preferences.vibes.length} selected
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_VIBES.map((vibe) => {
                const isSelected = preferences.vibes.includes(vibe.name);
                return (
                  <button
                    key={vibe.name}
                    type="button"
                    onClick={() => toggleVibe(vibe.name)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center space-x-1 border cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/10'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span>{vibe.icon}</span>
                    <span>{vibe.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA on Left Panel */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 shrink-0">
          <button
            onClick={onRefreshProposals}
            disabled={isLoading}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-md font-medium text-xs flex items-center justify-center space-x-2 border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-query Pulse MCP Matcher</span>
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Proposed Destinations Grid (Isolated vertical scroll) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-950">
        {/* Sub-header with filter and counter */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/30 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              Discovered Destinations (Pulse + Open-Meteo MCP)
            </h1>
            <p className="text-xs text-slate-400">
              Ranked by vibe synergy, flight budget suitability, and real-time autumn weather
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {selectedDestination && (
              <button
                onClick={onProceedToFlights}
                className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-md text-xs font-semibold shadow-md shadow-sky-500/20 flex items-center space-x-1.5 transition cursor-pointer"
              >
                <span>Continue with {selectedDestination.city}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable grid container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDestinations.map((dest) => {
              const isSelected = selectedDestination?.id === dest.id;

              return (
                <div
                  key={dest.id}
                  onClick={() => onSelectDestination(dest)}
                  className={`group relative rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col bg-slate-900/70 hover:bg-slate-900 ${
                    isSelected
                      ? 'border-sky-500 ring-2 ring-sky-500/30 shadow-xl shadow-sky-500/10'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Image cover with overlay badge */}
                  <div className="h-44 w-full relative overflow-hidden bg-slate-800 shrink-0">
                    <img
                      src={dest.coverImage}
                      alt={dest.city}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    {/* Vibe Match Badge */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-semibold text-sky-400 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      <span>{dest.vibeMatch}% Vibe Match</span>
                    </div>

                    {/* Live Weather Forecast pill */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-medium text-amber-300 flex items-center space-x-1">
                      <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{dest.weatherForecast?.tempC ?? 22}°C</span>
                    </div>

                    {/* City Title on Image */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-white tracking-tight">
                          {dest.city}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">
                          {dest.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {dest.tagline}
                    </p>

                    {/* Live Seasonality & Flight Metadata */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 flex items-center">
                          <Flame className="w-3 h-3 mr-1 text-orange-400" />
                          Season:
                        </span>
                        <span className="font-medium text-slate-200">
                          {dest.seasonality.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center">
                          <TrendingDown className="w-3 h-3 mr-1 text-emerald-400" />
                          Est. Flight Fare:
                        </span>
                        <span className="font-semibold text-emerald-400 font-mono">
                          {formatPrice(dest.estimatedFlightCost, preferences.currency)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center">
                          <Info className="w-3 h-3 mr-1 text-sky-400" />
                          Rain Risk:
                        </span>
                        <span className="text-slate-300">
                          {dest.weatherForecast?.rainProbability ?? 15}% prob
                        </span>
                      </div>
                    </div>

                    {/* Highlights tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {dest.highlights.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="px-1.5 py-0.5 bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-700/60 truncate max-w-[170px]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    {/* Selection status */}
                    <div className="pt-2 flex items-center justify-between">
                      {isSelected ? (
                        <div className="flex items-center space-x-1.5 text-sky-400 font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-sky-400" />
                          <span>Selected Destination</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-200">
                          Click to select
                        </span>
                      )}

                      <span className="text-[11px] text-sky-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
                        Explore Flights →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
