import React, { useState, useRef, useEffect } from 'react';
import { useAuraStore, auraStore, DEMO_OFFICER, DEMO_STUDENT } from '../../store/useAuraStore';
import {
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  Repeat,
} from 'lucide-react';

export const HeaderBanner: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const backendStatus = useAuraStore((s) => s.backendStatus);
  const isLeftSidebarOpen = useAuraStore((s) => s.isLeftSidebarOpen);
  const currentUser = useAuraStore((s) => s.currentUser);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="h-16 px-6 flex items-center justify-between border-b select-none z-30 sticky top-0 transition-colors"
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--line)',
        color: 'var(--ink)',
      }}
    >
      {/* Left Section: Sidebar Toggle + Brand Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => auraStore.toggleLeftSidebar()}
          className="p-1.5 transition-colors cursor-pointer rounded hover:opacity-80"
          style={{ color: 'var(--mut)' }}
          title={isLeftSidebarOpen ? 'Collapse Navigation' : 'Expand Navigation'}
        >
          {isLeftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        {/* Brand Logo & Wordmark (per aura.html: 21px / 500 / letter-spacing .35em) */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-3">
            <img src="/assets/aura/logo.svg" alt="AURA" className="w-6 h-6 shrink-0" />
            <b
              className="text-[21px] font-medium tracking-[0.35em] uppercase"
              style={{ color: 'var(--ink)' }}
            >
              AURA
            </b>
          </div>

          <div className="h-7 w-px hidden md:block" style={{ background: 'var(--line)' }} />

          <span
            className="text-[11px] font-mono tracking-[0.14em] uppercase hidden md:inline"
            style={{ color: 'var(--mut)' }}
          >
            Agentic Unified Reliability Auditor
          </span>
        </div>
      </div>

      {/* Right Controls: User Profile, Backend Status, Theme, and Exit */}
      <div className="flex items-center gap-4 text-xs">
        {/* Backend Status indicator */}
        <div className="flex items-center gap-2 font-medium">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: backendStatus === 'Online' ? 'var(--ok)' : 'var(--err)' }}
          />
          <span style={{ color: 'var(--mut)' }}>Backend:</span>
          <span
            className="font-semibold"
            style={{ color: backendStatus === 'Online' ? 'var(--ok)' : 'var(--err)' }}
          >
            {backendStatus}
          </span>
        </div>

        <div className="h-6 w-px" style={{ background: 'var(--line)' }} />

        {/* User Identity & Account Menu */}
        <div className="relative" ref={userMenuRef}>
          {currentUser ? (
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md border transition-all cursor-pointer hover:border-[var(--or)]"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--line)',
                color: 'var(--ink)',
              }}
            >
              <div
                className="w-6 h-6 rounded flex items-center justify-center shrink-0 text-white font-bold text-[10px]"
                style={{ background: currentUser.role === 'officer' ? 'var(--nav)' : 'var(--ok)' }}
              >
                {currentUser.role === 'officer' ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="text-left hidden sm:block">
                <div className="font-semibold text-xs leading-none" style={{ color: 'var(--ink)' }}>
                  {currentUser.name}
                </div>
                <div className="text-[10px] mt-0.5 leading-none" style={{ color: 'var(--mut)' }}>
                  {currentUser.role === 'officer' ? 'Registrar Officer' : 'Student / Advisor'}
                </div>
              </div>

              <ChevronDown className="w-3 h-3 ml-0.5" style={{ color: 'var(--mut)' }} />
            </button>
          ) : (
            <button
              onClick={() => auraStore.setViewState('login')}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-white cursor-pointer"
              style={{ background: 'var(--or)' }}
            >
              Sign In
            </button>
          )}

          {/* Account Dropdown */}
          {isUserMenuOpen && currentUser && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-lg border shadow-lg p-2 z-50 flex flex-col gap-1 text-xs"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--line)',
                color: 'var(--txt)',
              }}
            >
              <div className="p-2 border-b" style={{ borderColor: 'var(--line)' }}>
                <div className="font-bold text-xs" style={{ color: 'var(--ink)' }}>{currentUser.name}</div>
                <div className="text-[11px] font-mono" style={{ color: 'var(--mut)' }}>{currentUser.email}</div>
                <div className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded font-semibold uppercase" style={{
                  background: currentUser.role === 'officer' ? 'rgba(22, 52, 95, 0.1)' : 'rgba(31, 157, 85, 0.1)',
                  color: currentUser.role === 'officer' ? 'var(--nav)' : 'var(--ok)',
                }}>
                  {currentUser.role === 'officer' ? 'Institutional Officer' : 'Student Account'} • {currentUser.department}
                </div>
              </div>

              {/* Account Switch Quick Action */}
              <div className="p-1">
                <div className="text-[10px] font-semibold uppercase px-2 py-1" style={{ color: 'var(--mut)' }}>
                  Switch Workspace Role:
                </div>
                {currentUser.role === 'officer' ? (
                  <button
                    type="button"
                    onClick={() => {
                      auraStore.loginAs('user');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded flex items-center justify-between hover:bg-[var(--bg)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>Switch to Student Workspace</span>
                    </span>
                    <Repeat className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      auraStore.loginAs('officer');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded flex items-center justify-between hover:bg-[var(--bg)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-navy-900" />
                      <span>Switch to Registrar Officer</span>
                    </span>
                    <Repeat className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>

              <div className="border-t pt-1" style={{ borderColor: 'var(--line)' }}>
                <button
                  type="button"
                  onClick={() => {
                    auraStore.logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded flex items-center gap-2 hover:bg-rose-50 text-rose-700 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out of account</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px" style={{ background: 'var(--line)' }} />

        {/* Theme Toggle Sun / Moon */}
        <button
          onClick={() => auraStore.toggleTheme()}
          className="p-1.5 rounded transition-colors cursor-pointer hover:opacity-80"
          style={{ color: isDark ? '#fbbf24' : '#d97706' }}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="h-6 w-px" style={{ background: 'var(--line)' }} />

        {/* Exit to Home */}
        <button
          onClick={() => auraStore.setViewState('landing')}
          className="flex items-center gap-1.5 font-medium transition-colors cursor-pointer hover:opacity-80"
          style={{ color: 'var(--mut)' }}
          title="Return to Landing Page"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit to Home</span>
        </button>
      </div>
    </header>
  );
};
