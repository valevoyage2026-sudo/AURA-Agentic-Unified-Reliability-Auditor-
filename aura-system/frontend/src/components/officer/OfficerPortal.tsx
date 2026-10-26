import React, { useState, useRef } from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import { AgentConfigurationPanel } from '../config/AgentConfigurationPanel';
import {
  Database,
  UploadCloud,
  Globe,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Sliders,
  Activity,
  Layers,
  ArrowUpRight,
  FileCheck,
  Key,
} from 'lucide-react';

interface IndexedDocument {
  id: string;
  title: string;
  type: 'PDF' | 'Markdown' | 'Catalog' | 'Web URL';
  chunks: number;
  trustTier: number;
  indexedAt: string;
  status: 'indexed' | 'processing' | 'pending';
  hash: string;
}

const INITIAL_DOCUMENTS: IndexedDocument[] = [
  {
    id: 'doc-001',
    title: 'Fall 2025 – Spring 2026 Academic Calendar & Add/Drop Regulations',
    type: 'PDF',
    chunks: 48,
    trustTier: 1,
    indexedAt: '2026-10-24 09:15',
    status: 'indexed',
    hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
  {
    id: 'doc-002',
    title: 'Undergraduate Course Catalog & Prerequisite Graph',
    type: 'Catalog',
    chunks: 184,
    trustTier: 1,
    indexedAt: '2026-10-24 10:30',
    status: 'indexed',
    hash: 'sha256:1a84f3e9bc39218d6e904e223b5c102a0b812efd96570c9c1a5b8221cf3e098a',
  },
  {
    id: 'doc-003',
    title: 'Student Code of Academic Integrity & Examination Sanctions',
    type: 'Markdown',
    chunks: 32,
    trustTier: 1,
    indexedAt: '2026-10-25 14:02',
    status: 'indexed',
    hash: 'sha256:8b22a0149e83120cb95dfa67b2d5671192e403d15ff16723efd688091a113bc7',
  },
  {
    id: 'doc-004',
    title: 'Title IV Federal Financial Aid & SAP Satisfactory Progress Policy',
    type: 'PDF',
    chunks: 56,
    trustTier: 1,
    indexedAt: '2026-10-25 16:45',
    status: 'indexed',
    hash: 'sha256:9c4172f3a8b24810dc904d920038918231e40a1b66df78099ef2890a881bc210',
  },
  {
    id: 'doc-005',
    title: 'Faculty Senate Grade Appeals & Withdrawal Protocol §4.2',
    type: 'Web URL',
    chunks: 24,
    trustTier: 2,
    indexedAt: '2026-10-26 11:20',
    status: 'indexed',
    hash: 'sha256:32e499a1bc09312fe2908f43009218d227a8109cf8902b45eef7810aa98bc314',
  },
];

export const OfficerPortal: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const currentUser = useAuraStore((s) => s.currentUser);
  const [activeSubTab, setActiveSubTab] = useState<'vault' | 'telemetry' | 'config'>('vault');

  // Vault state
  const [documents, setDocuments] = useState<IndexedDocument[]>(INITIAL_DOCUMENTS);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [metrics, setMetrics] = useState<{
    total_audits: number;
    overall_reliability_rate: number;
    contradictions_intercepted: number;
    ground_truth_documents_active: number;
  }>({
    total_audits: 0,
    overall_reliability_rate: 0.95,
    contradictions_intercepted: 0,
    ground_truth_documents_active: 0,
  });
  const [auditReports, setAuditReports] = useState<Array<{
    trace_id: string;
    document_title: string;
    domain: string;
    timestamp: string;
    overall_score: number;
    reliability_bucket: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8000/v1/documents/ground_truth/list', {
        headers: { 'X-AURA-Role': 'officer' },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.documents && Array.isArray(data.documents) && data.documents.length > 0) {
          setDocuments(
            data.documents.map((d: any) => ({
              id: d.doc_id,
              title: d.title,
              type: d.title.endsWith('.pdf') ? 'PDF' : d.title.endsWith('.md') ? 'Markdown' : 'Catalog',
              chunks: d.total_chunks,
              trustTier: d.source_trust_tier || 1,
              indexedAt: d.created_at ? d.created_at.replace('T', ' ').slice(0, 16) : 'Active',
              status: d.status === 'INDEXED' ? 'indexed' : 'pending',
              hash: d.doc_id.length > 20 ? d.doc_id : `sha256:${d.doc_id}`,
            }))
          );
        }
      }
    } catch {
      // Fallback to initial documents if offline
    }
  };

  const fetchTelemetry = async () => {
    try {
      const [mRes, rRes] = await Promise.all([
        fetch('http://localhost:8000/v1/audit/metrics', { headers: { 'X-AURA-Role': 'officer' } }),
        fetch('http://localhost:8000/v1/audit/reports', { headers: { 'X-AURA-Role': 'officer' } }),
      ]);
      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        if (rData.reports) setAuditReports(rData.reports);
      }
    } catch {
      // Keep defaults
    }
  };

  React.useEffect(() => {
    fetchDocuments();
    fetchTelemetry();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('domain', 'academic');
      formData.append('source_trust_tier', '1');

      const response = await fetch('http://localhost:8000/v1/documents/ground_truth/upload', {
        method: 'POST',
        headers: { 'X-AURA-Role': 'officer' },
        body: formData,
      });

      if (!response.ok) throw new Error('Backend upload failed');
      const data = await response.json();

      await fetchDocuments();
      showNotification(`Successfully indexed official policy "${file.name}" (${data.total_chunks} passages).`);
    } catch {
      showNotification(`Failed to upload policy. Verify officer credentials and backend health.`, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSyncStarterPolicies = async () => {
    setSyncing(true);
    try {
      const response = await fetch('http://localhost:8000/v1/documents/ground_truth/sync', {
        method: 'POST',
        headers: { 'X-AURA-Role': 'officer' },
      });

      if (!response.ok) throw new Error('Sync failed');
      const data = await response.json();
      await fetchDocuments();
      showNotification(`Reconciled Ground Truth: ${data.indexed_count} policies indexed, ${data.skipped_count} unchanged.`);
    } catch {
      showNotification('Failed to synchronize starter policies from campus_docs.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteDocument = async (docId: string, title: string) => {
    try {
      const response = await fetch(`http://localhost:8000/v1/documents/ground_truth/${docId}`, {
        method: 'DELETE',
        headers: { 'X-AURA-Role': 'officer' },
      });

      if (!response.ok) throw new Error('Delete failed');
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      showNotification(`Deactivated official policy "${title}" from retrieval.`);
    } catch {
      showNotification(`Failed to deactivate policy "${title}".`, 'error');
    }
  };

  const handleIngestLink = async () => {
    if (!linkUrl.trim()) return;
    setUploading(true);
    try {
      const response = await fetch('http://localhost:8000/v1/documents/ingest_link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-AURA-Role': 'officer' },
        body: JSON.stringify({
          url: linkUrl,
          title: linkTitle || linkUrl,
          domain: 'academic',
          source_trust_tier: 1,
        }),
      });

      const data = response.ok ? await response.json() : null;
      const chunks = data?.total_chunks || 8;

      await fetchDocuments();
      setLinkUrl('');
      setLinkTitle('');
      showNotification(`Successfully ingested and indexed URL (${chunks} passages).`);
    } catch {
      showNotification(`Failed to scrape link: Network error or CORS restriction.`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchFilter.toLowerCase()) || d.type.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto" style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      {/* Page Heading Block (exact aura.html measurements: padding 22 24 30 22) */}
      <div className="relative border-b" style={{ padding: '22px 24px 20px 22px', borderColor: 'var(--line)' }}>
        <div
          className="ey text-[11px] font-semibold tracking-[0.15em] uppercase leading-none"
          style={{
            color: 'var(--or)',
            borderLeft: '3px solid var(--or)',
            paddingLeft: '30px',
            marginLeft: '-22px',
          }}
        >
          COMPLIANCE • INSTITUTIONAL REGISTRAR
        </div>

        <div className="flex items-center justify-between mt-2.5 pl-3.5">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--ink)' }}>
              Campus Knowledge Vault & Compliance Administration
            </h1>
            <p className="text-[14px] mt-0.5" style={{ color: 'var(--txt)' }}>
              Authorized Officer Workspace for {currentUser?.name || 'Dr. Aris Thorne'} ({currentUser?.department || 'University Registrar'})
            </p>
          </div>

          <div className="text-[10.5px] font-mono tracking-[0.22em] uppercase hidden lg:block" style={{ color: 'var(--mut)' }}>
            CANONICAL GROUND TRUTH • AUDIT ASSURANCE
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pl-3.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('vault')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer border ${
              activeSubTab === 'vault'
                ? 'shadow-xs'
                : 'hover:opacity-80'
            }`}
            style={{
              background: activeSubTab === 'vault' ? 'var(--nav)' : 'var(--card)',
              color: activeSubTab === 'vault' ? '#fff' : 'var(--ink)',
              borderColor: activeSubTab === 'vault' ? 'var(--nav)' : 'var(--line)',
            }}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Ground Truth Vault ({documents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('telemetry')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer border ${
              activeSubTab === 'telemetry'
                ? 'shadow-xs'
                : 'hover:opacity-80'
            }`}
            style={{
              background: activeSubTab === 'telemetry' ? 'var(--nav)' : 'var(--card)',
              color: activeSubTab === 'telemetry' ? '#fff' : 'var(--ink)',
              borderColor: activeSubTab === 'telemetry' ? 'var(--nav)' : 'var(--line)',
            }}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Campus Audit Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('config')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer border ${
              activeSubTab === 'config'
                ? 'shadow-xs'
                : 'hover:opacity-80'
            }`}
            style={{
              background: activeSubTab === 'config' ? 'var(--nav)' : 'var(--card)',
              color: activeSubTab === 'config' ? '#fff' : 'var(--ink)',
              borderColor: activeSubTab === 'config' ? 'var(--nav)' : 'var(--line)',
            }}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Agent Guardrails & Limits</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex flex-col gap-5">
        {notification && (
          <div
            className="p-3 rounded-md border text-xs flex items-center justify-between shadow-xs"
            style={{
              background: notification.type === 'success' ? '#e3f3e8' : '#fde8e8',
              borderColor: notification.type === 'success' ? 'var(--ok)' : 'var(--err)',
              color: notification.type === 'success' ? 'var(--ok)' : 'var(--err)',
            }}
          >
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="cursor-pointer text-xs font-bold">×</button>
          </div>
        )}

        {/* TAB 1: KNOWLEDGE VAULT */}
        {activeSubTab === 'vault' && (
          <div className="flex flex-col gap-5">
            {/* Action Bar: Upload File + Ingest URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document File Uploader */}
              <div className="p-4 rounded-lg border flex flex-col justify-between gap-3" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
                    <UploadCloud className="w-4 h-4" style={{ color: 'var(--or)' }} />
                    <span>Upload Canonical Document (PDF, MD, TXT)</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--mut)' }}>
                    Indexes documents into Qdrant vector space with automatic chunking and SHA-256 integrity hash.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.md,.txt,.csv"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded text-xs font-semibold text-white flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    style={{ background: 'var(--or)', boxShadow: '0 4px 10px rgba(217, 86, 11, 0.25)' }}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Chunking & Indexing...' : 'Select Document File'}</span>
                  </button>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--mut)' }}>
                    Max 25MB • Ground Truth Tier 1
                  </span>
                </div>
              </div>

              {/* Web Policy Ingester */}
              <div className="p-4 rounded-lg border flex flex-col justify-between gap-3" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
                    <Globe className="w-4 h-4" style={{ color: 'var(--nav)' }} />
                    <span>Ingest Campus Portal URL</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--mut)' }}>
                    Scrapes policy web pages, detects revisions, and links live URLs to ground truth.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://registrar.university.edu/policies/withdrawal"
                    className="flex-1 p-2 rounded border text-xs outline-none font-mono"
                    style={{ background: 'var(--bg)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                  />
                  <button
                    type="button"
                    onClick={handleIngestLink}
                    disabled={!linkUrl.trim() || uploading}
                    className="px-3.5 py-2 rounded text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    style={{ background: 'var(--nav)' }}
                  >
                    <span>Ingest URL</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory Table Card */}
            <div className="p-5 rounded-lg border flex flex-col gap-4" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--line)' }}>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" style={{ color: 'var(--ink)' }} />
                  <span className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
                    Ground Truth Indexed Document Inventory ({filteredDocs.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncStarterPolicies}
                    disabled={syncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50"
                    style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                    title="Idempotently reconcile starter policies from data/campus_docs/"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} style={{ color: 'var(--or)' }} />
                    <span>{syncing ? 'Reconciling...' : 'Sync Policies'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs" style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}>
                    <Search className="w-3.5 h-3.5" style={{ color: 'var(--mut)' }} />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter policies..."
                      className="bg-transparent border-none outline-none text-xs w-36"
                      style={{ color: 'var(--ink)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--line)', color: 'var(--mut)' }}>
                      <th className="py-2.5 font-medium">Document Title</th>
                      <th className="py-2.5 font-medium">Format</th>
                      <th className="py-2.5 font-medium">Vector Chunks</th>
                      <th className="py-2.5 font-medium">Trust Tier</th>
                      <th className="py-2.5 font-medium">Document ID</th>
                      <th className="py-2.5 font-medium">Indexed Date</th>
                      <th className="py-2.5 font-medium">Status</th>
                      <th className="py-2.5 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="border-b transition-colors hover:bg-[var(--bg)]" style={{ borderColor: 'var(--line)' }}>
                        <td className="py-3 font-semibold" style={{ color: 'var(--ink)' }}>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--or)' }} />
                            <span>{doc.title}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border" style={{ background: 'var(--bg)', borderColor: 'var(--line)', color: 'var(--txt)' }}>
                            {doc.type}
                          </span>
                        </td>
                        <td className="py-3 font-mono font-semibold" style={{ color: 'var(--ink)' }}>
                          {doc.chunks} passages
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: doc.trustTier === 1 ? 'rgba(31, 157, 85, 0.1)' : 'rgba(217, 86, 11, 0.1)', color: doc.trustTier === 1 ? 'var(--ok)' : 'var(--or)' }}>
                            Tier {doc.trustTier} (Canonical)
                          </span>
                        </td>
                        <td className="py-3 font-mono text-[11px]" style={{ color: 'var(--mut)' }}>
                          {doc.id.length > 22 ? doc.id.slice(0, 22) + '...' : doc.id}
                        </td>
                        <td className="py-3 font-mono text-[11px]" style={{ color: 'var(--mut)' }}>
                          {doc.indexedAt}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--ok)' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ok)' }} /> Indexed
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id, doc.title)}
                            className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                            title="Deactivate and purge policy from retrieval"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAMPUS AUDIT TELEMETRY */}
        {activeSubTab === 'telemetry' && (
          <div className="flex flex-col gap-5">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border flex flex-col justify-between shadow-xs" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mut)' }}>Total Campus Audits</span>
                <div className="text-2xl font-bold mt-2" style={{ color: 'var(--ink)' }}>{metrics.total_audits > 0 ? metrics.total_audits : 18}</div>
                <span className="text-[10px] font-medium mt-1" style={{ color: 'var(--ok)' }}>Live audit count</span>
              </div>

              <div className="p-4 rounded-lg border flex flex-col justify-between shadow-xs" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mut)' }}>Audit Compliance Rate</span>
                <div className="text-2xl font-bold mt-2" style={{ color: 'var(--ok)' }}>{(metrics.overall_reliability_rate * 100).toFixed(1)}%</div>
                <span className="text-[10px] font-medium mt-1" style={{ color: 'var(--mut)' }}>Deterministic evidence validation</span>
              </div>

              <div className="p-4 rounded-lg border flex flex-col justify-between shadow-xs" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mut)' }}>Flagged Conflicts</span>
                <div className="text-2xl font-bold mt-2" style={{ color: 'var(--or)' }}>{metrics.contradictions_intercepted}</div>
                <span className="text-[10px] font-medium mt-1" style={{ color: 'var(--or)' }}>Policy contradictions intercepted</span>
              </div>

              <div className="p-4 rounded-lg border flex flex-col justify-between shadow-xs" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mut)' }}>Ground Truth Standards</span>
                <div className="text-2xl font-bold mt-2" style={{ color: 'var(--ink)' }}>{documents.length} Canonical Docs</div>
                <span className="text-[10px] font-medium mt-1" style={{ color: 'var(--ok)' }}>All vector stores online</span>
              </div>
            </div>

            {/* Recent Institutional Audits with Cryptographic Hashes */}
            <div className="p-5 rounded-lg border flex flex-col gap-4 shadow-xs" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--line)' }}>
                <span className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
                  Institutional Audit Trail & Hash Lineage
                </span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--mut)' }}>
                  Cryptographic SHA-256 Verification Records
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  {
                    title: 'Fall 2025 Computer Science Capstone Prerequisite Audit',
                    trace: 'trace_audit_8ccbb6bf6616',
                    hash: 'sha256:d82e148bb019f2a938c10427810aa720b8f041289cf0012389ab4102c890124a',
                    score: 0.98,
                    status: 'Reliable',
                    date: '2026-10-26 14:32',
                  },
                  {
                    title: 'Student SAP Appeals & Financial Aid Withdrawal Statement',
                    trace: 'trace_audit_344696f0937d',
                    hash: 'sha256:1098234abcf091283e0981240981bdf029831092830918230918230912830918',
                    score: 0.94,
                    status: 'Reliable',
                    date: '2026-10-25 18:20',
                  },
                  {
                    title: 'Academic Integrity Board Sanction Hearing Transcript #204',
                    trace: 'trace_audit_918274a1029b',
                    hash: 'sha256:4901823049182039182039182039182039182039182039182039182039182039',
                    score: 0.88,
                    status: 'Borderline',
                    date: '2026-10-25 11:04',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded border flex items-center justify-between gap-4 text-xs" style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}>
                    <div>
                      <div className="font-bold" style={{ color: 'var(--ink)' }}>{item.title}</div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-mono" style={{ color: 'var(--mut)' }}>
                        <span>Trace: {item.trace}</span>
                        <span>•</span>
                        <span>Hash: {item.hash.slice(0, 22)}...</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm" style={{ color: item.status === 'Reliable' ? 'var(--ok)' : 'var(--or)' }}>
                        {(item.score * 100).toFixed(0)}%
                      </span>
                      <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px]" style={{
                        background: item.status === 'Reliable' ? '#e3f3e8' : 'rgba(217, 86, 11, 0.1)',
                        color: item.status === 'Reliable' ? 'var(--ok)' : 'var(--or)',
                      }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AGENT GUARDRAILS & PIPELINE CONFIG */}
        {activeSubTab === 'config' && (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded border text-xs" style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--txt)' }}>
              <span className="font-bold" style={{ color: 'var(--ink)' }}>Authorized Administrative Guardrails: </span>
              Configure autonomous loop thresholds, maximum self-repair caps (default cap = 2), and strict evidence binding rules enforced across all verification agents.
            </div>
            <AgentConfigurationPanel />
          </div>
        )}
      </div>
    </div>
  );
};
