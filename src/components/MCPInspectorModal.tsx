import React, { useEffect, useState } from 'react';
import {
  X,
  Cpu,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Terminal,
  ExternalLink,
  Layers,
  ArrowRight,
  Database,
} from 'lucide-react';
import { MCPStatus, MCPLogEntry } from '../types/travel';
import { fetchMcpStatus, getClientMcpLogs } from '../services/mcpClient';

interface MCPInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MCPInspectorModal: React.FC<MCPInspectorModalProps> = ({ isOpen, onClose }) => {
  const [servers, setServers] = useState<MCPStatus[]>([]);
  const [logs, setLogs] = useState<MCPLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'servers' | 'logs' | 'architecture'>('servers');

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMcpStatus();
      setServers(data.servers);
      const combinedLogs = [...getClientMcpLogs(), ...data.recentLogs];
      // deduplicate by id
      const unique = Array.from(new Map(combinedLogs.map((item) => [item.id, item])).values());
      setLogs(unique);
    } catch (err) {
      console.error('Failed to load MCP status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl h-[85vh] max-h-[720px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">
                  Smithery AI MCP Integration Layer Console
                </h3>
                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-mono">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Orchestrating Pulse, Flight Search, Open-Meteo Weather, Hotel & Transit MCP Servers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadStatus}
              disabled={isLoading}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition cursor-pointer"
              title="Refresh MCP Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/40 flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveView('servers')}
            className={`px-3 py-1 rounded-md font-medium text-xs transition cursor-pointer flex items-center space-x-1.5 ${
              activeView === 'servers'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>MCP Server Fleet ({servers.length})</span>
          </button>

          <button
            onClick={() => setActiveView('logs')}
            className={`px-3 py-1 rounded-md font-medium text-xs transition cursor-pointer flex items-center space-x-1.5 ${
              activeView === 'logs'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Transaction Stream ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveView('architecture')}
            className={`px-3 py-1 rounded-md font-medium text-xs transition cursor-pointer flex items-center space-x-1.5 ${
              activeView === 'architecture'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>MCP Routing Topology</span>
          </button>
        </div>

        {/* Body content based on active view */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeView === 'servers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {servers.map((srv) => (
                <div
                  key={srv.name}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-850/60 flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{srv.displayName}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {srv.endpoint}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-semibold">
                      {srv.status}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs">{srv.description}</p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-500" />
                      Avg Latency: <strong className="text-slate-300 ml-1 font-mono">{srv.averageLatencyMs}ms</strong>
                    </span>
                    <span className="font-mono text-slate-400">
                      Calls: <strong className="text-sky-400">{srv.totalCalls}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === 'logs' && (
            <div className="space-y-2 font-mono text-[11px]">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No MCP calls logged yet. Perform actions in tabs to inspect live tool routing.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 flex flex-col space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                          {log.server}
                        </span>
                        <span className="text-white font-bold">{log.tool}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">{log.timestamp}</span>
                        <span className="text-emerald-400">{log.latencyMs}ms</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] ${
                            log.status === 'success'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-300 text-xs">
                      {log.responseSummary}
                    </div>

                    {log.params && (
                      <div className="text-[10px] text-slate-500 truncate">
                        Payload: {JSON.stringify(log.params)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeView === 'architecture' && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Full-Stack MCP Dispatch Flow (Group 7 Architecture)
              </h4>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <span><strong>Client Interface:</strong> User adjusts budget, vibes, or clicks wet-weather auto-replan.</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <span><strong>API Route (<code className="text-sky-300 font-mono">POST /api/task</code>):</strong> Central router dispatches task payloads.</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">3</span>
                  <span><strong>Smithery MCP Bus:</strong> Parallel async requests to Flight Search MCP, Open-Meteo Weather MCP, Tourism Events MCP, and Stay Hotel MCP.</span>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center shrink-0">4</span>
                  <span><strong>Travel Orchestrator MCP:</strong> Glues responses, enforces festival anchors, executes wet-weather non-destructive replanning, and synchronizes local state store.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 flex justify-between items-center text-[11px] text-slate-400 shrink-0">
          <span>Standardized JSON-RPC 2.0 Smithery AI Protocol with auto-fallback resilience</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
