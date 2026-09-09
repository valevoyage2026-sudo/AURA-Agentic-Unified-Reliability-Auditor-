import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Database, Activity, Server, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status === 'healthy' ? 'Online' : 'Warning'))
      .catch(() => setBackendStatus('Offline (Backend starting...)'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      <header className="max-w-6xl mx-auto flex justify-between items-center pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              AURA System
            </h1>
            <p className="text-xs text-slate-400">Agentic Unified Reliability Auditor</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span className={`w-2 h-2 rounded-full ${backendStatus === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="text-slate-300 font-medium">Backend: {backendStatus}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
            <h2 className="text-lg font-semibold text-slate-200 mb-2">Reliability Audit Engine</h2>
            <p className="text-sm text-slate-400 mb-6">
              Enter text or a claim payload to decompose, query RAG vector stores, verify citations, and evaluate factual integrity.
            </p>
            <div className="space-y-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter prompt or claim to audit..."
                className="w-full h-32 p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 outline-none resize-none transition-all"
              />
              <button
                onClick={() => alert('Audit pipeline triggered!')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Cpu className="w-4 h-4" /> Run Reliability Audit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Database className="w-5 h-5" />
                <span className="font-semibold text-sm">Host Vector Store</span>
              </div>
              <p className="text-xs text-slate-400">Connected to Qdrant on port 6333</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Server className="w-5 h-5" />
                <span className="font-semibold text-sm">Local LLM Engine</span>
              </div>
              <p className="text-xs text-slate-400">Ollama (qwen3.5:latest)</p>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" /> Pipeline Status
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span>1. Claim Decomposition</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span>2. Multi-Store RAG</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span>3. Fact & Citation Verifier</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span>4. Reliability Evaluator</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
