import React from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import { AgentId } from '../../types/verification';
import {
  ShieldCheck,
  Sliders,
  Layers,
  HelpCircle,
  Search,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Database,
  FileText,
  PlayCircle,
  FileCode,
  List,
  ExternalLink,
  Server
} from 'lucide-react';

const agentIcons: Record<AgentId, React.ReactNode> = {
  orchestrator: <Layers className="w-4 h-4 text-indigo-400" />,
  planner: <HelpCircle className="w-4 h-4 text-slate-300" />,
  searcher: <Search className="w-4 h-4 text-slate-300" />,
  researcher: <Sparkles className="w-4 h-4 text-slate-300" />,
  verifier: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  analyst: <BarChart3 className="w-4 h-4 text-slate-300" />,
  evaluator: <Database className="w-4 h-4 text-slate-300" />,
  writer: <FileText className="w-4 h-4 text-slate-300" />,
};

export const AgentSidebar: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const isLeftSidebarOpen = useAuraStore((s) => s.isLeftSidebarOpen);
  const agents = useAuraStore((s) => s.agents);
  const selectedAgentId = useAuraStore((s) => s.selectedAgentId);
  const activeTab = useAuraStore((s) => s.activeTab);

  if (!isLeftSidebarOpen) return null;

  const isDark = theme === 'dark';
  const agentList = Object.values(agents);

  const navItems = [
    { id: 'AuditWorkbench', label: 'Audit Workbench', icon: <ShieldCheck className="w-4 h-4 text-indigo-400" /> },
    { id: 'AgentConfig', label: 'Agent Configurator', icon: <Sliders className="w-4 h-4 text-indigo-400" /> },
    { id: 'Overview', label: 'Executive Overview', icon: <Layers className="w-4 h-4" /> },
    { id: 'Executions', label: 'Audit Executions', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'Agents', label: 'Agent Pipeline', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'Evidence', label: 'Knowledge Base', icon: <FileText className="w-4 h-4" /> },
    { id: 'Artifacts', label: 'Certificates', icon: <FileCode className="w-4 h-4" /> },
    { id: 'Logs', label: 'Audit Logs', icon: <List className="w-4 h-4" /> },
  ] as const;

  return (
    <aside
      className={`w-60 border-r flex flex-col justify-between overflow-y-auto select-none p-3 gap-4 transition-colors ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
          Auditor Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => auraStore.setActiveTab(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? isDark
                    ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/80 border-l-2 border-l-indigo-500 font-bold'
                    : 'bg-indigo-50 text-indigo-900 border border-indigo-200 border-l-2 border-l-indigo-600 font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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

      {/* Infrastructure Tools (pgAdmin, Qdrant, Neo4j) */}
      <div className="flex flex-col gap-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1 flex items-center justify-between">
          <span>Infrastructure Tools</span>
          <Server className="w-3 h-3 text-slate-500" />
        </div>

        <a
          href="http://localhost:5050"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2 rounded-none border border-slate-900 bg-slate-950/60 hover:bg-slate-900 text-xs text-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-[11px]">pgAdmin 4 (Postgres)</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        <a
          href="http://localhost:6333/dashboard"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2 rounded-none border border-slate-900 bg-slate-950/60 hover:bg-slate-900 text-xs text-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-[11px]">Qdrant Vector DB</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        <a
          href="http://localhost:7474"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2 rounded-none border border-slate-900 bg-slate-950/60 hover:bg-slate-900 text-xs text-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-[11px]">Neo4j Graph UI</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>
      </div>

      <div className={`w-full h-px ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`} />

      {/* Bottom System Status Box */}
      <div className={`p-3 rounded-none border flex flex-col gap-1.5 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <span className="text-[9px] font-bold tracking-wider uppercase text-slate-500">
          AUDITOR ENGINE
        </span>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Determinism Cap</span>
          <span className="font-mono text-emerald-400 font-bold">100%</span>
        </div>
        <div className="text-[10px] text-slate-500">
          Zero-hallucination evidence bound
        </div>
      </div>
    </aside>
  );
};
