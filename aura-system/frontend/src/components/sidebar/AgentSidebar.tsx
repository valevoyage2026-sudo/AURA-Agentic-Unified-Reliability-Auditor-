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

      {/* Bottom System Status Box */}
      <div className={`p-3 rounded-none border flex flex-col gap-1.5 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <span className={`text-[9px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          AUDITOR ENGINE
        </span>
        <div className={`flex items-center justify-between text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <span>Determinism Cap</span>
          <span className={`font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>100%</span>
        </div>
        <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
          Zero-hallucination evidence bound
        </div>
      </div>
    </aside>
  );
};
