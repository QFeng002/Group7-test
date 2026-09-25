import React from 'react';
import { Compass, Cpu, RotateCcw, ShieldCheck, Sparkles, CloudSun } from 'lucide-react';
import { CurrencyCode, DestinationProposal } from '../types/travel';
import { CURRENCY_SYMBOLS } from '../services/localStorageDb';

interface HeaderProps {
  currentTab: number;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  selectedDestination: DestinationProposal | null;
  onOpenMcpInspector: () => void;
  onResetTrip: () => void;
  lastSavedAt: string;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  selectedDestination,
  onOpenMcpInspector,
  onResetTrip,
  lastSavedAt,
}) => {
  const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD'];

  return (
    <header className="h-14 bg-slate-900/90 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 backdrop-blur-md">
      {/* Brand logo & title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-sky-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
            <Compass className="w-4 h-4 text-sky-400 animate-spin-slow" />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-slate-100 via-white to-slate-300 bg-clip-text text-transparent">
              WanderPulse
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
              MCP Orchestrator
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Intelligent Desktop Travel Planning Workspace
          </span>
        </div>
      </div>

      {/* Selected destination pill indicator */}
      {selectedDestination && (
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-slate-800/60 border border-slate-700/60 rounded-full text-xs">
          <span className="text-slate-400">Target:</span>
          <span className="font-semibold text-slate-200">{selectedDestination.city}, {selectedDestination.country}</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 flex items-center">
            <CloudSun className="w-3.5 h-3.5 mr-1" />
            {selectedDestination.weatherForecast?.tempC ?? 22}°C
          </span>
        </div>
      )}

      {/* Action controls & Currency Selector */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/70 rounded-md px-2 py-1 text-xs">
          <span className="text-slate-400 mr-1.5 font-mono">{CURRENCY_SYMBOLS[currency]}</span>
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            title="Preferred Currency"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr} className="bg-slate-900 text-slate-200">
                {curr}
              </option>
            ))}
          </select>
        </div>

        {/* MCP Server Inspector Toggle */}
        <button
          onClick={onOpenMcpInspector}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:border-indigo-500/50 rounded-md text-xs font-medium transition cursor-pointer"
          title="Open Smithery AI MCP Server Inspector"
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">MCP Console</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>

        {/* Reset Trip */}
        <button
          onClick={onResetTrip}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition cursor-pointer"
          title="Reset Trip Plan"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Offline sync status */}
        <div className="hidden xl:flex items-center text-[11px] text-slate-400 pl-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1" />
          <span>Synced</span>
        </div>
      </div>
    </header>
  );
};
