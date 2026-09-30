import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  Database,
  Search,
  ChevronRight
} from 'lucide-react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';

interface AuditRecord {
  id: string;
  title: string;
  domain: 'Financial' | 'Legal' | 'Healthcare' | 'Regulatory';
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
];

export const MinimalDashboard: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [filterDomain, setFilterDomain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = sampleAudits.filter((item) => {
    const matchesDomain = filterDomain === 'All' || item.domain === filterDomain;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.traceId.includes(searchQuery);
    return matchesDomain && matchesSearch;
  });

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto p-6 gap-6 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-none border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Audits</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight">1,248</span>
            <span className="text-xs text-emerald-400 ml-2 font-semibold">+14% this month</span>
          </div>
        </div>

        <div className={`p-4 rounded-none border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Reliability Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-emerald-400">97.8%</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">Deterministic</span>
          </div>
        </div>

        <div className={`p-4 rounded-none border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Non-Compliance Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-amber-400">3</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">Contradictions</span>
          </div>
        </div>

        <div className={`p-4 rounded-none border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Knowledge Standards</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight">42</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">Curated Policies</span>
          </div>
        </div>
      </div>

      {/* Main Audit Executions Center */}
      <div className={`flex-1 rounded-none border flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              High-Stakes Audit Executions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified reports with full cryptographic audit certificate lineage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-none border text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}>
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search report title or trace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-48 text-xs font-medium"
              />
            </div>

            {/* Filter Selector */}
            <div className="flex items-center gap-1">
              {['All', 'Financial', 'Legal', 'Healthcare', 'Regulatory'].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDomain(d)}
                  className={`px-2.5 py-1 rounded-none text-xs font-medium transition-all cursor-pointer ${
                    filterDomain === d
                      ? isDark
                        ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700'
                        : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* New Audit Button */}
            <button
              onClick={() => auraStore.setActiveTab('AuditWorkbench')}
              className="px-3.5 py-1.5 rounded-none bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              New Audit <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimal Enterprise Data Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'border-slate-800 bg-slate-950/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Claims</th>
                <th className="py-3 px-4">Reliability Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Trace ID</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filtered.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-800/30 transition-colors ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  <td className="py-3 px-4 font-semibold">{item.title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-none text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                      {item.domain}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{item.timestamp}</td>
                  <td className="py-3 px-4 font-mono">{item.claimsCount} claims</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-100">{(item.score * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase ${
                      item.status === 'Reliable'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{item.traceId}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => auraStore.setActiveTab('AuditWorkbench')}
                      className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 text-[11px] ml-auto font-semibold"
                    >
                      View Report <ChevronRight className="w-3 h-3" />
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
