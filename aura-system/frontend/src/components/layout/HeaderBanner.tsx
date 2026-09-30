import React from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import {
  ShieldCheck,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  CheckCircle2
} from 'lucide-react';

export const HeaderBanner: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const backendStatus = useAuraStore((s) => s.backendStatus);
  const isLeftSidebarOpen = useAuraStore((s) => s.isLeftSidebarOpen);
  const activeTab = useAuraStore((s) => s.activeTab);

  const isDark = theme === 'dark';

  return (
    <header
      className={`h-14 px-4 flex items-center justify-between border-b select-none z-20 transition-colors ${
        isDark
          ? 'bg-slate-950 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Left Section: Sidebar Toggle + Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => auraStore.toggleLeftSidebar()}
          className={`p-1.5 rounded-none border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
          }`}
          title={isLeftSidebarOpen ? 'Collapse Navigation' : 'Expand Navigation'}
        >
          {isLeftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-none border ${
            isDark ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold tracking-tight text-slate-100 uppercase">AURA</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-none font-semibold border ${
              isDark ? 'bg-slate-900 border-slate-700 text-indigo-300' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}>
              Enterprise Auditor
            </span>
          </div>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">System Status:</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> {backendStatus}
          </span>
        </div>

        <div className={`w-px h-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Active Module:</span>
          <span className="font-semibold text-slate-200 font-mono text-[11px]">
            {activeTab === 'AuditWorkbench' ? 'Document Compliance Workbench' : activeTab}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={() => auraStore.toggleTheme()}
          className={`p-1.5 rounded-none border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className={`w-px h-4 mx-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* User Account */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-6 h-6 rounded-none bg-indigo-900/60 border border-indigo-700 text-indigo-200 font-semibold text-[11px] flex items-center justify-center">
            V
          </div>
          <span className="text-xs font-medium text-slate-300 hidden md:inline">Vale</span>
          <button
            onClick={() => auraStore.setViewState('landing')}
            className="p-1 rounded-none hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
