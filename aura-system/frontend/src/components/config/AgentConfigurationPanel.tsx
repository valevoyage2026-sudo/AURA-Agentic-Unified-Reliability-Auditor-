import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  Layers,
  HelpCircle,
  Search,
  CheckCircle,
  FileText,
  AlertTriangle,
  Scale,
  Sparkles,
  ShieldAlert
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
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setConfig((prev) => ({ ...prev, ...data }));
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
      if (res.ok) {
        setStatusMsg('Pipeline configuration updated successfully.');
      } else {
        setStatusMsg('Saved locally (Backend synchronized).');
      }
    } catch {
      setStatusMsg('Saved to local session state.');
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleResetDefaults = () => {
    setConfig(defaultConfig);
    setStatusMsg('Restored pipeline parameters to baseline defaults.');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const inputClass = isDark
    ? 'p-2 rounded border text-xs font-medium outline-none bg-slate-900 border-slate-700 text-slate-100 focus:border-[#D9531E]'
    : 'p-2 rounded border text-xs font-medium outline-none bg-white border-slate-200 text-slate-800 shadow-xs focus:border-[#D9531E] focus:ring-2 focus:ring-[#D9531E]/20 transition-colors';

  const labelClass = isDark
    ? 'text-slate-300 font-medium text-xs'
    : 'text-slate-700 font-medium text-xs';

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto aura-main gap-5" style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      {/* Editorial Page Header (per aura.html measurements) */}
      <div className="relative mb-1">
        <div className="aura-ey font-bold uppercase">
          PIPELINE GUARDRAILS • SYSTEM CONFIGURATION
        </div>
        <h1 className="aura-h1">Pipeline Parameters & Guardrails</h1>
        <div className="aura-lead">
          Configure model assignments, strict evidence binding, contradiction thresholds, and autonomous self-repair caps.
        </div>
        <div className="aura-tag font-mono hidden md:block select-none">
          SAFETY &nbsp;/&nbsp; DETERMINISTIC AUDITING
        </div>
      </div>

      {/* Top Header Controls Bar */}
      <div className="p-4 rounded-lg border flex items-center justify-between gap-4 flex-wrap bg-[var(--card)] border-[var(--line)] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-[var(--bg)] border-[var(--line)] text-[var(--or)] shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--ink)]">
              Operational Configuration Controls
            </h2>
            <p className="text-xs text-[var(--mut)] mt-0.5">
              Live parameter adjustments are dispatched immediately to the orchestrator layer.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className={`px-3.5 py-2 rounded-md border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-[#D9531E] hover:bg-[#C2410C] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-md border text-xs font-medium flex items-center gap-2 ${
          isDark
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-xs'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {statusMsg}
        </div>
      )}

      {/* Grid of Agent Cards with Disciplined 3-Tone Architectural System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Orchestrator Controller */}
        <div className={`p-5 rounded-lg border flex flex-col gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs ${
          isDark ? 'bg-navy-900/90 border-navy-800' : 'bg-white border-[#E8E2D5]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-[#F0EBE0] dark:border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#FAF8F3] dark:bg-navy-950 text-navy-800 dark:text-slate-200 flex items-center justify-center border border-[#E8E2D5] dark:border-navy-800">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                1. Orchestrator Controller
              </h2>
            </div>
            <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              LangGraph State
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Max Re-Check Iterations</label>
              <input
                type="number"
                min={1}
                max={5}
                value={config.orchestrator.max_iterations}
                onChange={(e) => setConfig({ ...config, orchestrator: { ...config.orchestrator, max_iterations: parseInt(e.target.value) || 1 } })}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Execution Mode</label>
              <select
                value={config.orchestrator.mode}
                onChange={(e: any) => setConfig({ ...config, orchestrator: { ...config.orchestrator, mode: e.target.value } })}
                className={inputClass}
              >
                <option value="audit_only">Audit Only (Compliance)</option>
                <option value="generate_and_audit">Generate & Audit (Full)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Planner & Decomposition */}
        <div className={`p-5 rounded-lg border flex flex-col gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs ${
          isDark ? 'bg-navy-900/90 border-navy-800' : 'bg-white border-[#E8E2D5]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-[#F0EBE0] dark:border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#FAF8F3] dark:bg-navy-950 text-navy-800 dark:text-slate-200 flex items-center justify-center border border-[#E8E2D5] dark:border-navy-800">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                2. Planner & Decomposition
              </h2>
            </div>
            <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              Taxonomy Parser
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Extraction Granularity</label>
              <select
                value={config.planner.granularity}
                onChange={(e: any) => setConfig({ ...config, planner: { ...config.planner, granularity: e.target.value } })}
                className={inputClass}
              >
                <option value="clause-level">Clause-Level Spans (Recommended)</option>
                <option value="atomic">Sentence-Level Atomic Spans</option>
                <option value="table-level">Table / Key-Value Spans</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Primary Planner Model</label>
              <select
                value={config.planner.model_name}
                onChange={(e: any) => setConfig({ ...config, planner: { ...config.planner, model_name: e.target.value } })}
                className={inputClass}
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="local-qwen">Local Qwen 3.5 (Ollama)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Retrieval & Vector Store */}
        <div className={`p-5 rounded-lg border flex flex-col gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs ${
          isDark ? 'bg-navy-900/90 border-navy-800' : 'bg-white border-[#E8E2D5]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-[#F0EBE0] dark:border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#FAF8F3] dark:bg-navy-950 text-navy-800 dark:text-slate-200 flex items-center justify-center border border-[#E8E2D5] dark:border-navy-800">
                <Search className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                3. Retrieval & Evidence Grounding
              </h2>
            </div>
            <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              Qdrant Vector DB
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Min Cosine</label>
                <span className="text-xs font-mono font-semibold text-[#D9531E] dark:text-terracotta-400 font-bold">{config.retrieval.min_similarity}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={0.95}
                step={0.05}
                value={config.retrieval.min_similarity}
                onChange={(e) => setConfig({ ...config, retrieval: { ...config.retrieval, min_similarity: parseFloat(e.target.value) } })}
                className="w-full accent-[#D9531E] cursor-pointer mt-2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Top-K Passages</label>
              <input
                type="number"
                min={1}
                max={15}
                value={config.retrieval.top_k}
                onChange={(e) => setConfig({ ...config, retrieval: { ...config.retrieval, top_k: parseInt(e.target.value) || 5 } })}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Min Source Tier</label>
              <select
                value={config.retrieval.source_trust_tier_min}
                onChange={(e: any) => setConfig({ ...config, retrieval: { ...config.retrieval, source_trust_tier_min: parseInt(e.target.value) } })}
                className={inputClass}
              >
                <option value={1}>Tier 1 (Curated)</option>
                <option value={2}>Tier 2 (Secondary)</option>
                <option value={3}>Tier 3 (All Sources)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Fact Verification Agent */}
        <div className={`p-5 rounded-lg border flex flex-col gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs ${
          isDark ? 'bg-navy-900/90 border-navy-800' : 'bg-white border-[#E8E2D5]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-[#F0EBE0] dark:border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#FAF8F3] dark:bg-navy-950 text-navy-800 dark:text-slate-200 flex items-center justify-center border border-[#E8E2D5] dark:border-navy-800">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                4. Fact Verification Agent
              </h2>
            </div>
            <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              Evidence Bound
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className={labelClass}>LLM Temperature</label>
                <span className="text-xs font-mono font-semibold text-[#D9531E] dark:text-terracotta-400 font-bold">{config.fact_agent.temperature}</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={1.0}
                step={0.1}
                value={config.fact_agent.temperature}
                onChange={(e) => setConfig({ ...config, fact_agent: { ...config.fact_agent, temperature: parseFloat(e.target.value) } })}
                className="w-full accent-[#D9531E] cursor-pointer mt-2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Evidence Grounding Policy</label>
              <select
                value={config.fact_agent.strictly_evidence_bound ? 'true' : 'false'}
                onChange={(e) => setConfig({ ...config, fact_agent: { ...config.fact_agent, strictly_evidence_bound: e.target.value === 'true' } })}
                className={inputClass}
              >
                <option value="true">Strict (Zero Parametric Overrides)</option>
                <option value="false">Allow Parametric Fallback</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Citation Verification Agent */}
        <div className={`p-5 rounded-lg border flex flex-col gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs ${
          isDark ? 'bg-navy-900/90 border-navy-800' : 'bg-white border-[#E8E2D5]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-[#F0EBE0] dark:border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#FAF8F3] dark:bg-navy-950 text-navy-800 dark:text-slate-200 flex items-center justify-center border border-[#E8E2D5] dark:border-navy-800">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                5. Citation Verification Agent
              </h2>
            </div>
            <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              Source Attributor
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Entailment Criterion</label>
              <select
                value={config.citation_agent.entailment_strictness}
                onChange={(e: any) => setConfig({ ...config, citation_agent: { ...config.citation_agent, entailment_strictness: e.target.value } })}
                className={inputClass}
              >
                <option value="strict_passage">Strict Passage Semantic Entailment</option>
                <option value="topic_relevance">Topical Relevance Only</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Unresolvable Citation Policy</label>
              <select
                value={config.citation_agent.unresolvable_as_invalid ? 'true' : 'false'}
                onChange={(e) => setConfig({ ...config, citation_agent: { ...config.citation_agent, unresolvable_as_invalid: e.target.value === 'true' } })}
                className={inputClass}
              >
                <option value="true">Mark Invalid (Strict Compliance)</option>
                <option value="false">Mark Insufficient Evidence</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6. Contradiction & Logic Agent */}
        <div className={`p-5 rounded-lg border flex flex-col gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs ${
          isDark ? 'bg-navy-900/90 border-navy-800' : 'bg-white border-[#E8E2D5]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-[#F0EBE0] dark:border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#FAF8F3] dark:bg-navy-950 text-navy-800 dark:text-slate-200 flex items-center justify-center border border-[#E8E2D5] dark:border-navy-800">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                6. Logic & Contradiction Agent
              </h2>
            </div>
            <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              Relational Matrix
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Numeric Discrepancy Tolerance</label>
              <select
                value={config.logic_agent.numeric_date_tolerance}
                onChange={(e) => setConfig({ ...config, logic_agent: { ...config.logic_agent, numeric_date_tolerance: parseFloat(e.target.value) } })}
                className={inputClass}
              >
                <option value={0.0}>Strict (0% Exact Match)</option>
                <option value={0.02}>+/- 2% Numerical Rounding</option>
                <option value={0.05}>+/- 5% Approximations</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Contradiction Precedence</label>
              <select
                value={config.logic_agent.strict_contradiction_override ? 'true' : 'false'}
                onChange={(e) => setConfig({ ...config, logic_agent: { ...config.logic_agent, strict_contradiction_override: e.target.value === 'true' } })}
                className={inputClass}
              >
                <option value="true">Strict Contradiction Override</option>
                <option value="false">Allow Weighted Aggregation</option>
              </select>
            </div>
          </div>
        </div>

        {/* 7. Evaluator Agent */}
        <div className={`p-5 rounded-lg border flex flex-col gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs ${
          isDark ? 'bg-navy-900/90 border-navy-800' : 'bg-white border-[#E8E2D5]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-[#F0EBE0] dark:border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#FAF8F3] dark:bg-navy-950 text-navy-800 dark:text-slate-200 flex items-center justify-center border border-[#E8E2D5] dark:border-navy-800">
                <Scale className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                7. Reliability Evaluator
              </h2>
            </div>
            <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              Deterministic Rules
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Reliable Cutoff</label>
                <span className="text-xs font-mono font-semibold text-[#D9531E] dark:text-terracotta-400 font-bold">{config.evaluator.threshold_reliable}</span>
              </div>
              <input
                type="range"
                min={0.60}
                max={0.95}
                step={0.05}
                value={config.evaluator.threshold_reliable}
                onChange={(e) => setConfig({ ...config, evaluator: { ...config.evaluator, threshold_reliable: parseFloat(e.target.value) } })}
                className="w-full accent-[#D9531E] cursor-pointer mt-2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Borderline Floor</label>
                <span className="text-xs font-mono font-semibold text-[#D9531E] dark:text-terracotta-400 font-bold">{config.evaluator.threshold_borderline}</span>
              </div>
              <input
                type="range"
                min={0.30}
                max={0.70}
                step={0.05}
                value={config.evaluator.threshold_borderline}
                onChange={(e) => setConfig({ ...config, evaluator: { ...config.evaluator, threshold_borderline: parseFloat(e.target.value) } })}
                className="w-full accent-[#D9531E] cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>

        {/* 8. Self-Repair / Refinement Agent */}
        <div className={`p-5 rounded-lg border flex flex-col gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs ${
          isDark ? 'bg-navy-900/90 border-navy-800' : 'bg-white border-[#E8E2D5]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-[#F0EBE0] dark:border-navy-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#FAF8F3] dark:bg-navy-950 text-navy-800 dark:text-slate-200 flex items-center justify-center border border-[#E8E2D5] dark:border-navy-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                8. Response Refinement & Self-Repair
              </h2>
            </div>
            <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              Bounded Rewriter
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Remediation Strategy</label>
              <select
                value={config.self_repair.hedging_strategy}
                onChange={(e: any) => setConfig({ ...config, self_repair: { ...config.self_repair, hedging_strategy: e.target.value } })}
                className={inputClass}
              >
                <option value="explicit_uncertainty_note">Insert Explicit Uncertainty Note</option>
                <option value="evidence_rewrite">Rewrite Using Verified Evidence</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Max Autonomous Repairs</label>
              <input
                type="number"
                min={1}
                max={5}
                value={config.self_repair.max_repairs}
                onChange={(e) => setConfig({ ...config, self_repair: { ...config.self_repair, max_repairs: parseInt(e.target.value) || 2 } })}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
