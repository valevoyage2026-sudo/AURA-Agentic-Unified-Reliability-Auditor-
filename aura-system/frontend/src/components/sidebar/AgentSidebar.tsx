import React from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import { AgentId } from '../../types/verification';
import {
  Layers,
  HelpCircle,
  Search,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Database,
  FileText,
  AlertTriangle,
  PlayCircle,
  FileCode,
  Image as ImageIcon,
  Clock,
  List,
} from 'lucide-react';

const agentIcons: Record<AgentId, React.ReactNode> = {
  orchestrator: <Layers className="w-4 h-4 text-cyan-400" />,
  planner: <HelpCircle className="w-4 h-4 text-sky-400" />,
  searcher: <Search className="w-4 h-4 text-blue-400" />,
  researcher: <Sparkles className="w-4 h-4 text-cyan-400" />,
  verifier: <CheckCircle2 className="w-4 h-4 text-amber-400" />,
  analyst: <BarChart3 className="w-4 h-4 text-purple-400" />,
  evaluator: <Database className="w-4 h-4 text-slate-400" />,
  writer: <FileText className="w-4 h-4 text-emerald-400" />,
};

export const AgentSidebar: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const isLeftSidebarOpen = useAuraStore((s) => s.isLeftSidebarOpen);
  const agents = useAuraStore((s) => s.agents);
  const selectedAgentId = useAuraStore((s) => s.selectedAgentId);
  const activeTab = useAuraStore((s) => s.activeTab);
  const mission = useAuraStore((s) => s.mission);

  if (!isLeftSidebarOpen) return null;

  const isDark = theme === 'dark';
  const agentList = Object.values(agents);

  const navItems = [
    { id: 'Overview', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
    { id: 'Executions', label: 'Executions', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'Agents', label: 'Agents', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'Evidence', label: 'Evidence', icon: <FileText className="w-4 h-4" /> },
    { id: 'Artifacts', label: 'Artifacts', icon: <FileCode className="w-4 h-4" /> },
    { id: 'Logs', label: 'Logs', icon: <List className="w-4 h-4" /> },
  ] as const;

  return (
    <aside
      className={`w-64 border-r flex flex-col justify-between overflow-y-auto select-none p-3 gap-4 transition-colors ${
        isDark ? 'bg-slate-950/80 border-slate-900 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      {/* Top Navigation Tabs List */}
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => auraStore.setActiveTab(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? isDark
                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 shadow-sm'
                    : 'bg-cyan-100 text-cyan-700 border border-cyan-300 shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className={`w-full h-px ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`} />

      {/* Agents Roster Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            AGENTS
          </span>
          <span className="text-[10px] text-cyan-400 font-mono font-bold">7/8 active</span>
        </div>

        <div className="flex flex-col gap-1">
          {agentList.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => auraStore.selectAgent(agent.id)}
                className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-slate-900 border-cyan-500/60 text-slate-100 shadow-md shadow-cyan-950/40'
                      : 'bg-white border-cyan-400 text-slate-900 shadow-md shadow-cyan-100'
                    : isDark
                    ? 'bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                    {agentIcons[agent.id]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold tracking-wide">{agent.name}</span>
                    <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate max-w-[110px]`}>
                      {agent.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {agent.status === 'conflict' ? (
                    <span className="flex items-center gap-0.5 text-[9px] text-amber-400 font-semibold">
                      <AlertTriangle className="w-3 h-3" /> Conflict
                    </span>
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        agent.status === 'active'
                          ? 'bg-cyan-400 animate-pulse'
                          : agent.status === 'processing'
                          ? 'bg-purple-400'
                          : agent.status === 'completed'
                          ? 'bg-emerald-400'
                          : agent.status === 'waiting'
                          ? 'bg-sky-400'
                          : 'bg-slate-500'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom CURRENT EXECUTION Card (Matching Reference Image) */}
      <div className={`p-3 rounded-xl border flex flex-col gap-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <span className={`text-[9px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          CURRENT EXECUTION
        </span>
        <span className="text-xs font-bold text-cyan-400 truncate">{mission.title}</span>

        <div className="w-full h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${mission.progress}%` }} />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono pt-1">
          <span className="text-emerald-400 font-semibold">7 / 8 agents</span>
          <span className="text-amber-400 font-semibold">1 issue</span>
        </div>

        <div className={`flex items-center gap-1 text-[9px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <Clock className="w-3 h-3" />
          <span>Started 21:04 • 4m 32s</span>
        </div>
      </div>
    </aside>
  );
};
