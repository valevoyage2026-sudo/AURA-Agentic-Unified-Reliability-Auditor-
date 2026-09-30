import React from 'react';
import { auraStore } from '../store/useAuraStore';
import { HeroGraph } from '../components/network/HeroGraph';

export const LoginPage: React.FC = () => {
  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    auraStore.setViewState('app');
  };

  const onBack = () => {
    auraStore.setViewState('landing');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Left Hero Section */}
      <div className="flex-1 bg-slate-950 border-r border-slate-800 p-8 flex flex-col gap-6 hidden md:flex h-full min-h-0 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-cyan-500 rounded-sm"></div>
          <b className="tracking-widest text-md font-semibold">AURA</b>
          <small className="text-slate-400 border-l border-slate-700 pl-3">Agent operations</small>
        </div>
        
        <div className="w-full h-[260px] lg:h-[300px] bg-slate-950 border border-slate-800 rounded-md relative overflow-hidden shadow-xl">
          <HeroGraph />
        </div>
        
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold leading-snug mb-2 text-white">Run agent teams. Check every claim.</h1>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Start a mission, watch each agent work, and see exactly which sources back each finding.
          </p>
          
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="border border-slate-800 bg-slate-900/40 p-3 rounded-md flex flex-col">
              <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-auto mb-3 bg-slate-950 rounded border border-slate-800/50" role="img" aria-hidden="true">
                <path className="il-a" d="M100 44V64H30V84M100 64V84M100 64H170V84"/><rect className="il-pa" x="80" y="20" width="40" height="24"/><rect className="il-p" x="10" y="84" width="40" height="24"/><rect className="il-p" x="80" y="84" width="40" height="24"/><rect className="il-p" x="150" y="84" width="40" height="24"/><rect className="il-fg" x="16" y="90" width="6" height="6"/><rect className="il-fg" x="86" y="90" width="6" height="6"/><rect className="il-fw" x="156" y="90" width="6" height="6"/>
              </svg>
              <b className="block text-[13px] font-medium text-slate-200">Orchestrate</b>
              <small className="block text-slate-500 text-[11px] mt-1 leading-relaxed">Plan work and route it between agents.</small>
            </div>
            
            <div className="border border-slate-800 bg-slate-900/40 p-3 rounded-md flex flex-col">
              <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-auto mb-3 bg-slate-950 rounded border border-slate-800/50" role="img" aria-hidden="true">
                <rect className="il-p" x="18" y="16" width="70" height="88"/><rect className="il-p" x="112" y="16" width="70" height="88"/><path className="il-l" d="M28 32h40M28 42h50M122 32h40M122 42h50"/><path className="il-a" d="M32 74l9 9 20-22"/><path className="il-a" d="M88 60h24"/><rect className="il-fc" x="158" y="70" width="12" height="12"/><path className="il-cf" d="M126 90h32"/>
              </svg>
              <b className="block text-[13px] font-medium text-slate-200">Verify</b>
              <small className="block text-slate-500 text-[11px] mt-1 leading-relaxed">Each claim links to the sources behind it.</small>
            </div>
            
            <div className="border border-slate-800 bg-slate-900/40 p-3 rounded-md flex flex-col">
              <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-auto mb-3 bg-slate-950 rounded border border-slate-800/50" role="img" aria-hidden="true">
                <rect className="il-pa" x="52" y="10" width="96" height="100"/><path className="il-a" d="M64 24h44"/><path className="il-l" d="M64 34h60"/><path className="il-l" d="M64 96h72"/><rect className="il-fa" x="68" y="72" width="14" height="24"/><rect className="il-fa" x="88" y="58" width="14" height="38"/><rect className="il-fa" x="108" y="66" width="14" height="30"/><rect className="il-fg" x="128" y="48" width="8" height="8"/>
              </svg>
              <b className="block text-[13px] font-medium text-slate-200">Publish</b>
              <small className="block text-slate-500 text-[11px] mt-1 leading-relaxed">Get a report, claims and sources in one run.</small>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Login Form Section */}
      <div className="flex-none w-full md:w-[470px] flex items-center justify-center p-8 bg-slate-950 relative overflow-y-auto">
        <div className="w-full max-w-[360px]">
          <button 
            type="button" 
            onClick={onBack}
            className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors"
          >
            &larr; Back to home
          </button>
          
          <h2 className="text-2xl font-semibold mb-1">Sign in</h2>
          <p className="text-slate-400 text-sm mb-6">Use your work email to open your workspace.</p>
          
          <form onSubmit={onLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-200">Email</label>
              <input 
                id="email" 
                type="email" 
                autoComplete="username" 
                placeholder="name@company.com" 
                className="bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none rounded-sm px-3 py-2 text-sm text-slate-100 placeholder-slate-600 transition-colors"
                defaultValue="vale@aura.dev"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pw" className="text-sm font-medium text-slate-200">Password</label>
              <div className="flex">
                <input 
                  id="pw" 
                  type="password" 
                  autoComplete="current-password" 
                  placeholder="At least 6 characters" 
                  className="flex-1 bg-slate-950 border border-slate-700 border-r-0 focus:border-cyan-500 outline-none rounded-l-sm px-3 py-2 text-sm text-slate-100 placeholder-slate-600 transition-colors"
                  defaultValue="aurademo"
                />
                <button type="button" className="bg-slate-900 border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 px-3 text-sm text-slate-400 rounded-r-sm transition-colors">
                  Show
                </button>
              </div>
            </div>
            
            <label className="flex items-center gap-2 mt-2 mb-4 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" className="accent-cyan-500 w-4 h-4 rounded-sm bg-slate-900 border-slate-700" defaultChecked />
              Remember my email on this device
            </label>
            
            <button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-sm text-sm transition-colors"
            >
              Sign in
            </button>
            <button 
              type="button" 
              onClick={onLogin}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-white font-medium py-2.5 rounded-sm text-sm transition-colors mt-2"
            >
              Fill demo account
            </button>
            
            <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-sm text-xs text-slate-400 leading-relaxed">
              Demo build: any valid email and a password of 6+ characters signs in. Agents, sources and metrics are simulated.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
