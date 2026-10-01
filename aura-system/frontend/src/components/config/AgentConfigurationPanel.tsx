import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Search,
  Layers,
  HelpCircle,
  Database,
  FileText,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useAuraStore } from '../../store/useAuraStore';

export interface PipelineConfigState {
  orchestrator: {
    max_iterations: number;
    mode: 'generate_and_audit' | 'audit_only';
    audit_store_persist: boolean;
  };
  planner: {
    granularity: 'atomic' | 'clause-level' | 'table-level';
    model_name: string;
  };
  retrieval: {
    min_similarity: number;
    top_k: number;
    graph_max_depth: number;
    source_trust_tier_min: number;
  };
  fact_agent: {
    temperature: number;
    strictly_evidence_bound: boolean;
    model_name: string;
  };
  citation_agent: {
    entailment_strictness: 'strict_passage' | 'topic_relevance';
    unresolvable_as_invalid: boolean;
  };
  logic_agent: {
    numeric_date_tolerance: number;
    strict_contradiction_override: boolean;
  };
  evaluator: {
    weight_fact: number;
    weight_citation: number;
    weight_contradiction: number;
    threshold_reliable: number;
    threshold_borderline: number;
  };
  self_repair: {
    hedging_strategy: 'explicit_uncertainty_note' | 'evidence_rewrite';
    max_repairs: number;
  };
}

const defaultConfig: PipelineConfigState = {
  orchestrator: { max_iterations: 2, mode: 'audit_only', audit_store_persist: true },
  planner: { granularity: 'clause-level', model_name: 'gemini-1.5-pro' },
  retrieval: { min_similarity: 0.75, top_k: 5, graph_max_depth: 2, source_trust_tier_min: 1 },
  fact_agent: { temperature: 0.0, strictly_evidence_bound: true, model_name: 'gemini-1.5-pro' },
  citation_agent: { entailment_strictness: 'strict_passage', unresolvable_as_invalid: true },
  logic_agent: { numeric_date_tolerance: 0.0, strict_contradiction_override: true },
  evaluator: { weight_fact: 0.5, weight_citation: 0.2, weight_contradiction: 0.3, threshold_reliable: 0.75, threshold_borderline: 0.50 },
  self_repair: { hedging_strategy: 'explicit_uncertainty_note', max_repairs: 2 },
};

