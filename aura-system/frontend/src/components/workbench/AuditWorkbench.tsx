import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  FileText,
  UploadCloud,
  Download,
  Lock,
  ArrowRight,
  Link as LinkIcon,
  FileUp,
  Table,
  CheckCircle2
} from 'lucide-react';
import { useAuraStore } from '../../store/useAuraStore';

export const AuditWorkbench: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const isDark = theme === 'dark';

  const [domain, setDomain] = useState<'general' | 'financial' | 'legal' | 'healthcare' | 'regulatory'>('financial');
  const [docTitle, setDocTitle] = useState('Q3 Enterprise Compliance Summary Report');
  const [docContent, setDocContent] = useState(
    `1. Revenue & Margin Analysis: In Q3, total revenue expanded to $45.2M, representing a 12% YoY growth. Operating margin reached 24%.\n` +
    `2. Legal & Regulatory Compliance: All data processing activities strictly comply with GDPR and HIPAA mandates. Maximum liability is capped at $5.0M under Section 8.2 of the Master Services Agreement.\n` +
    `3. Clinical & Safety Protocol: Patient dosage administered during Trial Phase II was 50mg daily. Primary endpoint efficacy was achieved at day 14 with zero adverse events recorded.`
  );

  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [exportedCert, setExportedCert] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ingest Document Text into Repository
  const handleIngestDocument = async () => {
    setLoading(true);
    setIngestStatus(null);
    try {
      const res = await fetch('http://localhost:8000/v1/documents/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          domain: domain,
          content: docContent,
          source_trust_tier: 1,
          metadata: { timestamp: new Date().toISOString() },
        }),
      });
      const data = await res.json();
      setIngestStatus(`Indexed Text ID: ${data.doc_id} (${data.total_chunks} chunks)`);
    } catch (err) {
      setIngestStatus('Backend connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Upload File (CSV, PDF, TXT)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setIngestStatus(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('domain', domain);
    formData.append('source_trust_tier', '1');

    try {
      const res = await fetch('http://localhost:8000/v1/documents/upload_file', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setIngestStatus(`Ingested File: ${data.title} (${data.doc_id})`);
    } catch (err) {
      setIngestStatus('Error uploading file resource.');
    } finally {
      setLoading(false);
    }
  };

  // Ingest Web Link URL
  const handleIngestLink = async () => {
    if (!linkUrl.trim()) return;
    setLoading(true);
    setIngestStatus(null);
    try {
      const res = await fetch('http://localhost:8000/v1/documents/ingest_link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: linkUrl,
          domain: domain,
          source_trust_tier: 1,
        }),
      });
      const data = await res.json();
      setIngestStatus(`Ingested Link Resource: ${data.title}`);
      setLinkUrl('');
      setShowLinkInput(false);
    } catch (err) {
      setIngestStatus('Error ingesting web link.');
    } finally {
      setLoading(false);
    }
  };

  // Run Compliance Audit
  const handleRunAudit = async () => {
    setLoading(true);
    setExportedCert(null);
    try {
      const res = await fetch('http://localhost:8000/v1/audit/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          domain: domain,
          document_text: docContent,
        }),
      });
      const data = await res.json();
      setAuditReport(data);
    } catch (err) {
      alert('Error running compliance audit.');
    } finally {
      setLoading(false);
    }
  };

  // Export Audit Certificate
  const handleExportCertificate = async (format: 'json' | 'markdown') => {
    if (!auditReport) return;
    try {
      const res = await fetch('http://localhost:8000/v1/audit/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trace_id: auditReport.trace_id,
          format: format,
        }),
      });
      const data = await res.json();
      setExportedCert(data.certificate_content);

      const blob = new Blob([data.certificate_content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AURA_Compliance_Certificate_${auditReport.trace_id}.${format === 'json' ? 'json' : 'md'}`;
      a.click();
    } catch (err) {
      alert('Error exporting certificate.');
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.pdf,.txt,.md,.json"
        className="hidden"
      />

      {/* Header Bar */}
      <div className={`p-4 rounded-none border flex items-center justify-between ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-none bg-indigo-950/60 text-indigo-400 border border-indigo-800/80">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold flex items-center gap-2 text-slate-100">
              High-Stakes Document Compliance Inspector
            </h1>
            <p className="text-xs text-slate-400">
              Deterministic multi-agent factual auditing, contradiction detection, and certificate lineage.
            </p>
          </div>
        </div>

        {/* Action Controls & Domain Profile Selector */}
        <div className="flex items-center gap-3">
          {/* Quick Resource Add Buttons */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-none border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
            title="Upload CSV, PDF, TXT or MD File"
          >
            <FileUp className="w-3.5 h-3.5 text-indigo-400" /> Upload File (CSV/PDF)
          </button>

          <button
            onClick={() => setShowLinkInput(!showLinkInput)}
            className="px-3 py-1.5 rounded-none border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
            title="Add Regulatory Web Link URL"
          >
            <LinkIcon className="w-3.5 h-3.5 text-indigo-400" /> Add URL Link
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <label className="text-xs font-semibold text-slate-400">Domain Profile:</label>
            <select
              value={domain}
              onChange={(e: any) => setDomain(e.target.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-none border outline-none cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <option value="financial">Financial (SEC 10-K / Audit)</option>
              <option value="legal">Legal (Contracts / MSA)</option>
              <option value="healthcare">Healthcare (Clinical / FDA)</option>
              <option value="regulatory">Regulatory (SOC 2 / HIPAA)</option>
              <option value="general">General Auditor</option>
            </select>
          </div>
        </div>
      </div>

      {/* URL Link Ingestion Popover */}
      {showLinkInput && (
        <div className="p-3 rounded-none border bg-slate-900 border-indigo-800 flex items-center gap-3">
          <LinkIcon className="w-4 h-4 text-indigo-400" />
          <input
            type="url"
            placeholder="Paste regulatory web URL (e.g. https://sec.gov/edgar/...)..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-xs p-2 text-slate-200 outline-none font-mono"
          />
          <button
            onClick={handleIngestLink}
            disabled={!linkUrl.trim() || loading}
            className="px-3 py-1.5 rounded-none bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer"
          >
            Ingest URL
          </button>
        </div>
      )}

      {/* Dual-Pane Workbench Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Left Pane: Input Document Payload */}
        <div className={`col-span-6 flex flex-col rounded-none border p-4 gap-4 overflow-hidden ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between border-b pb-2 border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Document Content Under Audit
            </span>
            <span className="text-[11px] text-slate-500 font-mono">{docContent.length} chars</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Document Title</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className={`text-xs px-3 py-2 rounded-none border outline-none font-medium ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
            <label className="text-xs font-semibold text-slate-400">Document Text Payload</label>
            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Paste contract clauses, financial figures, clinical protocols, or compliance disclosures..."
              className={`flex-1 p-3 text-xs font-mono rounded-none border outline-none resize-none leading-relaxed ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {ingestStatus && (
            <div className="text-[11px] p-2.5 rounded-none bg-slate-950 border border-slate-800 text-indigo-300 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {ingestStatus}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleRunAudit}
              disabled={loading || !docContent.trim()}
              className="flex-1 py-2 px-4 rounded-none text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
              {loading ? 'Evaluating Claims...' : 'Execute Compliance Audit'}
            </button>

            <button
              onClick={handleIngestDocument}
              disabled={loading || !docContent.trim()}
              className="py-2 px-4 rounded-none text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              Ingest Document Text
            </button>
          </div>
        </div>

        {/* Right Pane: Audit Results & Findings */}
        <div className={`col-span-6 flex flex-col rounded-none border p-4 gap-4 overflow-hidden ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between border-b pb-2 border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Audit Findings & Lineage
            </span>

            {auditReport && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCertificate('json')}
                  className="px-2.5 py-1 rounded-none bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" /> Export JSON
                </button>
                <button
                  onClick={() => handleExportCertificate('markdown')}
                  className="px-2.5 py-1 rounded-none bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Export MD
                </button>
              </div>
            )}
          </div>

          {!auditReport ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 gap-3">
              <Lock className="w-10 h-10 text-slate-700 stroke-1" />
              <div>
                <h3 className="text-xs font-bold text-slate-400">Ready to Audit</h3>
                <p className="text-xs max-w-sm mt-1 text-slate-500">
                  Select a domain profile, provide document text or upload files (CSV/PDF), and execute audit to inspect factual verification lineage.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              {/* Overall Summary Score */}
              <div className="p-3.5 rounded-none border bg-slate-950 border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Reliability Score
                  </div>
                  <div className="text-lg font-bold flex items-center gap-2 mt-0.5 text-slate-100">
                    {(auditReport.overall_score * 100).toFixed(1)}%
                    <span className="text-[10px] px-2 py-0.5 rounded-none font-mono uppercase bg-slate-800 text-indigo-300 border border-indigo-800/80">
                      {auditReport.bucket}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono text-slate-400">
                  <div>Trace: {auditReport.trace_id}</div>
                  <div className="truncate max-w-[180px]" title={auditReport.audit_hash}>
                    Hash: {auditReport.audit_hash.substring(0, 16)}...
                  </div>
                </div>
              </div>

              {/* Claims Breakdown Table / List */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span>Claims Audit Breakdown ({auditReport.claims_breakdown?.length || 0})</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {auditReport.reliable_claims_count} Verified • {auditReport.unreliable_claims_count} Flagged
                  </span>
                </span>

                {auditReport.claims_breakdown?.map((item: any, idx: number) => (
                  <div
                    key={item.claim_id || idx}
                    className={`p-3 rounded-none border text-xs flex flex-col gap-1.5 ${
                      isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-indigo-400 font-medium">{item.claim_id}</span>
                      <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase ${
                        item.verdict === 'supported'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : item.verdict === 'contradicted' || item.verdict === 'invalid'
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      }`}>
                        {item.verdict} ({(item.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>

                    <p className="text-slate-200 font-medium text-xs leading-normal">"{item.text}"</p>

                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-none border border-slate-800/80">
                      <strong>Audit Rationale:</strong> {item.rationale}
                    </div>

                    {item.evidence_refs?.length > 0 && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Evidence Source: {item.evidence_refs.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {exportedCert && (
                <div className="p-3 rounded-none border border-slate-800 bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  <div className="font-bold text-indigo-400 mb-1">Signed Certificate Export:</div>
                  {exportedCert}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
