import React, { useState } from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import { AgentId } from '../../types/verification';
import { Activity, CheckCircle2, AlertTriangle, Clock, ArrowRight, Shield, Sparkles, Search, BarChart3, Database, FileText, HelpCircle } from 'lucide-react';

const agentIcons: Record<AgentId, React.ReactNode> = {
  orchestrator: <Shield className="w-3.5 h-3.5 text-amber-400" />,
  planner: <HelpCircle className="w-3.5 h-3.5 text-sky-400" />,
  searcher: <Search className="w-3.5 h-3.5 text-blue-400" />,
  researcher: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
  verifier: <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />,
  analyst: <BarChart3 className="w-3.5 h-3.5 text-purple-400" />,
  evaluator: <Database className="w-3.5 h-3.5 text-slate-400" />,
  writer: <FileText className="w-3.5 h-3.5 text-emerald-400" />,
};

export const ExecutionFlowTimeline: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const events = useAuraStore((s) => s.events);
  const sources = useAuraStore((s) => s.sources);
  const selectedAgentId = useAuraStore((s) => s.selectedAgentId);

  const [timelineTab, setTimelineTab] = useState<'All' | 'Agents' | 'Evidence' | 'Errors' | 'System'>('All');
  const [rightTab, setRightTab] = useState<'Evidence' | 'Claims'>('Evidence');

  const isDark = theme === 'dark';

  return (
    <div className={`h-64 border-t flex select-none z-10 font-sans transition-colors ${isDark ? 'bg-slate-950/90 border-slate-900 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
      {/* Left Sub-Panel: Execution Timeline Stream */}
      <div className={`flex-1 border-r p-3 flex flex-col gap-2 overflow-hidden ${isDark ? 'border-slate-900' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            EXECUTION TIMELINE
          </span>
          <div className={`flex items-center gap-1 p-0.5 rounded-lg border text-[10px] font-semibold ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
            {(['All', 'Agents', 'Evidence', 'Errors', 'System'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTimelineTab(tab)}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  timelineTab === tab
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Log Stream */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => auraStore.selectAgent(evt.sourceAgentId)}
              className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                selectedAgentId === evt.sourceAgentId
                  ? isDark
                    ? 'bg-slate-900 border-cyan-500/60 shadow-md'
                    : 'bg-white border-cyan-400 shadow-md'
                  : isDark
                  ? 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-cyan-400 shrink-0">{evt.timestamp}</span>
                <div className={`p-1 rounded-md border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  {agentIcons[evt.sourceAgentId]}
                </div>
                <span className="font-medium text-slate-200 truncate max-w-md">{evt.message}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  evt.type === 'conflict_detected'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : evt.type === 'conflict_resolved'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                }`}>
                  {evt.sourceAgentId}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sub-Panel: Evidence & Claims Sources List (Matching Reference Images) */}
      <div className="w-80 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            EVIDENCE & CLAIMS
          </span>
          <div className={`flex items-center gap-1 p-0.5 rounded-lg border text-[10px] font-semibold ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
            {(['Evidence', 'Claims'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`px-3 py-0.5 rounded-md transition-all cursor-pointer ${
                  rightTab === tab
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Sources List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {sources.map((src) => (
            <div
              key={src.id}
              className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center font-mono text-[10px] font-bold text-cyan-400">
                  {src.id}
                </span>
                <div className="flex flex-col truncate">
                  <span className="font-bold text-[11px] truncate">{src.domain}</span>
                  <span className={`text-[9px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{src.title}</span>
                </div>
              </div>

              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  src.trustTier === 'High'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    : src.trustTier === 'Medium'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                    : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                }`}
              >
                {src.trustTier}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
