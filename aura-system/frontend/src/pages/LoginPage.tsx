import React, { useState } from 'react';
import { auraStore } from '../store/useAuraStore';
import { HeroGraph } from '../components/network/HeroGraph';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    auraStore.setViewState('app');
  };

  const onGoogleAuth = () => {
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
      
      {/* Right Login / Sign Up Form Section */}
      <div className="flex-none w-full md:w-[470px] flex items-center justify-center p-8 bg-slate-950 relative overflow-y-auto">
        <div className="w-full max-w-[360px]">
          <button 
            type="button" 
            onClick={onBack}
            className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors"
          >
            &larr; Back to home
          </button>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 pb-2.5 text-sm font-semibold text-center border-b-2 transition-colors ${
                !isSignUp
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 pb-2.5 text-sm font-semibold text-center border-b-2 transition-colors ${
                isSignUp
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign up
            </button>
          </div>
          
          <h2 className="text-2xl font-semibold mb-1">{isSignUp ? 'Create your account' : 'Sign in'}</h2>
          <p className="text-slate-400 text-sm mb-6">
            {isSignUp ? 'Join AURA to audit high-stakes reports and workflows.' : 'Use your work email to open your workspace.'}
          </p>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={onGoogleAuth}
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-100 font-medium py-2.5 rounded-sm text-sm transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow mb-5"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-950 px-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider absolute">
              Or continue with email
            </span>
          </div>
          
          <form onSubmit={onLogin} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullname" className="text-sm font-medium text-slate-200">Full Name</label>
                <input 
                  id="fullname" 
                  type="text" 
                  placeholder="Vale Voyage" 
                  className="bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none rounded-sm px-3 py-2 text-sm text-slate-100 placeholder-slate-600 transition-colors"
                  defaultValue="Vale Voyage"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-200">Work Email</label>
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
                  autoComplete={isSignUp ? 'new-password' : 'current-password'} 
                  placeholder="At least 6 characters" 
                  className="flex-1 bg-slate-950 border border-slate-700 border-r-0 focus:border-cyan-500 outline-none rounded-l-sm px-3 py-2 text-sm text-slate-100 placeholder-slate-600 transition-colors"
                  defaultValue="aurademo"
                />
                <button type="button" className="bg-slate-900 border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 px-3 text-sm text-slate-400 rounded-r-sm transition-colors">
                  Show
                </button>
              </div>
            </div>
            
            {!isSignUp && (
              <label className="flex items-center gap-2 mt-1 mb-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" className="accent-cyan-500 w-4 h-4 rounded-sm bg-slate-900 border-slate-700" defaultChecked />
                Remember my email on this device
              </label>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-sm text-sm transition-colors mt-2"
            >
              {isSignUp ? 'Create account' : 'Sign in'}
            </button>
            <button 
              type="button" 
              onClick={onLogin}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-white font-medium py-2.5 rounded-sm text-sm transition-colors"
            >
              Fill demo account
            </button>

            <div className="text-center mt-3 text-xs text-slate-400">
              {isSignUp ? (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => setIsSignUp(false)} className="text-cyan-400 hover:underline font-medium">
                    Sign in
                  </button>
                </>
              ) : (
                <>Don't have an account?{' '}
                  <button type="button" onClick={() => setIsSignUp(true)} className="text-cyan-400 hover:underline font-medium">
                    Sign up
                  </button>
                </>
              )}
            </div>
            
            <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-sm text-xs text-slate-400 leading-relaxed">
              Demo build: Google auth and email sign up operate in sandbox mode. Any valid email and password enters the demo workspace.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
