import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  Database,
  Search,
  ChevronRight,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Scale
} from 'lucide-react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import { AgentId } from '../../types/verification';

interface AuditRecord {
  id: string;
  title: string;
  domain: 'Financial' | 'Legal' | 'Healthcare' | 'Regulatory' | 'Academic';
  timestamp: string;
  claimsCount: number;
  score: number;
  status: 'Reliable' | 'Borderline' | 'Unreliable';
  traceId: string;
}

const sampleAudits: AuditRecord[] = [
  {
    id: 'aud-101',
    title: 'Q3 Enterprise Financial & SEC 10-Q Disclosure',
    domain: 'Financial',
    timestamp: '2026-09-30 18:42:10',
    claimsCount: 12,
    score: 0.96,
    status: 'Reliable',
    traceId: 'trace_fin_98a72b',
  },
  {
    id: 'aud-102',
    title: 'Master Services Agreement (MSA) - Liability & GDPR Clause',
    domain: 'Legal',
    timestamp: '2026-09-30 17:15:04',
    claimsCount: 8,
    score: 0.91,
    status: 'Reliable',
    traceId: 'trace_leg_44f1c9',
  },
  {
    id: 'aud-103',
    title: 'Phase II Clinical Trial Protocol Dosage Audit',
    domain: 'Healthcare',
    timestamp: '2026-09-30 15:30:22',
    claimsCount: 15,
    score: 0.68,
    status: 'Borderline',
    traceId: 'trace_med_12e98d',
  },
  {
    id: 'aud-104',
    title: 'SOC 2 Type II Infrastructure Security Assessment',
    domain: 'Regulatory',
    timestamp: '2026-09-30 14:02:18',
    claimsCount: 10,
    score: 0.98,
    status: 'Reliable',
    traceId: 'trace_reg_77c3a0',
  },
  {
    id: 'aud-105',
    title: 'CS 301 Prerequisites & Fall Add/Drop Deadline Audit',
    domain: 'Academic',
    timestamp: '2026-10-26 11:20:45',
    claimsCount: 6,
    score: 0.94,
    status: 'Reliable',
    traceId: 'trace_acad_88d4c1',
  },
];

const agentIcons: Record<string, React.FC<{ className?: string }>> = {
  orchestrator: Layers,
  planner: HelpCircle,
  searcher: Search,
  researcher: Database,
  verifier: CheckCircle2,
  analyst: Cpu,
  evaluator: Scale,
  writer: Sparkles,
};

