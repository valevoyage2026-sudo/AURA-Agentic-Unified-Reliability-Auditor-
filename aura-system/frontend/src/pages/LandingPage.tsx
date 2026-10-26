import React, { useRef } from 'react';
import { auraStore } from '../store/useAuraStore';

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

export const LandingPage: React.FC = () => {
  const howRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);

  const onLogin = () => {
    auraStore.setViewState('login');
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans overflow-auto scroll-smooth"
      style={{ background: 'var(--bg)', color: 'var(--txt)' }}
    >
      <header
        className="flex items-center px-8 py-4 border-b sticky top-0 z-50 backdrop-blur-md"
        style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
      >
        <div className="flex items-center gap-2.5 mr-8">
          <img src="/aura-assets/logo.svg" alt="AURA" className="w-5 h-5" />
          <b
            className="tracking-[0.25em] text-lg font-bold"
            style={{ color: 'var(--ink)' }}
          >
            AURA
          </b>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <button
            onClick={() => scrollTo(howRef)}
            className="transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--txt)' }}
          >
            How it works
          </button>
          <button
            onClick={() => scrollTo(proofRef)}
            className="transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--txt)' }}
          >
            Evidence &amp; Control
          </button>
        </nav>
        <div className="flex-1"></div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onLogin}
            className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--ink)' }}
          >
            Log in
          </button>
          <button 
            onClick={onLogin}
            className="px-4 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(90deg, #c94a05, #f08a2c)',
              color: '#fff',
              boxShadow: '0 4px 10px rgba(217, 86, 11, 0.27)',
            }}
          >
            Sign up
          </button>
          <button 
            onClick={onLogin}
            className="border px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
            title="Sign up with Google"
          >
            <GoogleIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-semibold">Sign up with Google</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-8 py-20 flex flex-col items-center text-center gap-8">
          <div className="space-y-6 max-w-3xl">
            <div className="aura-ey font-bold uppercase tracking-widest text-xs inline-block">
              INTELLIGENT COMPLIANCE &amp; RELIABILITY AUDITING
            </div>
            <h1
              className="text-4xl lg:text-5xl font-semibold leading-tight tracking-tight"
              style={{ color: 'var(--ink)' }}
            >
              Watch your AI agents work. Check what they claim.
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--txt)' }}>
              Aura runs a deterministic team of audit agents on your policies, reveals claims and contradictions in real time, and traces every finding to verified ground truth sources.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button 
                onClick={onLogin}
                className="px-6 py-3 text-sm font-semibold rounded-md transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, #c94a05, #f08a2c)',
                  color: '#fff',
                  boxShadow: '0 4px 10px rgba(217, 86, 11, 0.27)',
                }}
              >
                Launch Workbench
              </button>
              <button 
                onClick={onLogin}
                className="border px-5 py-3 text-sm font-medium rounded-md transition-colors flex items-center gap-2.5 shadow-xs cursor-pointer"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--line)',
                  color: 'var(--ink)',
                }}
              >
                <GoogleIcon className="w-4 h-4" />
                <span className="font-semibold">Sign up with Google</span>
              </button>
              <button 
                onClick={() => scrollTo(howRef)}
                className="border px-5 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer"
                style={{
                  background: 'transparent',
                  borderColor: 'var(--line)',
                  color: 'var(--txt)',
                }}
              >
                See how it works
              </button>
            </div>
            
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 mt-10 border-t" style={{ borderColor: 'var(--line)' }}>
              <div>
                <dt className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>8 agents</dt>
                <dd className="text-sm" style={{ color: 'var(--mut)' }}>working in one unified run</dd>
              </div>
              <div>
                <dt className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>Every claim</dt>
                <dd className="text-sm" style={{ color: 'var(--mut)' }}>linked to its source passages</dd>
              </div>
              <div>
                <dt className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>You decide</dt>
                <dd className="text-sm" style={{ color: 'var(--mut)' }}>when evidence conflicts</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* How it works Section */}
        <section
          ref={howRef}
          className="border-t py-20"
          style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
        >
          <div className="max-w-5xl mx-auto px-8 text-center space-y-4">
             <div className="aura-ey font-bold uppercase tracking-widest text-xs">PIPELINE STAGES</div>
             <h2 className="text-3xl font-semibold" style={{ color: 'var(--ink)' }}>How an audit run works</h2>
             <p className="text-base" style={{ color: 'var(--mut)' }}>
               Four deterministic stages, each handled by specialized agents with a strict contract.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 text-left">
               <div
                 className="p-6 border rounded-lg shadow-xs"
                 style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
               >
                 <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 border rounded" style={{ background: 'var(--card)', borderColor: 'var(--line)' }} role="img" aria-hidden="true">
                   <path className="il-a" d="M100 44V64H30V84M100 64V84M100 64H170V84"/><rect className="il-pa" x="80" y="20" width="40" height="24"/><rect className="il-p" x="10" y="84" width="40" height="24"/><rect className="il-p" x="80" y="84" width="40" height="24"/><rect className="il-p" x="150" y="84" width="40" height="24"/><rect className="il-fg" x="16" y="90" width="6" height="6"/><rect className="il-fg" x="86" y="90" width="6" height="6"/><rect className="il-fw" x="156" y="90" width="6" height="6"/>
                 </svg>
                 <div className="text-xs font-mono font-semibold uppercase mb-1" style={{ color: 'var(--or)' }}>Step 1</div>
                 <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)' }}>Plan</h3>
                 <p className="text-sm leading-relaxed" style={{ color: 'var(--txt)' }}>The Orchestrator and Planner decompose input documents into atomic typed claims.</p>
               </div>
               
               <div
                 className="p-6 border rounded-lg shadow-xs"
                 style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
               >
                 <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 border rounded" style={{ background: 'var(--card)', borderColor: 'var(--line)' }} role="img" aria-hidden="true">
                   <rect className="il-p" x="16" y="16" width="64" height="26"/><rect className="il-p" x="16" y="52" width="64" height="26"/><rect className="il-p" x="16" y="88" width="64" height="20"/><path className="il-l" d="M24 26h40M24 62h44M24 96h30"/><path className="il-a" d="M80 29H104V60"/><path className="il-a" d="M80 65H104"/><circle className="il-pa" cx="128" cy="62" r="20"/><path className="il-a" d="M143 77l24 24"/><rect className="il-fa" x="121" y="55" width="14" height="14"/>
                 </svg>
                 <div className="text-xs font-mono font-semibold uppercase mb-1" style={{ color: 'var(--or)' }}>Step 2</div>
                 <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)' }}>Search &amp; Retrieve</h3>
                 <p className="text-sm leading-relaxed" style={{ color: 'var(--txt)' }}>The RAG Retriever queries Qdrant &amp; Neo4j graph nodes to pull authoritative ground truth.</p>
               </div>
               
               <div
                 className="p-6 border rounded-lg shadow-xs"
                 style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
               >
                 <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 border rounded" style={{ background: 'var(--card)', borderColor: 'var(--line)' }} role="img" aria-hidden="true">
                   <rect className="il-p" x="18" y="16" width="70" height="88"/><rect className="il-p" x="112" y="16" width="70" height="88"/><path className="il-l" d="M28 32h40M28 42h50M122 32h40M122 42h50"/><path className="il-a" d="M32 74l9 9 20-22"/><path className="il-a" d="M88 60h24"/><rect className="il-fc" x="158" y="70" width="12" height="12"/><path className="il-cf" d="M126 90h32"/>
                 </svg>
                 <div className="text-xs font-mono font-semibold uppercase mb-1" style={{ color: 'var(--or)' }}>Step 3</div>
                 <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)' }}>Verify &amp; Detect</h3>
                 <p className="text-sm leading-relaxed" style={{ color: 'var(--txt)' }}>Fact, citation, and contradiction agents detect invalid references and logical conflicts.</p>
               </div>
               
               <div
                 className="p-6 border rounded-lg shadow-xs"
                 style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
               >
                 <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 border rounded" style={{ background: 'var(--card)', borderColor: 'var(--line)' }} role="img" aria-hidden="true">
                   <rect className="il-pa" x="52" y="10" width="96" height="100"/><path className="il-a" d="M64 24h44"/><path className="il-l" d="M64 34h60"/><path className="il-l" d="M64 96h72"/><rect className="il-fa" x="68" y="72" width="14" height="24"/><rect className="il-fa" x="88" y="58" width="14" height="38"/><rect className="il-fa" x="108" y="66" width="14" height="30"/><rect className="il-fg" x="128" y="48" width="8" height="8"/>
                 </svg>
                 <div className="text-xs font-mono font-semibold uppercase mb-1" style={{ color: 'var(--or)' }}>Step 4</div>
                 <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)' }}>Refine &amp; Audit</h3>
                 <p className="text-sm leading-relaxed" style={{ color: 'var(--txt)' }}>The Self-Repair Agent repairs contradicted claims and attaches verifiable trust certificates.</p>
               </div>
             </div>
          </div>
        </section>

        {/* Evidence Section */}
        <section
          ref={proofRef}
          className="border-t py-20"
          style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
        >
          <div className="max-w-6xl mx-auto px-8 text-center space-y-4">
             <div className="aura-ey font-bold uppercase tracking-widest text-xs">AUDIT INTEGRITY</div>
             <h2 className="text-3xl font-semibold" style={{ color: 'var(--ink)' }}>Built for deterministic compliance</h2>
             <p className="text-base max-w-3xl mx-auto" style={{ color: 'var(--mut)' }}>
               LLMs make mistakes. Aura pairs semantic extraction with strict mathematical rules, preserving evidence and audit lineages.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
               <div
                 className="p-6 border rounded-lg shadow-xs"
                 style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
               >
                 <svg viewBox="0 0 360 110" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 border rounded" style={{ background: 'var(--bg)', borderColor: 'var(--line)' }} role="img" aria-hidden="true">
                   <rect className="il-p" x="20" y="14" width="44" height="60"/><rect className="il-p" x="76" y="14" width="44" height="60"/><rect className="il-p" x="132" y="14" width="44" height="60"/><path className="il-l" d="M28 26h28M28 34h20M84 26h28M84 34h20M140 26h28M140 34h20"/><path className="il-a" d="M42 74V90H154V74M98 74V90M98 90H250V78"/><rect className="il-pa" x="218" y="30" width="64" height="48"/><path className="il-a" d="M234 54l9 9 16-18"/>
                 </svg>
                 <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)' }}>Every claim shows its sources</h3>
                 <p className="text-sm leading-relaxed" style={{ color: 'var(--txt)' }}>Open any finding to inspect exact passage references, similarity confidence scores, and trust tiers.</p>
               </div>
               
               <div
                 className="p-6 border rounded-lg shadow-xs"
                 style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
               >
                 <svg viewBox="0 0 360 110" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 border rounded" style={{ background: 'var(--bg)', borderColor: 'var(--line)' }} role="img" aria-hidden="true">
                   <rect className="il-pa" x="168" y="12" width="24" height="24"/><path className="il-a" d="M180 36V56M40 56H320M40 56V70M110 56V70M180 56V70M250 56V70M320 56V70"/><rect className="il-p" x="32" y="70" width="16" height="16"/><rect className="il-p" x="102" y="70" width="16" height="16"/><rect className="il-p" x="172" y="70" width="16" height="16"/><rect className="il-p" x="242" y="70" width="16" height="16"/><rect className="il-p" x="312" y="70" width="16" height="16"/><rect className="il-fg" x="36" y="74" width="8" height="8"/><rect className="il-fg" x="106" y="74" width="8" height="8"/><rect className="il-fc" x="176" y="74" width="8" height="8"/><rect className="il-fw" x="246" y="74" width="8" height="8"/><rect className="il-fm" x="316" y="74" width="8" height="8"/>
                 </svg>
                 <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)' }}>Deterministic Precedence Rules</h3>
                 <p className="text-sm leading-relaxed" style={{ color: 'var(--txt)' }}>Zero silent promotions. Invalid citations and high-confidence contradictions trigger strict overrides.</p>
               </div>
               
               <div
                 className="p-6 border rounded-lg shadow-xs"
                 style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
               >
                 <svg viewBox="0 0 360 110" preserveAspectRatio="xMidYMid meet" className="w-full h-24 mb-4 border rounded" style={{ background: 'var(--bg)', borderColor: 'var(--line)' }} role="img" aria-hidden="true">
                   <rect className="il-fg" x="120" y="14" width="6" height="6"/><path className="il-l" d="M134 17H320"/><rect className="il-fg" x="120" y="32" width="6" height="6"/><path className="il-l" d="M134 35H290"/><rect className="il-fc" x="120" y="50" width="6" height="6"/><path className="il-l" d="M134 53H330"/><rect className="il-fg" x="120" y="68" width="6" height="6"/><path className="il-l" d="M134 71H270"/><rect className="il-fa" x="120" y="88" width="6" height="6"/><rect className="il-fa" x="134" y="86" width="8" height="12"/>
                 </svg>
                 <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)' }}>Auditable Cryptographic Lineage</h3>
                 <p className="text-sm leading-relaxed" style={{ color: 'var(--txt)' }}>Immutable trace IDs and agent step logs persist to Postgres for full compliance replay.</p>
               </div>
             </div>
          </div>
        </section>

        {/* Call to action section */}
        <section
          className="border-t py-24 text-center space-y-5"
          style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
        >
          <div className="max-w-4xl mx-auto px-8 space-y-4">
             <div className="aura-ey font-bold uppercase tracking-widest text-xs">READY TO AUDIT</div>
             <h2 className="text-4xl font-semibold" style={{ color: 'var(--ink)' }}>Open your audit workspace</h2>
             <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--txt)' }}>
               Log in as Compliance Officer or Student Policy Advisor to launch verifiable audit runs.
             </p>
             <div className="pt-4">
               <button 
                 onClick={onLogin}
                 className="px-9 py-3.5 text-base font-semibold rounded-md transition-all cursor-pointer"
                 style={{
                   background: 'linear-gradient(90deg, #c94a05, #f08a2c)',
                   color: '#fff',
                   boxShadow: '0 4px 10px rgba(217, 86, 11, 0.27)',
                 }}
               >
                 Launch AURA Console
               </button>
             </div>
          </div>
        </section>
      </main>
      
      <footer
        className="text-center py-6 text-xs border-t mt-auto"
        style={{ background: 'var(--bg)', borderColor: 'var(--line)', color: 'var(--mut)' }}
      >
        AURA Agentic Unified Reliability Auditor &copy; 2026. Deterministic compliance, verifiable trust, and multi-agent governance.
      </footer>
    </div>
  );
};
