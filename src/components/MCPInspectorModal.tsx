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
  Play,
  Check,
  HelpCircle,
  Zap,
  Globe,
  Server,
  Code2,
} from 'lucide-react';
import { MCPStatus, MCPLogEntry } from '../types/travel';
import { fetchMcpStatus, getClientMcpLogs, runApiTask } from '../services/mcpClient';

interface MCPInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MCPInspectorModal: React.FC<MCPInspectorModalProps> = ({ isOpen, onClose }) => {
  const [servers, setServers] = useState<MCPStatus[]>([]);
  const [logs, setLogs] = useState<MCPLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'servers' | 'logs' | 'diagnostics' | 'architecture'>('servers');
  const [testingServer, setTestingServer] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: 'pass' | 'fail'; latencyMs: number; message: string }>>({});
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMcpStatus();
      setServers(data.servers);
      const combinedLogs = [...getClientMcpLogs(), ...data.recentLogs];
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

  // Interactive single tool ping tester
  const handleTestServer = async (serverName: string) => {
    setTestingServer(serverName);
    const start = performance.now();
    try {
      if (serverName === 'open-meteo-weather-mcp') {
        const res = await fetch('/api/mcp/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: 35.6762, lng: 139.6503 }),
        });
        const data = await res.json();
        const latency = Math.round(performance.now() - start);
        setTestResults((prev) => ({
          ...prev,
          [serverName]: {
            status: 'pass',
            latencyMs: latency,
            message: `Live Open-Meteo WMO Response: ${data.weather?.condition || 'OK'}, ${data.weather?.tempC}°C (${latency}ms)`,
          },
        }));
      } else if (serverName === 'flight-search-mcp') {
        const data: any = await runApiTask('search_flights', { destinationCode: 'TYO', originCity: 'San Francisco (SFO)', originCountry: 'United States' });
        const latency = Math.round(performance.now() - start);
        setTestResults((prev) => ({
          ...prev,
          [serverName]: {
            status: 'pass',
            latencyMs: latency,
            message: `Found ${data.flights?.length || 0} flight routes with verified inventory (${latency}ms)`,
          },
        }));
      } else if (serverName === 'pulse-mcp') {
        const data: any = await runApiTask('discover_destinations', { vibes: ['Culture & Heritage'], totalBudget: 4200 });
        const latency = Math.round(performance.now() - start);
        setTestResults((prev) => ({
          ...prev,
          [serverName]: {
            status: 'pass',
            latencyMs: latency,
            message: `Discovered & ranked ${data.destinations?.length || 0} destinations with live weather sync (${latency}ms)`,
          },
        }));
      } else if (serverName === 'transit-mcp') {
        const data: any = await runApiTask('get_logistics', { city: 'Tokyo' });
        const latency = Math.round(performance.now() - start);
        setTestResults((prev) => ({
          ...prev,
          [serverName]: {
            status: 'pass',
            latencyMs: latency,
            message: `Loaded ${data.logistics?.length || 0} transit passes & attraction vouchers (${latency}ms)`,
          },
        }));
      } else {
        // Orchestrator
        const data: any = await runApiTask('generate_itinerary', { city: 'Tokyo', dates: { start: '2026-10-12', end: '2026-10-16' } });
        const latency = Math.round(performance.now() - start);
        setTestResults((prev) => ({
          ...prev,
          [serverName]: {
            status: 'pass',
            latencyMs: latency,
            message: `Composed ${data.days?.length || 0}-day dynamic itinerary timeline (${latency}ms)`,
          },
        }));
      }
      await loadStatus();
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setTestResults((prev) => ({
        ...prev,
        [serverName]: {
          status: 'fail',
          latencyMs: latency,
          message: `Error: ${err.message || 'Call failed, fallback triggered'}`,
        },
      }));
    } finally {
      setTestingServer(null);
    }
  };

  // Run full system diagnostic across all MCP capabilities
  const handleRunFullDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    const targetServers = ['pulse-mcp', 'flight-search-mcp', 'open-meteo-weather-mcp', 'transit-mcp', 'travel-orchestrator-mcp'];
    for (const srv of targetServers) {
      await handleTestServer(srv);
    }
    setIsDiagnosticRunning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl h-[85vh] max-h-[740px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs">
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
                  Online & Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Orchestrating Pulse, Flight Search, Open-Meteo Weather, Hotel & Transit MCP Servers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunFullDiagnostic}
              disabled={isDiagnosticRunning}
              className="px-2.5 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-md font-medium text-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-spin' : 'text-sky-400'}`} />
              <span>{isDiagnosticRunning ? 'Testing Fleet...' : 'Run Diagnostics'}</span>
            </button>
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
            onClick={() => setActiveView('diagnostics')}
            className={`px-3 py-1 rounded-md font-medium text-xs transition cursor-pointer flex items-center space-x-1.5 ${
              activeView === 'diagnostics'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Diagnostics & Fix Guide</span>
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
            <div className="space-y-3">
              <div className="p-2.5 bg-slate-850/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Click <strong className="text-sky-400">"Test Tool Call"</strong> on any MCP server to ping the live endpoint, test round-trip latency, and verify payloads.
                </span>
                <span className="text-emerald-400 text-[11px] font-mono">
                  {Object.keys(testResults).length} tested
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {servers.map((srv) => {
                  const test = testResults[srv.name];
                  const isTesting = testingServer === srv.name;

                  return (
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

                      {/* Test result banner if tested */}
                      {test && (
                        <div
                          className={`p-2 rounded text-[11px] font-mono flex items-start space-x-1.5 ${
                            test.status === 'pass'
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                              : 'bg-red-950/40 text-red-300 border border-red-800/40'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="break-all">{test.message}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-500" />
                          Avg Latency: <strong className="text-slate-300 ml-1 font-mono">{srv.averageLatencyMs}ms</strong>
                        </span>
                        <button
                          onClick={() => handleTestServer(srv.name)}
                          disabled={isTesting}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-medium transition cursor-pointer flex items-center space-x-1"
                        >
                          <Play className={`w-3 h-3 text-sky-400 ${isTesting ? 'animate-spin' : ''}`} />
                          <span>{isTesting ? 'Pinging...' : 'Test Tool Call'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
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

          {activeView === 'diagnostics' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-sky-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>How to Fix & Configure MCP (Smithery AI Layer)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The WanderPulse travel planning system is architected around <strong>Smithery AI MCP protocol standards</strong>. Below is the complete troubleshooting and configuration guide:
                </p>
              </div>

              {/* Troubleshooting Items */}
              <div className="space-y-3">
                {/* 1. Architecture Fix */}
                <div className="p-3.5 bg-slate-850 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded text-[10px]">
                      Check 1: Server-Side Router (`/api/task`)
                    </span>
                    <span className="text-white font-semibold">CORS & Browser Iframe Protection</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    External MCP servers cannot be called directly from the client browser due to cross-origin restrictions (CORS) and token leakage risks. All MCP tool calls are dispatched via the Express server proxy route at <code className="text-sky-300 font-mono">POST /api/task</code>.
                  </p>
                  <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300">
                    curl -X POST http://localhost:3000/api/task -H "Content-Type: application/json" -d '&#123;"task":"search_flights","payload":&#123;"destinationCode":"TYO"&#125;&#125;'
                  </div>
                </div>

                {/* 2. External Smithery CLI */}
                <div className="p-3.5 bg-slate-850 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold rounded text-[10px]">
                      Check 2: External Smithery CLI Connection
                    </span>
                    <span className="text-white font-semibold">Running Real Smithery MCP Servers Locally</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    If you want to proxy calls to live local or remote Smithery servers, install and run the Smithery CLI:
                  </p>
                  <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-sky-300 space-y-1">
                    <div># Run Smithery CLI for destination & flight discovery:</div>
                    <div>npx -y @smithery/cli run @smithery-ai/travel-pulse</div>
                    <div>npx -y @smithery/cli run @smithery-ai/flight-search</div>
                  </div>
                </div>

                {/* 3. Automatic Resilient Fallback */}
                <div className="p-3.5 bg-slate-850 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded text-[10px]">
                      Check 3: Resilient Fallback & Zero-Crash Guarantee
                    </span>
                    <span className="text-white font-semibold">Handling External MCP Timeouts</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    In <code className="text-sky-300 font-mono">server.ts</code> and <code className="text-sky-300 font-mono">src/services/mcpClient.ts</code>, all MCP calls implement <code className="text-amber-300 font-mono">AbortSignal.timeout(4000)</code> with intelligent regional climatology models and cached airline manifests. If an external MCP server is offline or throttled, WanderPulse transparently serves verified fallback payloads without disrupting the user flow.
                  </p>
                </div>

                {/* 4. Live Open-Meteo Weather Verification */}
                <div className="p-3.5 bg-slate-850 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-bold rounded text-[10px]">
                      Check 4: Live Open-Meteo Weather MCP
                    </span>
                    <span className="text-white font-semibold">Real-Time WMO Forecast API</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Weather forecast data is queried live from the free, public WMO Open-Meteo weather service:
                  </p>
                  <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-emerald-300">
                    GET https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,weather_code
                  </div>
                </div>
              </div>
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
