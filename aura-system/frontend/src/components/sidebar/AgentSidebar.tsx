import React from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import { AgentId } from '../../types/verification';
import {
  Cpu,
  Search,
  CheckCircle2,
  FileText,
  HelpCircle,
  Database,
  BarChart3,
  Layers,
  FileCode,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

const agentIcons: Record<AgentId, React.ReactNode> = {
  orchestrator: <Layers className="w-4 h-4 text-cyan-400" />,
  planner: <HelpCircle className="w-4 h-4 text-sky-400" />,
  searcher: <Search className="w-4 h-4 text-indigo-400" />,
  researcher: <Sparkles className="w-4 h-4 text-cyan-400" />,
  verifier: <CheckCircle2 className="w-4 h-4 text-amber-400" />,
  analyst: <BarChart3 className="w-4 h-4 text-purple-400" />,
  evaluator: <Database className="w-4 h-4 text-slate-400" />,
  writer: <FileText className="w-4 h-4 text-emerald-400" />,
};

export const AgentSidebar: React.FC = () => {
  const agents = useAuraStore((s) => s.agents);
  const selectedAgentId = useAuraStore((s) => s.selectedAgentId);
  const activeTab = useAuraStore((s) => s.activeTab);
  const systemMetrics = useAuraStore((s) => s.systemMetrics);
  const artifacts = useAuraStore((s) => s.artifacts);

  const agentList = Object.values(agents);

  return (
    <aside className="w-72 bg-slate-950/70 border-r border-slate-900 flex flex-col justify-between overflow-y-auto select-none p-3 gap-5">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800 text-xs font-medium">
        {(['Overview', 'Agents', 'Artifacts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => auraStore.setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-md text-center transition-all ${
              activeTab === tab
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/50 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Agents Roster Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">AGENTS</span>
          <span className="text-[10px] text-cyan-400 font-mono font-medium">7/8 active</span>
        </div>

        <div className="flex flex-col gap-1">
          {agentList.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => auraStore.selectAgent(agent.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/50 text-slate-100 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950/50 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {agentIcons[agent.id]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold tracking-wide text-slate-200">{agent.name}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[130px]">{agent.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      agent.status === 'active'
                        ? 'bg-cyan-400 animate-pulse'
                        : agent.status === 'processing'
                        ? 'bg-purple-400'
                        : agent.status === 'waiting'
                        ? 'bg-amber-400'
                        : 'bg-slate-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Metrics Sparklines */}
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3">
        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" /> SYSTEM METRICS
        </span>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">CPU Usage</span>
            <span className="text-cyan-400 font-mono font-bold text-[11px]">{systemMetrics.cpu}%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${systemMetrics.cpu}%` }} />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 text-[11px]">Memory</span>
            <span className="text-cyan-400 font-mono font-bold text-[11px]">{systemMetrics.memory}%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${systemMetrics.memory}%` }} />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 text-[11px]">GPU Usage</span>
            <span className="text-purple-400 font-mono font-bold text-[11px]">{systemMetrics.gpu}%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full" style={{ width: `${systemMetrics.gpu}%` }} />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 text-[11px]">Disk I/O</span>
            <span className="text-indigo-400 font-mono font-bold text-[11px]">{systemMetrics.disk}%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${systemMetrics.disk}%` }} />
          </div>
        </div>
      </div>

      {/* Latest Artifacts Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">LATEST ARTIFACTS</span>
        <div className="grid grid-cols-2 gap-2">
          {artifacts.map((art) => (
            <div key={art.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-cyan-400">
                {art.type === 'markdown' ? (
                  <FileText className="w-3.5 h-3.5" />
                ) : art.type === 'json' ? (
                  <FileCode className="w-3.5 h-3.5" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px] font-semibold text-slate-200 truncate">{art.name}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span>{art.type.toUpperCase()}</span>
                <span>{art.size}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
