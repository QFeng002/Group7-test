import React, { useState } from 'react';
import {
  CalendarDays,
  CloudRain,
  Sun,
  Umbrella,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  Ticket,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  ItineraryDay,
  ActivityItem,
  TripPreferences,
  DestinationProposal,
} from '../types/travel';
import { formatPrice } from '../services/localStorageDb';
import { AddActivityModal } from './AddActivityModal';

interface TabItineraryBuilderProps {
  destination: DestinationProposal | null;
  preferences: TripPreferences;
  itinerary: ItineraryDay[];
  onToggleRainMode: (dayNumber: number) => void;
  onMoveActivity: (dayNumber: number, activityIndex: number, direction: 'up' | 'down') => void;
  onDeleteActivity: (dayNumber: number, activityId: string) => void;
  onAddActivity: (dayNumber: number, activity: ActivityItem) => void;
  onProceedToBookings: () => void;
}

export const TabItineraryBuilder: React.FC<TabItineraryBuilderProps> = ({
  destination,
  preferences,
  itinerary,
  onToggleRainMode,
  onMoveActivity,
  onDeleteActivity,
  onAddActivity,
  onProceedToBookings,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const currentDay = itinerary[activeDayIndex] || itinerary[0];

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-xl">
          <CalendarDays className="w-10 h-10 text-sky-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-2">Itinerary Not Generated Yet</h3>
          <p className="text-xs text-slate-400 mb-4">
            Please confirm your destination and flight in Tab 2 to initiate the Travel Orchestrator base itinerary.
          </p>
        </div>
      </div>
    );
  }

  const totalDayCost = currentDay.activities.reduce((sum, act) => sum + act.cost, 0);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden bg-slate-950">
      {/* Top Header & Day Selector Stepper */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 px-4 py-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-4 h-4 text-sky-400" />
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              Dynamic Itinerary Builder ({destination?.city ?? 'Target City'})
            </h1>
            <p className="text-[11px] text-slate-400">
              Interactive timeline with seasonal event anchors & wet-weather contingency replanner
            </p>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {itinerary.map((day, idx) => {
            const isSelected = activeDayIndex === idx;
            return (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDayIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>Day {day.dayNumber}</span>
                {day.rainModeActive && (
                  <Umbrella className="w-3 h-3 text-cyan-200 fill-cyan-300/30" />
                )}
              </button>
            );
          })}
        </div>

        {/* Proceed to Bookings CTA */}
        <div>
          <button
            onClick={onProceedToBookings}
            className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-md text-xs font-semibold shadow-md shadow-sky-500/20 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <span>Proceed to Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container: Day Overview & Activities Timeline (Isolated vertical scroll) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Day Status & Wet-Weather Contingency Bar */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">
                  Day {currentDay.dayNumber}: {currentDay.theme}
                </span>
                <span className="px-2 py-0.5 bg-slate-800 text-[10px] text-slate-300 font-mono rounded">
                  {currentDay.date}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center text-amber-300">
                  <Sun className="w-3.5 h-3.5 mr-1" />
                  {currentDay.forecast.tempC}°C ({currentDay.forecast.condition})
                </span>
                <span>•</span>
                <span className="text-slate-400 font-mono">
                  Day Activities: {formatPrice(totalDayCost, preferences.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Smart Wet-Weather Contingency Action Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleRainMode(currentDay.dayNumber)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer flex items-center space-x-2 shadow-sm ${
                currentDay.rainModeActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
              }`}
              title="Toggle automatic wet-weather replanning"
            >
              {currentDay.rainModeActive ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>☀️ Return to Sunny Plan</span>
                </>
              ) : (
                <>
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>⚡ Wet-Weather Contingency Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg font-medium text-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>Add Activity</span>
            </button>
          </div>
        </div>

        {/* Rain contingency active alert banner */}
        {currentDay.rainModeActive && (
          <div className="mx-4 mt-3 px-3 py-2 bg-cyan-950/40 border border-cyan-700/50 rounded-lg text-xs text-cyan-200 flex items-start space-x-2 shrink-0">
            <Umbrella className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-cyan-300">
                Wet-Weather Contingency Auto-Replanning Active:
              </span>{' '}
              Outdoor walking routes and exposed parks were automatically substituted with sheltered indoor cultural venues & covered concourses.
              <span className="text-amber-300 font-semibold ml-1">
                Scheduled festival/theatre anchors were safeguarded and preserved.
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Activities Timeline */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
          {currentDay.activities.map((act, index) => {
            const isFirst = index === 0;
            const isLast = index === currentDay.activities.length - 1;

            return (
              <div
                key={act.id}
                className={`p-3.5 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  act.isAnchorEvent
                    ? 'bg-indigo-950/20 border-indigo-500/30'
                    : currentDay.rainModeActive && !act.isOutdoor
                    ? 'bg-cyan-950/20 border-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Time slot & Main Info */}
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="w-24 shrink-0 flex flex-col">
                    <span className="font-mono text-xs font-bold text-sky-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {act.timeSlot}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {act.recommendedDuration}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <h4 className="font-bold text-white text-sm truncate">
                        {act.title}
                      </h4>

                      <span className="px-1.5 py-0.5 bg-slate-800 text-[10px] font-medium text-slate-300 rounded border border-slate-700/60">
                        {act.category}
                      </span>

                      {act.isAnchorEvent && (
                        <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold rounded flex items-center">
                          <Sparkles className="w-2.5 h-2.5 mr-1" />
                          Anchor Event / Festival
                        </span>
                      )}

                      {act.isOutdoor ? (
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] rounded">
                          Outdoor
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] rounded">
                          Sheltered / Indoor
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-1.5">
                      {act.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                        {act.location}
                      </span>

                      {act.weatherImpact && (
                        <span className="text-amber-400/90 text-[10px] flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {act.weatherImpact}
                        </span>
                      )}

                      {act.transitNote && (
                        <span className="text-cyan-400 text-[10px]">
                          {act.transitNote}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Cost & Reorder Controls */}
                <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {act.cost > 0 ? formatPrice(act.cost, preferences.currency) : 'Free Admission'}
                    </span>
                    <span className="text-[10px] text-slate-500">per person</span>
                  </div>

                  {/* Reordering Controls */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onMoveActivity(currentDay.dayNumber, index, 'up')}
                      disabled={isFirst}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition cursor-pointer"
                      title="Move Activity Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveActivity(currentDay.dayNumber, index, 'down')}
                      disabled={isLast}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition cursor-pointer"
                      title="Move Activity Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteActivity(currentDay.dayNumber, act.id)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition cursor-pointer"
                      title="Remove Activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        dayNumber={currentDay.dayNumber}
        onAddActivity={onAddActivity}
      />
    </div>
  );
};
