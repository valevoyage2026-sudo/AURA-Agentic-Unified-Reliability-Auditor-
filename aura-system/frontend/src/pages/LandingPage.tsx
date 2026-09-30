import React, { useRef } from 'react';
import { auraStore } from '../store/useAuraStore';
import { LiveAgentNetworkCanvas } from '../components/network/LiveAgentNetworkCanvas';
import { HeroGraph } from '../components/network/HeroGraph';

export const LandingPage: React.FC = () => {
  const opsRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);

  const onLogin = () => {
    auraStore.setViewState('login');
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-auto scroll-smooth">
      <header className="flex items-center px-8 py-4 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2 mr-8">
          <div className="w-5 h-5 bg-cyan-500 rounded-sm"></div>
          <b className="tracking-widest text-lg font-semibold">AURA</b>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
          <button onClick={() => scrollTo(opsRef)} className="hover:text-cyan-400 transition-colors">Live operations</button>
          <button onClick={() => scrollTo(howRef)} className="hover:text-cyan-400 transition-colors">How it works</button>
          <button onClick={() => scrollTo(proofRef)} className="hover:text-cyan-400 transition-colors">Evidence and control</button>
        </nav>
        <div className="flex-1"></div>
        <button 
          onClick={onLogin}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-sm font-semibold rounded-sm transition-colors"
        >
          Log in
        </button>
      </header>
      
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-4xl lg:text-5xl font-normal leading-tight tracking-tight text-white">
              Watch your AI agents work. Check what they claim.
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
              Aura runs a team of agents on your mission, shows who is doing what right now, and links every finding to the sources behind it.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={onLogin}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-7 py-3 text-sm font-semibold rounded-sm transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={() => scrollTo(opsRef)}
                className="border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-cyan-500 text-white px-7 py-3 text-sm font-medium rounded-sm transition-colors"
              >
                See agents live
              </button>
            </div>
            
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 mt-10 border-t border-slate-800">
              <div>
                <dt className="text-xl font-semibold text-white mb-1">8 agents</dt>
                <dd className="text-slate-400 text-sm">working in one run</dd>
              </div>
              <div>
                <dt className="text-xl font-semibold text-white mb-1">Every claim</dt>
                <dd className="text-slate-400 text-sm">linked to its sources</dd>
              </div>
              <div>
                <dt className="text-xl font-semibold text-white mb-1">You decide</dt>
                <dd className="text-slate-400 text-sm">when evidence conflicts</dd>
              </div>
            </dl>
          </div>
          
          <div className="flex-1 w-full relative flex justify-center lg:justify-end">
            <div className="w-full max-w-lg h-[320px] sm:h-[360px] border border-slate-800 rounded-lg overflow-hidden bg-slate-950 p-2 shadow-2xl relative">
              <div className="w-full h-full rounded-md overflow-hidden bg-slate-950 border border-slate-800 relative">
                <HeroGraph />
              </div>
            </div>
          </div>
        </div>
        
        {/* Ops Section */}
        <section ref={opsRef} className="bg-slate-950 py-20 border-t border-slate-800/60">
          <div className="max-w-6xl mx-auto px-8 text-center space-y-4">
             <h2 className="text-3xl font-medium text-white">Agent operations, live</h2>
             <p className="text-slate-400 text-base max-w-3xl mx-auto">
               This run plays in your browser. Watch the pipeline move from plan to report, and see how a conflict between claim and evidence shows up.
             </p>
             <div className="mt-10 h-[550px] border border-slate-800 rounded-lg overflow-hidden bg-slate-950 shadow-2xl flex relative">
                <LiveAgentNetworkCanvas />
             </div>
          </div>
        </section>

        {/* How it works Section */}
        <section ref={howRef} className="bg-slate-900/60 border-t border-slate-800 py-20">
          <div className="max-w-5xl mx-auto px-8 text-center space-y-4">
             <h2 className="text-3xl font-medium text-white">How a run works</h2>
             <p className="text-slate-400 text-base">
               Four stages, each handled by agents with one job.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 text-left">
               <div className="p-6 bg-slate-950 border border-slate-800 rounded-md">
                 <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 bg-slate-900/50 border border-slate-800/50 rounded" role="img" aria-hidden="true">
                   <path className="il-a" d="M100 44V64H30V84M100 64V84M100 64H170V84"/><rect className="il-pa" x="80" y="20" width="40" height="24"/><rect className="il-p" x="10" y="84" width="40" height="24"/><rect className="il-p" x="80" y="84" width="40" height="24"/><rect className="il-p" x="150" y="84" width="40" height="24"/><rect className="il-fg" x="16" y="90" width="6" height="6"/><rect className="il-fg" x="86" y="90" width="6" height="6"/><rect className="il-fw" x="156" y="90" width="6" height="6"/>
                 </svg>
                 <div className="text-xs text-slate-500 font-medium uppercase mb-1">Step 1</div>
                 <h3 className="font-semibold text-slate-200 mb-2">Plan</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">The Orchestrator and Planner split your mission into subtasks.</p>
               </div>
               
               <div className="p-6 bg-slate-950 border border-slate-800 rounded-md">
                 <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 bg-slate-900/50 border border-slate-800/50 rounded" role="img" aria-hidden="true">
                   <rect className="il-p" x="16" y="16" width="64" height="26"/><rect className="il-p" x="16" y="52" width="64" height="26"/><rect className="il-p" x="16" y="88" width="64" height="20"/><path className="il-l" d="M24 26h40M24 62h44M24 96h30"/><path className="il-a" d="M80 29H104V60"/><path className="il-a" d="M80 65H104"/><circle className="il-pa" cx="128" cy="62" r="20"/><path className="il-a" d="M143 77l24 24"/><rect className="il-fa" x="121" y="55" width="14" height="14"/>
                 </svg>
                 <div className="text-xs text-slate-500 font-medium uppercase mb-1">Step 2</div>
                 <h3 className="font-semibold text-slate-200 mb-2">Search</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">The Searcher and Researcher collect sources and rate how reliable each one is.</p>
               </div>
               
               <div className="p-6 bg-slate-950 border border-slate-800 rounded-md">
                 <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 bg-slate-900/50 border border-slate-800/50 rounded" role="img" aria-hidden="true">
                   <rect className="il-p" x="18" y="16" width="70" height="88"/><rect className="il-p" x="112" y="16" width="70" height="88"/><path className="il-l" d="M28 32h40M28 42h50M122 32h40M122 42h50"/><path className="il-a" d="M32 74l9 9 20-22"/><path className="il-a" d="M88 60h24"/><rect className="il-fc" x="158" y="70" width="12" height="12"/><path className="il-cf" d="M126 90h32"/>
                 </svg>
                 <div className="text-xs text-slate-500 font-medium uppercase mb-1">Step 3</div>
                 <h3 className="font-semibold text-slate-200 mb-2">Verify</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">The Analyst extracts claims. The Verifier checks each one and flags weak sources for you.</p>
               </div>
               
               <div className="p-6 bg-slate-950 border border-slate-800 rounded-md">
                 <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 bg-slate-900/50 border border-slate-800/50 rounded" role="img" aria-hidden="true">
                   <rect className="il-pa" x="52" y="10" width="96" height="100"/><path className="il-a" d="M64 24h44"/><path className="il-l" d="M64 34h60"/><path className="il-l" d="M64 96h72"/><rect className="il-fa" x="68" y="72" width="14" height="24"/><rect className="il-fa" x="88" y="58" width="14" height="38"/><rect className="il-fa" x="108" y="66" width="14" height="30"/><rect className="il-fg" x="128" y="48" width="8" height="8"/>
                 </svg>
                 <div className="text-xs text-slate-500 font-medium uppercase mb-1">Step 4</div>
                 <h3 className="font-semibold text-slate-200 mb-2">Write</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">The Writer builds a report from verified claims only, with source and sources files.</p>
               </div>
             </div>
          </div>
        </section>

        {/* Evidence Section */}
        <section ref={proofRef} className="bg-slate-950 border-t border-slate-800 py-20">
          <div className="max-w-6xl mx-auto px-8 text-center space-y-4">
             <h2 className="text-3xl font-medium text-white">Built for checking the work</h2>
             <p className="text-slate-400 text-base max-w-3xl mx-auto">
               Agents can be wrong. Aura keeps the evidence, the controls and the record next to the result.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
               <div className="p-6 bg-slate-950 border border-slate-800 rounded-md">
                 <svg viewBox="0 0 360 110" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 bg-slate-900/50 border border-slate-800/50 rounded" role="img" aria-hidden="true">
                   <rect className="il-p" x="20" y="14" width="44" height="60"/><rect className="il-p" x="76" y="14" width="44" height="60"/><rect className="il-p" x="132" y="14" width="44" height="60"/><path className="il-l" d="M28 26h28M28 34h20M84 26h28M84 34h20M140 26h28M140 34h20"/><path className="il-a" d="M42 74V90H154V74M98 74V90M98 90H250V78"/><rect className="il-pa" x="218" y="30" width="64" height="48"/><path className="il-a" d="M234 54l9 9 16-18"/>
                 </svg>
                 <h3 className="font-semibold text-slate-200 mb-2">Every claim shows its sources</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Open any finding to see the sources behind it and how reliable each one is.</p>
               </div>
               
               <div className="p-6 bg-slate-950 border border-slate-800 rounded-md">
                 <svg viewBox="0 0 360 110" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 bg-slate-900/50 border border-slate-800/50 rounded" role="img" aria-hidden="true">
                   <rect className="il-pa" x="168" y="12" width="24" height="24"/><path className="il-a" d="M180 36V56M40 56H320M40 56V70M110 56V70M180 56V70M250 56V70M320 56V70"/><rect className="il-p" x="32" y="70" width="16" height="16"/><rect className="il-p" x="102" y="70" width="16" height="16"/><rect className="il-p" x="172" y="70" width="16" height="16"/><rect className="il-p" x="242" y="70" width="16" height="16"/><rect className="il-p" x="312" y="70" width="16" height="16"/><rect className="il-fg" x="36" y="74" width="8" height="8"/><rect className="il-fg" x="106" y="74" width="8" height="8"/><rect className="il-fc" x="176" y="74" width="8" height="8"/><rect className="il-fw" x="246" y="74" width="8" height="8"/><rect className="il-fm" x="316" y="74" width="8" height="8"/>
                 </svg>
                 <h3 className="font-semibold text-slate-200 mb-2">You stay in control</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Pause or stop a run, approve or reject findings, and decide what happens when evidence conflicts.</p>
               </div>
               
               <div className="p-6 bg-slate-950 border border-slate-800 rounded-md">
                 <svg viewBox="0 0 360 110" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 bg-slate-900/50 border border-slate-800/50 rounded" role="img" aria-hidden="true">
                   <rect className="il-fg" x="120" y="14" width="6" height="6"/><path className="il-l" d="M134 17H320"/><rect className="il-fg" x="120" y="32" width="6" height="6"/><path className="il-l" d="M134 35H290"/><rect className="il-fc" x="120" y="50" width="6" height="6"/><path className="il-l" d="M134 53H330"/><rect className="il-fg" x="120" y="68" width="6" height="6"/><path className="il-l" d="M134 71H270"/><rect className="il-fa" x="120" y="88" width="6" height="6"/><rect className="il-fa" x="134" y="86" width="8" height="12"/>
                 </svg>
                 <h3 className="font-semibold text-slate-200 mb-2">A full record of the run</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Filter the event log by agent and level, and copy the lines you need.</p>
               </div>
             </div>
          </div>
        </section>

        <section className="bg-slate-900/60 border-t border-slate-800 py-24">
          <div className="max-w-4xl mx-auto px-8 text-center space-y-4">
             <h2 className="text-4xl font-medium text-white">Open your workspace</h2>
             <p className="text-slate-400 text-lg max-w-2xl mx-auto">
               Log in to start a run and follow it agent by agent.
             </p>
             <div className="pt-6">
               <button 
                 onClick={onLogin}
                 className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-9 py-3.5 text-base font-semibold rounded-sm transition-colors shadow-lg shadow-cyan-500/20"
               >
                 Log in
               </button>
             </div>
          </div>
        </section>
      </main>
      
      <footer className="text-center py-6 text-sm text-slate-500 border-t border-slate-800 mt-auto">
        Aura enterprise compliance auditor. Agents, sources and findings are simulated in your browser.
      </footer>
    </div>
  );
};