export const AgentConfigurationPanel: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const isDark = theme === 'dark';

  const [config, setConfig] = useState<PipelineConfigState>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/v1/config/pipeline')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.orchestrator) {
          setConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('http://localhost:8000/v1/config/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setConfig(data);
      setStatusMsg('All agent configuration guardrails saved successfully!');
    } catch (err) {
      setStatusMsg('Failed to save configuration. Check backend status.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setConfig(defaultConfig);
    setStatusMsg('Reset to AGENTS.md default baseline parameters.');
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto p-6 gap-6 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Title Bar */}
      <div className={`p-4 rounded-none border flex items-center justify-between shadow-sm ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-none border ${
            isDark ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/80' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Agent Pipeline Parameters & Guardrails Configurator
            </h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Configure models, temperature, retrieval cutoffs, evaluator weights, and agent execution policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className={`px-3 py-1.5 rounded-none border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-4 py-1.5 rounded-none bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Apply Agent Config'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-none border text-xs font-semibold flex items-center gap-2 font-mono ${
          isDark ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {statusMsg}
        </div>
      )}

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Orchestrator Agent */}
        <div className={`p-4 rounded-none border flex flex-col gap-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <Layers className="w-4 h-4 text-indigo-500" />
            <h2 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>1. Orchestrator Agent</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Max Re-Check Iterations</label>
              <input
                type="number"
                min={1}
                max={10}
                value={config.orchestrator.max_iterations}
                onChange={(e) => setConfig({ ...config, orchestrator: { ...config.orchestrator, max_iterations: parseInt(e.target.value) || 1 } })}
                className={`p-2 rounded-none border text-xs font-mono outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Pipeline Mode</label>
              <select
                value={config.orchestrator.mode}
                onChange={(e: any) => setConfig({ ...config, orchestrator: { ...config.orchestrator, mode: e.target.value } })}
                className={`p-2 rounded-none border text-xs font-medium outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <option value="audit_only">audit_only (Standard Auditor)</option>
                <option value="generate_and_audit">generate_and_audit</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Planner / Claim Decomposition Agent */}
        <div className={`p-4 rounded-none border flex flex-col gap-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 border-b pb-2 border-slate-800/80">
            <HelpCircle className="w-4 h-4 text-slate-300" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">2. Planner / Decomposition Agent</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Claim Granularity</label>
              <select
                value={config.planner.granularity}
                onChange={(e: any) => setConfig({ ...config, planner: { ...config.planner, granularity: e.target.value } })}
                className={`p-2 rounded-none border text-xs font-medium outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <option value="clause-level">clause-level (Recommended)</option>
                <option value="atomic">atomic (Sentence Spans)</option>
                <option value="table-level">table-level (Financial/CSVs)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">LLM Model</label>
              <select
                value={config.planner.model_name}
                onChange={(e: any) => setConfig({ ...config, planner: { ...config.planner, model_name: e.target.value } })}
                className={`p-2 rounded-none border text-xs font-medium outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="local-qwen">Local Qwen 3.5 (Ollama)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. RAG / Retrieval Agent */}
        <div className={`p-4 rounded-none border flex flex-col gap-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 border-b pb-2 border-slate-800/80">
            <Search className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">3. RAG / Retrieval Agent</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Min Similarity ({config.retrieval.min_similarity})</label>
              <input
                type="range"
                min={0.5}
                max={0.95}
                step={0.05}
                value={config.retrieval.min_similarity}
                onChange={(e) => setConfig({ ...config, retrieval: { ...config.retrieval, min_similarity: parseFloat(e.target.value) } })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Vector Top-K</label>
              <input
                type="number"
                min={1}
                max={20}
                value={config.retrieval.top_k}
                onChange={(e) => setConfig({ ...config, retrieval: { ...config.retrieval, top_k: parseInt(e.target.value) || 5 } })}
                className={`p-2 rounded-none border text-xs font-mono outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Min Trust Tier</label>
              <select
                value={config.retrieval.source_trust_tier_min}
                onChange={(e: any) => setConfig({ ...config, retrieval: { ...config.retrieval, source_trust_tier_min: parseInt(e.target.value) } })}
                className={`p-2 rounded-none border text-xs font-medium outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <option value={1}>Tier 1 (Curated Only)</option>
                <option value={2}>Tier 2 (Secondary)</option>
                <option value={3}>Tier 3 (All Sources)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Fact Verification Agent */}
        <div className={`p-4 rounded-none border flex flex-col gap-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 border-b pb-2 border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">4. Fact Verification Agent</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">LLM Temperature ({config.fact_agent.temperature})</label>
              <input
                type="range"
                min={0.0}
                max={1.0}
                step={0.1}
                value={config.fact_agent.temperature}
                onChange={(e) => setConfig({ ...config, fact_agent: { ...config.fact_agent, temperature: parseFloat(e.target.value) } })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Strictly Evidence-Bound</label>
              <select
                value={config.fact_agent.strictly_evidence_bound ? 'true' : 'false'}
                onChange={(e) => setConfig({ ...config, fact_agent: { ...config.fact_agent, strictly_evidence_bound: e.target.value === 'true' } })}
                className={`p-2 rounded-none border text-xs font-medium outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <option value="true">Enforced (No Internal Parametric Knowledge)</option>
                <option value="false">Allow Parametric Fallback</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Reliability / Evaluator Agent */}
        <div className={`p-4 rounded-none border flex flex-col gap-3 col-span-2 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 border-b pb-2 border-slate-800/80">
            <Database className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">5. Reliability / Evaluator Agent Weights & Buckets</h2>
          </div>

          <div className="grid grid-cols-5 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Fact Weight ({config.evaluator.weight_fact})</label>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.1}
                value={config.evaluator.weight_fact}
                onChange={(e) => setConfig({ ...config, evaluator: { ...config.evaluator, weight_fact: parseFloat(e.target.value) } })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Citation Weight ({config.evaluator.weight_citation})</label>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.1}
                value={config.evaluator.weight_citation}
                onChange={(e) => setConfig({ ...config, evaluator: { ...config.evaluator, weight_citation: parseFloat(e.target.value) } })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Contradiction Weight ({config.evaluator.weight_contradiction})</label>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.1}
                value={config.evaluator.weight_contradiction}
                onChange={(e) => setConfig({ ...config, evaluator: { ...config.evaluator, weight_contradiction: parseFloat(e.target.value) } })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Reliable Cutoff ({config.evaluator.threshold_reliable})</label>
              <input
                type="range"
                min={0.60}
                max={0.95}
                step={0.05}
                value={config.evaluator.threshold_reliable}
                onChange={(e) => setConfig({ ...config, evaluator: { ...config.evaluator, threshold_reliable: parseFloat(e.target.value) } })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Borderline Cutoff ({config.evaluator.threshold_borderline})</label>
              <input
                type="range"
                min={0.30}
                max={0.60}
                step={0.05}
                value={config.evaluator.threshold_borderline}
                onChange={(e) => setConfig({ ...config, evaluator: { ...config.evaluator, threshold_borderline: parseFloat(e.target.value) } })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
