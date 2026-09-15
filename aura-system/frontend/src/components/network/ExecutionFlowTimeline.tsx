import React from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import { AgentId } from '../../types/verification';
import { Sparkles, Search, BarChart3, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

const stepIcons: Record<AgentId, React.ReactNode> = {
  orchestrator: null,
  planner: null,
  researcher: <Sparkles className="w-4 h-4 text-cyan-400" />,
  searcher: <Search className="w-4 h-4 text-indigo-400" />,
  analyst: <BarChart3 className="w-4 h-4 text-purple-400" />,
  verifier: <CheckCircle2 className="w-4 h-4 text-amber-400" />,
  evaluator: null,
  writer: <FileText className="w-4 h-4 text-emerald-400" />,
};

export const ExecutionFlowTimeline: React.FC = () => {
  const executionFlow = useAuraStore((s) => s.executionFlow);
  const selectedAgentId = useAuraStore((s) => s.selectedAgentId);

  return (
    <div className="bg-slate-950/80 border-t border-slate-900 px-6 py-3 select-none z-10 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">EXECUTION FLOW</span>
      </div>

      <div className="flex items-center justify-between gap-4 overflow-x-auto py-1">
        {executionFlow.map((step, idx) => {
          const isSelected = selectedAgentId === step.agentId;
          const isLast = idx === executionFlow.length - 1;

          return (
            <React.Fragment key={step.agentId}>
              <button
                onClick={() => auraStore.selectAgent(step.agentId)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40 text-slate-100'
                    : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center">
                  {stepIcons[step.agentId]}
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200">{step.name}</span>
                  <span className="text-[10px] text-slate-400">{step.statusText}</span>
                  <span className="text-[9px] font-mono text-cyan-400">{step.durationText}</span>
                </div>
              </button>

              {!isLast && (
                <div className="flex items-center text-slate-700">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
