import React, { useState } from 'react';
import {
  Share2,
  Printer,
  Download,
  Copy,
  Check,
  Plane,
  Building,
  Calendar,
  DollarSign,
  Ticket,
  CloudSun,
  ShieldCheck,
  ExternalLink,
  QrCode,
  FileText,
} from 'lucide-react';
import {
  TripState,
  CurrencyCode,
} from '../types/travel';
import { formatPrice } from '../services/localStorageDb';

interface TabTripSummaryShareProps {
  tripState: TripState;
  onNavigateToTab: (tabId: number) => void;
}

export const TabTripSummaryShare: React.FC<TabTripSummaryShareProps> = ({
  tripState,
  onNavigateToTab,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const { preferences, selectedDestination, selectedFlight, itinerary, bookings } = tripState;

  // Calculate budget breakdown
  const flightTotal = (selectedFlight?.price || 0) * preferences.partySize;
  const hotelTotal = bookings.filter((b) => b.type === 'hotel').reduce((sum, b) => sum + (b.price * 5), 0);
  const transitTotal = bookings.filter((b) => b.type === 'transit').reduce((sum, b) => sum + (b.price * preferences.partySize), 0);
  const attractionTotal = bookings.filter((b) => b.type === 'attraction').reduce((sum, b) => sum + (b.price * preferences.partySize), 0);
  
  const activitiesTotal = itinerary.reduce((sum, day) => {
    return sum + day.activities.reduce((dSum, act) => dSum + act.cost, 0);
  }, 0) * preferences.partySize;

  const totalCommitted = flightTotal + hotelTotal + transitTotal + attractionTotal + activitiesTotal;
  const remainingBudget = preferences.totalBudget - totalCommitted;
  const percentageSpent = Math.min(100, Math.round((totalCommitted / Math.max(1, preferences.totalBudget)) * 100));

  const handleCopyLink = () => {
    const fakeShareUrl = `${window.location.origin}/?trip=${encodeURIComponent(selectedDestination?.city || 'Tokyo')}&ref=WANDER-PULSE-${Date.now().toString(36)}`;
    navigator.clipboard.writeText(fakeShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const lines = [
      `# WanderPulse Trip Itinerary: ${selectedDestination?.city || 'Target City'}, ${selectedDestination?.country || ''}`,
      `Generated via WanderPulse MCP Orchestrator`,
      ``,
      `## Overview`,
      `- Dates: ${preferences.startDate} to ${preferences.endDate}`,
      `- Party Size: ${preferences.partySize} travelers`,
      `- Total Budget: ${formatPrice(preferences.totalBudget, preferences.currency)}`,
      `- Total Committed: ${formatPrice(totalCommitted, preferences.currency)}`,
      ``,
      `## Flight Details`,
      `- Airline: ${selectedFlight?.airline || 'Not selected'} (${selectedFlight?.flightNumber || ''})`,
      `- Route: ${selectedFlight?.departureAirport} -> ${selectedFlight?.arrivalAirport}`,
      `- Fare: ${formatPrice(flightTotal, preferences.currency)}`,
      ``,
      `## Daily Itinerary Schedule`,
      ...itinerary.flatMap((day) => [
        `### Day ${day.dayNumber}: ${day.theme} (${day.date})`,
        `Weather: ${day.forecast.tempC}°C, ${day.forecast.condition} ${day.rainModeActive ? '[RAIN CONTINGENCY ACTIVE]' : ''}`,
        ...day.activities.map((a) => `- ${a.timeSlot}: ${a.title} (${a.location}) - ${formatPrice(a.cost, preferences.currency)}`),
        ``,
      ]),
      `## Confirmed Bookings & Logistics`,
      ...bookings.map((b) => `- [${b.status.toUpperCase()}] ${b.title} (${b.provider}) - Ref: ${b.bookingRef || 'Pending'}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WanderPulse-${selectedDestination?.city || 'Trip'}-MasterPlan.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden bg-slate-950">
      {/* Top Action Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 px-4 py-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-sky-400" />
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              Trip Summary & Master Export
            </h1>
            <p className="text-[11px] text-slate-400">
              Consolidated flight, stay, schedule, and expenditure portfolio
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-md text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Share Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-md text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-md text-xs font-semibold shadow-md shadow-sky-500/20 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Main Container (Isolated vertical scroll) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {/* Top Hero Summary Banner */}
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-5 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 block mb-1">
                Master Travel Brief • WanderPulse
              </span>
              <h2 className="text-2xl font-black text-white">
                {selectedDestination ? `${selectedDestination.city}, ${selectedDestination.country}` : 'Tokyo, Japan'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-sky-400" />
                  {preferences.startDate} to {preferences.endDate}
                </span>
                <span>•</span>
                <span>{preferences.partySize} {preferences.partySize === 1 ? 'Traveler' : 'Travelers'}</span>
                <span>•</span>
                <span className="flex items-center text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Offline Sync Ready
                </span>
              </div>
            </div>

            {/* Quick QR preview badge */}
            <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl shrink-0">
              <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-950" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-mono">Mobile Pass Passkey</span>
                <span className="text-xs font-bold text-sky-300 font-mono">WP-PASS-{selectedDestination?.code || 'TYO'}-2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Progress & Category Breakdown */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white flex items-center">
              <DollarSign className="w-4 h-4 text-emerald-400 mr-1" />
              Total Budget Health & Expenditure Breakdown
            </span>
            <span className="text-slate-400 font-mono">
              Spent <strong className="text-emerald-400">{formatPrice(totalCommitted, preferences.currency)}</strong> of {formatPrice(preferences.totalBudget, preferences.currency)} ({percentageSpent}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${percentageSpent}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                percentageSpent > 90 ? 'bg-amber-500' : 'bg-gradient-to-r from-sky-400 to-emerald-400'
              }`}
            />
          </div>

          {/* Category Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Flights ({preferences.partySize} pax)</span>
              <span className="font-bold text-white font-mono">{formatPrice(flightTotal, preferences.currency)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Stays & Hotels</span>
              <span className="font-bold text-white font-mono">{formatPrice(hotelTotal, preferences.currency)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Transit & Attractions</span>
              <span className="font-bold text-white font-mono">{formatPrice(transitTotal + attractionTotal, preferences.currency)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Itinerary Activities</span>
              <span className="font-bold text-emerald-400 font-mono">{formatPrice(activitiesTotal, preferences.currency)}</span>
            </div>
          </div>
        </div>

        {/* Flight & Hotel Master Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Confirmed Flight Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center">
                <Plane className="w-4 h-4 mr-1.5 text-sky-400" />
                Air Transit (Confirmed)
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold rounded">
                Ticketed
              </span>
            </div>

            {selectedFlight ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{selectedFlight.airline}</span>
                  <span className="font-mono text-slate-400">{selectedFlight.flightNumber}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300 font-mono">
                  <span>{selectedFlight.departureAirport} ({selectedFlight.departureTime})</span>
                  <span>→</span>
                  <span>{selectedFlight.arrivalAirport} ({selectedFlight.arrivalTime})</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {selectedFlight.cabinClass} • {selectedFlight.baggage} • {selectedFlight.aircraft}
                </div>
              </div>
            ) : (
              <div className="text-slate-400 py-2">No flight selected yet.</div>
            )}
          </div>

          {/* Bookings & Passes Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center">
                <Ticket className="w-4 h-4 mr-1.5 text-indigo-400" />
                Logistics & Passes ({bookings.filter((b) => b.status === 'confirmed').length} Locked)
              </span>
              <button
                onClick={() => onNavigateToTab(4)}
                className="text-[10px] text-sky-400 hover:underline cursor-pointer"
              >
                Manage in Tab 4 →
              </button>
            </div>

            <div className="space-y-2">
              {bookings.slice(0, 3).map((b) => (
                <div key={b.id} className="flex justify-between items-center p-2 rounded bg-slate-800/40 border border-slate-800">
                  <div className="truncate max-w-[220px]">
                    <span className="font-medium text-slate-200 block truncate">{b.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Ref: {b.bookingRef || 'Pending'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Master Daily Schedule Matrix */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white text-xs flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-sky-400" />
              Day-by-Day Master Schedule
            </span>
            <button
              onClick={() => onNavigateToTab(3)}
              className="text-xs text-sky-400 hover:underline cursor-pointer"
            >
              Edit in Tab 3 →
            </button>
          </div>

          <div className="space-y-4">
            {itinerary.map((day) => (
              <div key={day.dayNumber} className="border-l-2 border-sky-500/40 pl-3 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-xs">
                    Day {day.dayNumber}: {day.theme}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">({day.date})</span>
                  {day.rainModeActive && (
                    <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 text-[10px] rounded border border-cyan-500/30">
                      Rain Backup Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 text-xs">
                  {day.activities.map((act) => (
                    <div key={act.id} className="p-2 rounded bg-slate-850/60 border border-slate-800">
                      <span className="text-[10px] text-sky-400 font-mono block">{act.timeSlot}</span>
                      <span className="font-semibold text-slate-200 block truncate">{act.title}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{act.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
