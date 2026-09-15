import React, { useState } from 'react';
import { useAuraStore } from '../../store/useAuraStore';
import { Activity, Clock, Cpu, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const AgentInspectorPanel: React.FC = () => {
  const selectedAgentId = useAuraStore((s) => s.selectedAgentId);
  const agent = useAuraStore((s) => s.agents[selectedAgentId]);
  const events = useAuraStore((s) => s.events);

  const [inspectorTab, setInspectorTab] = useState<'Details' | 'Inputs / Outputs' | 'Logs'>('Details');

  if (!agent) {
    return (
      <aside className="w-80 bg-slate-950/70 border-l border-slate-900 p-4 text-slate-500 text-xs">
        Select an agent to inspect details.
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-slate-950/70 border-l border-slate-900 flex flex-col justify-between overflow-y-auto select-none p-4 gap-4">
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase">{agent.name}</h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-mono font-semibold">
            {agent.status.toUpperCase()}
          </span>
        </div>

        {/* Inspector Sub-Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] font-medium">
          {(['Details', 'Inputs / Outputs', 'Logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setInspectorTab(tab)}
              className={`flex-1 py-1 rounded-md text-center transition-all ${
                inspectorTab === tab
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {inspectorTab === 'Details' && (
        <div className="flex flex-col gap-4 text-xs">
          {/* Current Task Card */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">CURRENT TASK</span>
            <p className="text-slate-200 leading-relaxed">{agent.currentTask}</p>
          </div>

          {/* Current Operation */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">CURRENT OPERATION</span>
            <div className="flex items-center gap-2 text-cyan-400 font-medium">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>{agent.currentOperation}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${agent.progress}%` }}
              />
            </div>
          </div>

          {/* Progress */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">PROGRESS</span>
            <p className="text-slate-300 font-mono text-[11px]">{agent.progressDetail}</p>
          </div>

          {/* Input / Output Quick Preview */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">INPUT</span>
            <p className="text-slate-300 text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-900 font-mono truncate">
              {agent.input}
            </p>

            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 pt-1">OUTPUT</span>
            <p className="text-slate-300 text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-900 font-mono truncate">
              {agent.output}
            </p>
          </div>

          {/* Confidence Score Bar */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">CONFIDENCE</span>
              <span className="text-cyan-400 font-mono font-bold text-[11px]">{agent.confidence}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                style={{ width: `${agent.confidence}%` }}
              />
            </div>
          </div>

          {/* Telemetry Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase">Tokens</span>
              <span className="text-xs font-mono font-bold text-slate-200">{agent.tokens}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase">Latency</span>
              <span className="text-xs font-mono font-bold text-slate-200">{agent.latencyMs}ms</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-col items-center truncate">
              <span className="text-[9px] text-slate-400 uppercase">Model</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400 truncate">{agent.model}</span>
            </div>
          </div>
        </div>
      )}

      {inspectorTab === 'Inputs / Outputs' && (
        <div className="flex flex-col gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400">FULL INPUT PAYLOAD</span>
            <pre className="text-[10px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-900 font-mono overflow-x-auto whitespace-pre-wrap">
              {agent.input}
            </pre>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">FULL OUTPUT RESULT</span>
            <pre className="text-[10px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-900 font-mono overflow-x-auto whitespace-pre-wrap">
              {agent.output}
            </pre>
          </div>
        </div>
      )}

      {(inspectorTab === 'Logs' || true) && (
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">EVENT LOG</span>
            <button className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {events.slice(0, 7).map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-2 p-1.5 rounded bg-slate-950/80 border border-slate-900/80 text-[10px]"
              >
                <span className="text-slate-500 font-mono text-[9px] shrink-0 pt-0.5">{evt.timestamp}</span>
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  {evt.type === 'agent_activated' ? (
                    <Activity className="w-3 h-3 text-cyan-400" />
                  ) : evt.type === 'message_sent' ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : evt.type === 'error_raised' ? (
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-purple-400" />
                  )}
                </div>
                <span className="text-slate-300 truncate">{evt.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
