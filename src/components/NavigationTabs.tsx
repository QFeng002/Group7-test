import React from 'react';
import { Compass, Plane, CalendarDays, Ticket, Share2, Check } from 'lucide-react';

interface TabItem {
  id: number;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationTabsProps {
  currentTab: number;
  onSelectTab: (tabId: number) => void;
  destinationConfirmed: boolean;
  flightConfirmed: boolean;
  itineraryReady: boolean;
}

export const TABS: TabItem[] = [
  { id: 1, label: 'Preferences & Discovery', sublabel: 'Vibe & Destination', icon: Compass },
  { id: 2, label: 'Flight & Destination', sublabel: 'Confirmation', icon: Plane },
  { id: 3, label: 'Dynamic Itinerary', sublabel: 'Schedule & Weather', icon: CalendarDays },
  { id: 4, label: 'Bookings & Logistics', sublabel: 'Hotels & Transit Passes', icon: Ticket },
  { id: 5, label: 'Trip Summary & Share', sublabel: 'Master Plan & Export', icon: Share2 },
];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentTab,
  onSelectTab,
  destinationConfirmed,
  flightConfirmed,
  itineraryReady,
}) => {
  return (
    <nav className="h-14 bg-slate-900/60 border-b border-slate-800/80 px-2 sm:px-4 md:px-6 flex items-center justify-between shrink-0 select-none overflow-x-auto no-scrollbar">
      <div className="flex items-center space-x-1 sm:space-x-2 w-full max-w-5xl mx-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          let isCompleted = false;
          if (tab.id === 1 && destinationConfirmed) isCompleted = true;
          if (tab.id === 2 && flightConfirmed) isCompleted = true;
          if (tab.id === 3 && itineraryReady) isCompleted = true;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex items-center justify-center sm:justify-start px-2.5 py-2 rounded-lg text-left transition-all duration-200 cursor-pointer group relative ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" />
              )}

              <div className="flex items-center space-x-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="hidden lg:flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate leading-tight">
                    {tab.label}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate leading-tight">
                    {tab.sublabel}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
