import React, { useState } from 'react';
import { useAuraStore } from '../../store/useAuraStore';
import { Activity, Clock, Cpu, FileText, CheckCircle2, AlertTriangle, ArrowRight, Database, HelpCircle, Zap, Shield, Search, Sparkles } from 'lucide-react';

export const AgentInspectorPanel: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const isRightInspectorOpen = useAuraStore((s) => s.isRightInspectorOpen);
  const selectedAgentId = useAuraStore((s) => s.selectedAgentId);
  const agent = useAuraStore((s) => s.agents[selectedAgentId]);
  const events = useAuraStore((s) => s.events);
  const keyClaims = useAuraStore((s) => s.keyClaims);
  const systemMetrics = useAuraStore((s) => s.systemMetrics);

  const [inspectorTab, setInspectorTab] = useState<'Overview' | 'Input' | 'Output' | 'Evidence' | 'Logs'>('Overview');
  const isDark = theme === 'dark';

  if (!isRightInspectorOpen) return null;

  if (!agent) {
    return (
      <aside className={`w-80 border-l p-4 text-xs ${isDark ? 'bg-slate-950/80 border-slate-900 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
        Select an agent node to inspect.
      </aside>
    );
  }

  return (
    <aside
      className={`w-80 border-l flex flex-col justify-between overflow-y-auto select-none p-4 gap-4 transition-colors ${
        isDark ? 'bg-slate-950/80 border-slate-900 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      {/* Inspector Top Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              {agent.id === 'orchestrator' ? (
                <Shield className="w-4 h-4 text-amber-400" />
              ) : agent.id === 'researcher' ? (
                <Sparkles className="w-4 h-4 text-cyan-400" />
              ) : (
                <Search className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div className="flex flex-col">
              <h2 className="text-xs font-extrabold tracking-wider uppercase">{agent.name}</h2>
              <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{agent.role}</span>
            </div>
          </div>

          <span
            className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold uppercase ${
              agent.status === 'conflict'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : agent.status === 'active'
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
            }`}
          >
            ● {agent.status}
          </span>
        </div>

        {/* 5 Inspector Sub-Tabs (Matching Reference Image) */}
        <div className={`flex items-center gap-1 p-0.5 rounded-lg border text-[10px] font-semibold ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
          {(['Overview', 'Input', 'Output', 'Evidence', 'Logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setInspectorTab(tab)}
              className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                inspectorTab === tab
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

      {/* Overview Tab Content */}
      {inspectorTab === 'Overview' && (
        <div className="flex flex-col gap-3 text-xs">
          {/* Current Task Card */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className={`text-[9px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CURRENT TASK</span>
            <p className="leading-relaxed font-medium">{agent.currentTask}</p>
          </div>

          {/* Progress Bar Card */}
          <div className={`p-3 rounded-xl border flex flex-col gap-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>PROGRESS</span>
              <span className="text-cyan-400 font-mono font-bold">{agent.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" style={{ width: `${agent.progress}%` }} />
            </div>
          </div>

          {/* Quick Stats Grid (Sources, Claims, Tokens, Latency) */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className={`p-2 rounded-lg border flex flex-col items-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[8px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sources</span>
              <span className="text-xs font-mono font-bold">12</span>
            </div>
            <div className={`p-2 rounded-lg border flex flex-col items-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[8px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Claims</span>
              <span className="text-xs font-mono font-bold">8</span>
            </div>
            <div className={`p-2 rounded-lg border flex flex-col items-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[8px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tokens</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{agent.tokens}</span>
            </div>
            <div className={`p-2 rounded-lg border flex flex-col items-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[8px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Latency</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{agent.latencyMs}ms</span>
            </div>
          </div>

          {/* Performance Card (Model, Memory) */}
          <div className={`p-3 rounded-xl border flex flex-col gap-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className={`text-[9px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>PERFORMANCE</span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Model</span>
              <span className="font-mono font-bold text-cyan-400">{agent.model}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Memory</span>
              <span className="font-mono font-bold">68%</span>
            </div>
            <div className="w-full h-1 bg-slate-700/30 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: '68%' }} />
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className={`p-3 rounded-xl border flex flex-col gap-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className={`text-[9px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>RECENT ACTIVITY</span>
            <div className="space-y-1.5 text-[10px] font-mono">
              {(agent.recentActivity || [
                { timestamp: '21:04:32', text: 'Queried 5 new sources' },
                { timestamp: '21:04:34', text: 'Extracted 8 claims' },
                { timestamp: '21:04:37', text: 'Sent data to Analyst' },
              ]).map((act, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span>
                  <span className="text-slate-400">{act.timestamp}</span>
                  <span className="text-cyan-400">▶</span>
                  <span className="truncate">{act.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Output (latest) & Key Claims */}
          <div className={`p-3 rounded-xl border flex flex-col gap-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className={`text-[9px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>OUTPUT (LATEST)</span>
            <div className="flex items-center gap-3 text-[10px] font-mono text-cyan-400">
              <span>📄 12 documents</span>
              <span>🔗 4 entities</span>
              <span>❓ 3 claims</span>
            </div>

            <span className={`text-[9px] font-bold tracking-wider uppercase pt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>KEY CLAIMS</span>
            <div className="space-y-1 text-[10px]">
              {keyClaims.map((kc) => (
                <div key={kc.id} className="flex items-start gap-1.5">
                  <span className="px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 font-mono text-[9px] font-bold">{kc.id}</span>
                  <span className="text-slate-300 leading-tight">{kc.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Tab */}
      {inspectorTab === 'Input' && (
        <div className={`p-3 rounded-xl border text-xs font-mono ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-[9px] font-bold uppercase text-cyan-400 block mb-2">FULL INPUT PAYLOAD</span>
          <pre className="text-[10px] text-slate-300 whitespace-pre-wrap">{agent.input}</pre>
        </div>
      )}

      {/* Output Tab */}
      {inspectorTab === 'Output' && (
        <div className={`p-3 rounded-xl border text-xs font-mono ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-[9px] font-bold uppercase text-emerald-400 block mb-2">FULL OUTPUT RESULT</span>
          <pre className="text-[10px] text-slate-300 whitespace-pre-wrap">{agent.output}</pre>
        </div>
      )}

      {/* System Metrics Sparklines at Bottom (Matching Reference Images) */}
      <div className={`p-3 rounded-xl border flex flex-col gap-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <span className={`text-[9px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>SYSTEM METRICS</span>
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between font-mono"><span className="text-slate-400">CPU Usage</span><span className="text-cyan-400 font-bold">{systemMetrics.cpu}%</span></div>
          <div className="w-full h-1 bg-slate-700/30 rounded-full"><div className="h-full bg-cyan-400 rounded-full" style={{ width: `${systemMetrics.cpu}%` }} /></div>

          <div className="flex justify-between font-mono pt-1"><span className="text-slate-400">Memory Usage</span><span className="text-cyan-400 font-bold">{systemMetrics.memory}%</span></div>
          <div className="w-full h-1 bg-slate-700/30 rounded-full"><div className="h-full bg-cyan-400 rounded-full" style={{ width: `${systemMetrics.memory}%` }} /></div>

          <div className="flex justify-between font-mono pt-1"><span className="text-slate-400">GPU Usage</span><span className="text-purple-400 font-bold">{systemMetrics.gpu}%</span></div>
          <div className="w-full h-1 bg-slate-700/30 rounded-full"><div className="h-full bg-purple-400 rounded-full" style={{ width: `${systemMetrics.gpu}%` }} /></div>
        </div>
      </div>
    </aside>
  );
};
