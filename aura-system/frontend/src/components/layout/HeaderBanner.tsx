import React from 'react';
import { useAuraStore } from '../../store/useAuraStore';
import { ShieldCheck, Moon, Settings, User, Activity } from 'lucide-react';

export const HeaderBanner: React.FC = () => {
  const mission = useAuraStore((s) => s.mission);
  const activeAgentsCount = useAuraStore((s) => s.activeAgentsCount);
  const totalAgentsCount = useAuraStore((s) => s.totalAgentsCount);
  const totalTokens = useAuraStore((s) => s.totalTokens);
  const avgLatency = useAuraStore((s) => s.avgLatency);
  const backendStatus = useAuraStore((s) => s.backendStatus);

  return (
    <header className="h-16 bg-slate-950/80 border-b border-cyan-900/30 px-4 flex items-center justify-between backdrop-blur-md select-none z-20">
      {/* Left Branding & Mission */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/10 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-widest text-slate-100 uppercase">A U R A</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-mono">
                v0.1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider">MULTI-AGENT PLATFORM</p>
          </div>
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-800" />

        {/* Mission Details */}
        <div className="hidden lg:flex flex-col">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Mission</span>
            <span className="text-slate-100 font-semibold tracking-wide">{mission.title}</span>
          </div>
          <span className="text-[11px] text-slate-400">{mission.description}</span>
        </div>
      </div>

      {/* Center Execution & Metrics Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">{mission.status}</span>
            <span className="text-xs font-mono text-slate-200 font-medium">{mission.elapsedTime}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-5 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Agents</span>
            <div className="flex items-center gap-1">
              <span className="text-cyan-400 font-bold">{activeAgentsCount}</span>
              <span className="text-slate-500">/ {totalAgentsCount}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Tokens</span>
            <span className="text-slate-200 font-bold">{totalTokens}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Latency</span>
            <span className="text-slate-200 font-bold">{avgLatency}</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300 font-mono hidden sm:inline">{backendStatus}</span>
        </div>

        <button className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
          <Moon className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
            V
          </div>
          <span className="text-xs text-slate-200 font-medium hidden xl:inline">Vale</span>
        </div>
      </div>
    </header>
  );
};