export const MinimalDashboard: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const currentUser = useAuraStore((s) => s.currentUser);
  const isDark = theme === 'dark';
  const agents = useAuraStore((s) => s.agents);
  const [filterDomain, setFilterDomain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [metrics, setMetrics] = useState<{
    total_audits: number;
    overall_reliability_rate: number;
    contradictions_intercepted: number;
    ground_truth_documents_active: number;
  }>({
    total_audits: 0,
    overall_reliability_rate: 0.95,
    contradictions_intercepted: 0,
    ground_truth_documents_active: 4,
  });
  const [liveReports, setLiveReports] = useState<AuditRecord[]>(sampleAudits);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const role = currentUser?.role || 'officer';
      try {
        const [mRes, rRes] = await Promise.all([
          fetch('http://localhost:8000/v1/audit/metrics', { headers: { 'X-AURA-Role': role } }),
          fetch('http://localhost:8000/v1/audit/reports', { headers: { 'X-AURA-Role': role } }),
        ]);
        if (mRes.ok) {
          const mData = await mRes.json();
          setMetrics(mData);
        }
        if (rRes.ok) {
          const rData = await rRes.json();
          if (rData.reports && Array.isArray(rData.reports) && rData.reports.length > 0) {
            setLiveReports(rData.reports.map((r: any) => ({
              id: r.trace_id.replace('trace_', 'aud-'),
              title: r.document_title || 'Document Compliance Audit',
              domain: (r.domain.charAt(0).toUpperCase() + r.domain.slice(1)) as any,
              timestamp: r.timestamp ? r.timestamp.replace('T', ' ').slice(0, 19) : new Date().toISOString().replace('T', ' ').slice(0, 19),
              claimsCount: r.total_claims || 4,
              score: r.overall_score || 0.9,
              status: r.reliability_bucket === 'reliable' ? 'Reliable' : r.reliability_bucket === 'borderline' ? 'Borderline' : 'Unreliable',
              traceId: r.trace_id,
            })));
          }
        }
      } catch {
        // Fallback to sample data if offline
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const filtered = liveReports.filter((item) => {
    const matchesDomain = filterDomain === 'All' || item.domain === filterDomain;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.traceId.includes(searchQuery);
    return matchesDomain && matchesSearch;
  });

  const agentList = Object.values(agents);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto aura-main gap-5" style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      {/* Editorial Header (per aura.html measurements) */}
      <div className="relative mb-1">
        <div className="aura-ey font-bold uppercase">
          TELEMETRY &amp; REAL-TIME HEALTH
        </div>
        <h1 className="aura-h1">Campus Compliance Telemetry</h1>
        <div className="aura-lead">
          System-wide audit trace verification, deterministic reliability indexing, and agent pipeline observability.
        </div>
        <div className="aura-tag font-mono hidden md:block select-none">
          SYSTEM HEALTH &nbsp;/&nbsp; DETERMINISTIC AUDITING
        </div>
      </div>
      {/* Top Overview Metric Cards - Warm Editorial & Deep Navy Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Audits */}
        <div
          className="p-4 rounded-lg border flex flex-col justify-between transition-all"
          style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--mut)' }}>
              Total Audits
            </span>
            <div className="p-1.5 rounded-md" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--ink)' }}>
              {metrics.total_audits > 0 ? metrics.total_audits : liveReports.length}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded border"
              style={{ background: 'var(--bg)', color: 'var(--txt)', borderColor: 'var(--line)' }}
            >
              Live count
            </span>
          </div>
        </div>

        {/* Reliability Score */}
        <div
          className="p-4 rounded-lg border flex flex-col justify-between transition-all"
          style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--mut)' }}>
              Reliability Score
            </span>
            <div className="p-1.5 rounded-md" style={{ background: 'rgba(31, 157, 85, 0.1)', color: 'var(--ok)' }}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--ok)' }}>
              {(metrics.overall_reliability_rate * 100).toFixed(1)}%
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded border"
              style={{ background: 'rgba(31, 157, 85, 0.08)', color: 'var(--ok)', borderColor: 'rgba(31, 157, 85, 0.25)' }}
            >
              Deterministic
            </span>
          </div>
        </div>

        {/* Non-Compliance Flagged */}
        <div
          className="p-4 rounded-lg border flex flex-col justify-between transition-all"
          style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--mut)' }}>
              Flagged Contradictions
            </span>
            <div className="p-1.5 rounded-md" style={{ background: 'rgba(217, 86, 11, 0.1)', color: 'var(--or)' }}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--or)' }}>
              {metrics.contradictions_intercepted}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded border"
              style={{ background: 'rgba(217, 86, 11, 0.08)', color: 'var(--or)', borderColor: 'rgba(217, 86, 11, 0.25)' }}
            >
              Intercepted
            </span>
          </div>
        </div>

        {/* Knowledge Standards */}
        <div
          className="p-4 rounded-lg border flex flex-col justify-between transition-all"
          style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--mut)' }}>
              Knowledge Base
            </span>
            <div className="p-1.5 rounded-md" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--ink)' }}>
              {metrics.ground_truth_documents_active}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded border"
              style={{ background: 'var(--bg)', color: 'var(--txt)', borderColor: 'var(--line)' }}
            >
              Active Policies
            </span>
          </div>
        </div>
      </div>

      {/* Live Agent Network Telemetry Grid - Warm Editorial Status Architecture */}
      <div
        className="p-4 rounded-lg border flex flex-col gap-3.5"
        style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
      >
        <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--or)]" />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
              Live Agent Telemetry & Processing Nodes
            </span>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--mut)' }}>
            8 Pipeline Agents Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {agentList.map((agent) => {
            const isProcessing = agent.status === 'active';
            const isConflict = agent.status === 'conflict';
            const AgentIcon = agentIcons[agent.id] || Cpu;

            let cardStyle: React.CSSProperties = {
              background: 'var(--bg)',
              borderColor: 'var(--line)',
            };
            let iconBoxStyle: React.CSSProperties = {
              background: 'var(--card)',
              color: 'var(--ink)',
              borderColor: 'var(--line)',
            };
            let statusPillStyle: React.CSSProperties = {
              background: 'var(--card)',
              color: 'var(--mut)',
              borderColor: 'var(--line)',
            };

            if (isConflict) {
              cardStyle = {
                background: 'rgba(217, 86, 11, 0.04)',
                borderColor: 'rgba(217, 86, 11, 0.35)',
              };
              iconBoxStyle = {
                background: 'rgba(217, 86, 11, 0.12)',
                color: 'var(--or)',
                borderColor: 'rgba(217, 86, 11, 0.3)',
              };
              statusPillStyle = {
                background: 'rgba(217, 86, 11, 0.1)',
                color: 'var(--or)',
                borderColor: 'rgba(217, 86, 11, 0.3)',
              };
            } else if (isProcessing) {
              cardStyle = {
                background: 'rgba(22, 52, 95, 0.04)',
                borderColor: 'rgba(22, 52, 95, 0.35)',
              };
              iconBoxStyle = {
                background: 'rgba(22, 52, 95, 0.12)',
                color: 'var(--nav)',
                borderColor: 'rgba(22, 52, 95, 0.3)',
              };
              statusPillStyle = {
                background: 'rgba(22, 52, 95, 0.1)',
                color: 'var(--nav)',
                borderColor: 'rgba(22, 52, 95, 0.3)',
              };
            }

            return (
              <div
                key={agent.id}
                className="p-3 rounded-lg border text-xs flex flex-col gap-2 transition-all shadow-xs"
                style={cardStyle}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center border"
                      style={iconBoxStyle}
                    >
                      <AgentIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-xs" style={{ color: 'var(--ink)' }}>
                      {agent.name}
                    </span>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold border"
                    style={statusPillStyle}
                  >
                    {agent.status}
                  </span>
                </div>
                <div className="text-[11px] line-clamp-1" style={{ color: 'var(--txt)' }}>
                  {agent.role}
                </div>
                <div
                  className="flex items-center justify-between pt-1.5 border-t text-[10px] font-mono tabular-nums"
                  style={{ borderColor: 'var(--line)', color: 'var(--mut)' }}
                >
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[var(--mut)]" />
                    {agent.latencyMs}ms
                  </span>
                  <span>{agent.tokens.toLocaleString()} tok</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Audit Executions Center - Warm Editorial Table */}
      <div
        className="flex-1 rounded-lg border flex flex-col overflow-hidden shadow-xs"
        style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
      >
        {/* Table Header Controls */}
        <div
          className="p-4 border-b flex flex-wrap items-center justify-between gap-3"
          style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
        >
          <div>
            <div className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
              High-Stakes Audit Execution History
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--mut)' }}>
              Verified compliance reports with cryptographic certificate lineage.
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs shadow-xs"
              style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: 'var(--mut)' }} />
              <input
                type="text"
                placeholder="Search report title or trace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-44 text-xs font-medium"
                style={{ color: 'var(--ink)' }}
              />
            </div>

            {/* Filter Selector */}
            <div
              className="flex items-center gap-1 p-0.5 rounded-md border"
              style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
            >
              {['All', 'Financial', 'Legal', 'Healthcare', 'Regulatory', 'Academic'].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDomain(d)}
                  className="px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                  style={
                    filterDomain === d
                      ? { background: 'var(--nav)', color: '#fff', fontWeight: 600 }
                      : { color: 'var(--txt)' }
                  }
                >
                  {d}
                </button>
              ))}
            </div>

            {/* New Audit Button */}
            <button
              onClick={() => auraStore.setActiveTab('AuditWorkbench')}
              className="px-3.5 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #c94a05, #f08a2c)',
                color: '#fff',
                boxShadow: '0 4px 10px rgba(217, 86, 11, 0.27)',
              }}
            >
              New Audit <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimal Enterprise Data Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className="border-b text-[10px] font-bold uppercase tracking-wider"
                style={{ borderColor: 'var(--line)', background: 'var(--bg)', color: 'var(--mut)' }}
              >
                <th className="py-2.5 px-4">Document Title</th>
                <th className="py-2.5 px-4">Domain</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Claims</th>
                <th className="py-2.5 px-4">Reliability Score</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Trace ID</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors border-b hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  style={{ borderColor: 'var(--line)', color: 'var(--txt)' }}
                >
                  <td className="py-3 px-4 font-semibold" style={{ color: 'var(--ink)' }}>
                    {item.title}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-medium border"
                      style={{ background: 'var(--bg)', color: 'var(--txt)', borderColor: 'var(--line)' }}
                    >
                      {item.domain}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-[11px]" style={{ color: 'var(--mut)' }}>
                    {item.timestamp}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums" style={{ color: 'var(--txt)' }}>
                    {item.claimsCount} claims
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums font-bold" style={{ color: 'var(--ink)' }}>
                    {(item.score * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                      style={
                        item.status === 'Reliable'
                          ? {
                              background: 'rgba(31, 157, 85, 0.1)',
                              color: 'var(--ok)',
                              borderColor: 'rgba(31, 157, 85, 0.25)',
                            }
                          : {
                              background: 'rgba(217, 86, 11, 0.1)',
                              color: 'var(--or)',
                              borderColor: 'rgba(217, 86, 11, 0.25)',
                            }
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-[11px]" style={{ color: 'var(--mut)' }}>
                    {item.traceId}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => auraStore.setActiveTab('AuditWorkbench')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer hover:opacity-80"
                      style={{ color: 'var(--or)' }}
                    >
                      Inspect <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

