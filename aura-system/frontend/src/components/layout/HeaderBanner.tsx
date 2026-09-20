import React from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import { getExecutionAdapter } from '../../services/executionAdapter';
import {
  ShieldCheck,
  Moon,
  Sun,
  Settings,
  Pause,
  Play,
  RotateCcw,
  AlertTriangle,
  FileText,
  HelpCircle,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const HeaderBanner: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const mission = useAuraStore((s) => s.mission);
  const activeAgentsCount = useAuraStore((s) => s.activeAgentsCount);
  const totalAgentsCount = useAuraStore((s) => s.totalAgentsCount);
  const issuesCount = useAuraStore((s) => s.issuesCount);
  const evidenceCount = useAuraStore((s) => s.evidenceCount);
  const claimsCount = useAuraStore((s) => s.claimsCount);
  const avgLatency = useAuraStore((s) => s.avgLatency);
  const simulationStatus = useAuraStore((s) => s.simulationStatus);
  const isLeftSidebarOpen = useAuraStore((s) => s.isLeftSidebarOpen);
  const isRightInspectorOpen = useAuraStore((s) => s.isRightInspectorOpen);
  const soundMuted = useAuraStore((s) => s.soundMuted);

  const isDark = theme === 'dark';
  const adapter = getExecutionAdapter('simulation');

  const handleStartSimulation = () => {
    adapter.startAudit('Analyze salary increase trends for tech roles (2022-2025)', 'audit_only');
  };

  const handlePauseResume = () => {
    if (simulationStatus === 'running') {
      adapter.pauseAudit();
    } else if (simulationStatus === 'paused') {
      adapter.resumeAudit();
    } else {
      handleStartSimulation();
    }
  };

  const handleReset = () => {
    adapter.cancelAudit();
  };

  return (
    <header
      className={`h-16 px-4 flex items-center justify-between border-b transition-colors select-none z-20 ${
        isDark
          ? 'bg-slate-950/90 border-cyan-900/30 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Left Branding & Mission */}
      <div className="flex items-center gap-4">
        {/* Toggle Left Sidebar Button */}
        <button
          onClick={() => auraStore.toggleLeftSidebar()}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-cyan-700'
          }`}
          title={isLeftSidebarOpen ? 'Collapse Left Sidebar' : 'Expand Left Sidebar'}
        >
          {isLeftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl border shadow-md ${
              isDark
                ? 'bg-gradient-to-br from-cyan-500/20 to-indigo-500/10 border-cyan-500/40 text-cyan-400'
                : 'bg-cyan-50 border-cyan-300 text-cyan-600'
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-widest uppercase">A U R A</h1>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                  isDark ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/50' : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                }`}
              >
                v0.1.0
              </span>
            </div>
            <p className={`text-[10px] tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              MULTI-AGENT PLATFORM
            </p>
          </div>
        </div>

        <div className={`hidden lg:block w-px h-8 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Mission Details */}
        <div className="hidden lg:flex flex-col">
          <div className="flex items-center gap-2 text-xs">
            <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>MISSION</span>
            <span className="font-semibold tracking-wide">{mission.title}</span>
          </div>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{mission.description}</span>
        </div>
      </div>

      {/* Center Execution Progress & Top Metrics */}
      <div className="flex items-center gap-6">
        {/* Mission Progress Bar Widget */}
        <div
          className={`flex items-center gap-3 px-3 py-1.5 rounded-full border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">{mission.status}</span>
          </div>
          <div className="w-24 h-1.5 bg-slate-700/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${mission.progress}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">{mission.progress}%</span>
        </div>

        {/* Metrics Counter Items */}
        <div className="hidden xl:flex items-center gap-5 text-xs font-mono">
          <div className="flex flex-col">
            <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Agents</span>
            <span className="font-bold text-cyan-400">
              {activeAgentsCount} / {totalAgentsCount}
            </span>
          </div>

          <div className="flex flex-col">
            <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Issues</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <AlertTriangle className="w-3 h-3" />
              <span>{issuesCount}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Evidence</span>
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-cyan-400" />
              <span className="font-bold">{evidenceCount}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Claims</span>
            <div className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-sky-400" />
              <span className="font-bold">{claimsCount}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Latency</span>
            <div className="flex items-center gap-1 text-cyan-400 font-bold">
              <Zap className="w-3 h-3" />
              <span>{avgLatency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls (Simulation Controls & Theme Toggle) */}
      <div className="flex items-center gap-3">
        {/* Simulation Controls */}
        <div className="flex items-center gap-1">
          {simulationStatus === 'idle' ? (
            <button
              onClick={handleStartSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Start Simulation
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseResume}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                }`}
              >
                {simulationStatus === 'running' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" /> Resume
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-rose-400'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-rose-600'
                }`}
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Sound FX Toggle Button */}
        <button
          onClick={() => auraStore.toggleSound()}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            soundMuted
              ? isDark
                ? 'bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-slate-100 border-slate-300 text-slate-400'
              : isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-cyan-700'
          }`}
          title={soundMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => auraStore.toggleTheme()}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Toggle Right Inspector Button */}
        <button
          onClick={() => auraStore.toggleRightInspector()}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-cyan-700'
          }`}
          title={isRightInspectorOpen ? 'Collapse Inspector Panel' : 'Expand Inspector Panel'}
        >
          {isRightInspectorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>

        <button
          className={`p-2 rounded-lg border transition-colors ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className={`flex items-center gap-2 pl-2 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">
            V
          </div>
          <span className="text-xs font-semibold hidden xl:inline">Vale</span>
        </div>
      </div>
    </header>
  );
};
