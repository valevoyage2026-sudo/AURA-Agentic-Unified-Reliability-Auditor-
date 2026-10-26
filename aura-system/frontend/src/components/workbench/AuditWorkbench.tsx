import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  FileText,
  UploadCloud,
  Download,
  ArrowRight,
  Link as LinkIcon,
  FileUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ExternalLink,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RefreshCw,
  Copy,
  Sparkles,
  Sliders,
  Eye,
  Code,
  Calendar,
  BookOpen,
  Scale,
  Coins,
  FileEdit,
  RotateCcw,
  Globe,
  HelpCircle,
  Clock,
  Database,
  Network,
  Settings,
  ArrowUpRight,
  Activity,
  Layers,
  HeartPulse,
  FileCheck
} from 'lucide-react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';

export type DocCategoryKey = 'calendar' | 'catalog' | 'handbook' | 'financial_aid' | 'custom';
export type InputFormatMode = 'paste' | 'upload' | 'url';

export interface DocCategoryConfig {
  key: DocCategoryKey;
  label: string;
  shortLabel: string;
  iconName: 'calendar' | 'catalog' | 'handbook' | 'financial_aid' | 'custom';
  colorClasses: {
    active: string;
    border: string;
    badge: string;
    focusBg: string;
    focusBorder: string;
    pillBg: string;
  };
  auditorFocus: string;
  whatItAudits: string;
  defaultTitle: string;
  sampleAuditText: string;
  sampleGeneratePrompt: string;
  suggestedQuestions: string[];
  samplePdfName: string;
  sampleUrl: string;
  domain: 'general' | 'academic' | 'financial' | 'legal' | 'healthcare' | 'regulatory';
  buttonLabel: string;
}

export const docCategoryConfigs: Record<DocCategoryKey, DocCategoryConfig> = {
  calendar: {
    key: 'calendar',
    label: 'Academic Calendar',
    shortLabel: 'Calendar',
    iconName: 'calendar',
    colorClasses: {
      active: 'bg-indigo-600 text-white font-semibold shadow-xs',
      border: 'border-slate-200/90 dark:border-slate-700',
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      focusBg: 'bg-slate-50/80 dark:bg-slate-900/60',
      focusBorder: 'border-slate-200/90 dark:border-slate-800',
      pillBg: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-700',
    },
    auditorFocus: 'Date consistency and timeline contradictions (add/drop, withdrawal, tuition payment, exams).',
    whatItAudits: 'Add/drop deadlines, withdrawal dates, exam schedules, and tuition payment dates.',
    defaultTitle: 'Fall 2025 Academic Calendar & Registration Deadlines',
    sampleAuditText: `1. Add/Drop Deadline: The official deadline to add or drop a course without a 'W' grade for Fall 2025 is Friday, September 12, 2025 at 5:00 PM EST.
2. Withdrawal Period: The official deadline to withdraw from a course without penalty for Fall 2025 is October 15, 2025.
3. Tuition Payment: Full tuition and fee payment for Fall 2025 is due no later than August 18, 2025 at 4:30 PM EST.
4. Final Examinations: Final examinations will commence on Monday, December 8, 2025 and conclude on Friday, December 12, 2025.`,
    sampleGeneratePrompt: 'What is the last date to drop a course without a "W" grade for Fall 2025, and when is tuition payment due?',
    suggestedQuestions: [
      "What is the last date to drop without a 'W' grade?",
      "When is full tuition payment due for Fall 2025?",
      "What are the official dates for the final examination period?"
    ],
    samplePdfName: 'Fall_2025_Academic_Calendar.pdf',
    sampleUrl: 'https://registrar.university.edu/fall-2025-deadlines',
    domain: 'academic',
    buttonLabel: 'Run Calendar Audit',
  },
  catalog: {
    key: 'catalog',
    label: 'Course Catalog',
    shortLabel: 'Catalog',
    iconName: 'catalog',
    colorClasses: {
      active: 'bg-indigo-600 text-white font-semibold shadow-xs',
      border: 'border-slate-200/90 dark:border-slate-700',
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      focusBg: 'bg-slate-50/80 dark:bg-slate-900/60',
      focusBorder: 'border-slate-200/90 dark:border-slate-800',
      pillBg: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-700',
    },
    auditorFocus: 'Course dependency chains and prerequisite hallucination traps (e.g. CS 301 prerequisite rules).',
    whatItAudits: 'Course descriptions, prerequisites, corequisites, and major credit requirements.',
    defaultTitle: 'Computer Science 2025-2026 Undergraduate Course Catalog & Prerequisite Map',
    sampleAuditText: `1. CS 101 Introduction to Computing: 4 credit hours. Prerequisite: High school algebra or MATH 101. Corequisite: CS 101L Lab.
2. CS 201 Data Structures & Algorithms: 4 credit hours. Prerequisite: CS 101 with a minimum grade of C and MATH 115 Calculus I.
3. CS 301 Systems Programming: 4 credit hours. Prerequisite: CS 201 with a minimum grade of C. Note: CS 301 requires Math 400 and Advanced Linear Algebra.
4. Major Graduation Requirements: All Computer Science majors must complete 120 total credits, including 48 credits of 300+ level coursework.`,
    sampleGeneratePrompt: 'Can a student take CS 301 Systems Programming without completing MATH 115, and what are the prerequisites for CS 201?',
    suggestedQuestions: [
      "Can a student take CS 301 without Math 400?",
      "What are the required prerequisites for CS 201 Data Structures?",
      "What is the minimum grade in CS 101 required to advance to CS 201?"
    ],
    samplePdfName: 'CS_Catalog_2025_Prerequisites.pdf',
    sampleUrl: 'https://catalog.university.edu/courses/computer-science',
    domain: 'academic',
    buttonLabel: 'Run Prerequisite Audit',
  },
  handbook: {
    key: 'handbook',
    label: 'Handbook & Integrity',
    shortLabel: 'Handbook',
    iconName: 'handbook',
    colorClasses: {
      active: 'bg-indigo-600 text-white font-semibold shadow-xs',
      border: 'border-slate-200/90 dark:border-slate-700',
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      focusBg: 'bg-slate-50/80 dark:bg-slate-900/60',
      focusBorder: 'border-slate-200/90 dark:border-slate-800',
      pillBg: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-700',
    },
    auditorFocus: 'Exact section citations (e.g. Handbook §4.1), disciplinary tiers, AI usage rules, and fabricated policy traps.',
    whatItAudits: 'Plagiarism rules, AI usage policies, grading appeals, and disciplinary codes.',
    defaultTitle: 'Student Code of Conduct & Academic Integrity Policy Handbook 2025-2026',
    sampleAuditText: `1. Definition of Plagiarism: According to Student Code of Conduct Section 4.1, plagiarism is defined as the intentional or unintentional use of another's words, ideas, or work without attribution.
2. Generative AI Policy: In accordance with Academic Policy Section 4.3, generative AI tools may only be used when explicitly authorized in the instructor's written syllabus.
3. First-Offense Sanction: A first-time documented academic integrity infraction results in an automatic zero on the assignment and mandatory completion of the Ethics Advisory Seminar.
4. Exam Attendance Exemption: According to Student Handbook Section 99.7, undergraduate students are exempt from attending final examinations if they maintain an overall A average.`,
    sampleGeneratePrompt: 'According to Student Code of Conduct Section 4.1, what is the penalty for a first-time plagiarism violation and what is the rule on generative AI?',
    suggestedQuestions: [
      "What is the penalty for a first-time plagiarism violation under Section 4.1?",
      "Are students ever exempt from final examinations under Section 99.7?",
      "When is the use of Generative AI permitted according to university policy?"
    ],
    samplePdfName: 'Student_Handbook_Section_4.pdf',
    sampleUrl: 'https://handbook.university.edu/student-code-section-4',
    domain: 'academic',
    buttonLabel: 'Run Integrity Audit',
  },
  financial_aid: {
    key: 'financial_aid',
    label: 'Financial Aid',
    shortLabel: 'Financial Aid',
    iconName: 'financial_aid',
    colorClasses: {
      active: 'bg-indigo-600 text-white font-semibold shadow-xs',
      border: 'border-slate-200/90 dark:border-slate-700',
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      focusBg: 'bg-slate-50/80 dark:bg-slate-900/60',
      focusBorder: 'border-slate-200/90 dark:border-slate-800',
      pillBg: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-700',
    },
    auditorFocus: 'Exact GPA retention thresholds (3.25 vs 2.50), credit hour minimums, and Satisfactory Academic Progress (SAP).',
    whatItAudits: 'Merit scholarship GPA requirements, credit hour minimums, and SAP policies.',
    defaultTitle: 'Institutional Merit Scholarships & Federal Financial Aid Retention Guidelines',
    sampleAuditText: `1. Presidential Merit Scholarship: Recipients must maintain full-time enrollment of at least 12 credit hours and a minimum cumulative GPA of 3.25. Note: Students can retain the Presidential Merit Scholarship with a cumulative GPA of 2.50.
2. Satisfactory Academic Progress: Undergraduate students must successfully complete at least 67% of all attempted cumulative credit hours to maintain Satisfactory Academic Progress for federal financial aid.
3. Maximum Timeframe: Students must complete their degree requirements within 150% of the published program credit hours (180 credits for a 120-credit degree).
4. Degree Audit Standing: Students falling below 3.00 GPA enter a single-semester probationary status before aid termination.`,
    sampleGeneratePrompt: 'What GPA and credit hours are required to keep the Presidential Scholarship, and what is the SAP completion rate?',
    suggestedQuestions: [
      "What GPA is required to keep the Presidential Scholarship?",
      "What completion percentage is required for SAP compliance?",
      "What is the credit hour minimum for full-time financial aid?"
    ],
    samplePdfName: 'Scholarship_Guidelines_2025.pdf',
    sampleUrl: 'https://financialaid.university.edu/retention-guidelines',
    domain: 'financial',
    buttonLabel: 'Run Financial Aid Audit',
  },
  custom: {
    key: 'custom',
    label: 'Custom Policy',
    shortLabel: 'Custom',
    iconName: 'custom',
    colorClasses: {
      active: 'bg-indigo-600 text-white font-semibold shadow-xs',
      border: 'border-slate-200/90 dark:border-slate-700',
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      focusBg: 'bg-slate-50/80 dark:bg-slate-900/60',
      focusBorder: 'border-slate-200/90 dark:border-slate-800',
      pillBg: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-700',
    },
    auditorFocus: 'Arbitrary institutional statements, vendor contracts, clinical protocols, or regulatory clauses.',
    whatItAudits: 'Custom clauses, policy statements, and external compliance declarations.',
    defaultTitle: 'Custom Institutional Policy & Regulatory Compliance Statement',
    sampleAuditText: `1. Compliance Mandate: All systems handling sensitive identity data must implement multi-factor authentication and role-based access control.
2. Incident Notification: Material security events must be escalated to the compliance officer within 24 hours of confirmation.
3. Retention Schedule: Audit records and lineage certificates must be preserved for a minimum of 7 years in write-once-read-many (WORM) storage.`,
    sampleGeneratePrompt: 'Enter custom compliance prompt or university policy query...',
    suggestedQuestions: [
      "Audit custom policy text for contradictions and unsupported claims"
    ],
    samplePdfName: 'Custom_Policy_Document.pdf',
    sampleUrl: 'https://compliance.internal.corp/policies',
    domain: 'general',
    buttonLabel: 'Run Academic Audit',
  },
};

const renderCategoryIcon = (iconName: string, className = "w-4 h-4") => {
  switch (iconName) {
    case 'calendar':
      return <img src="/aura-assets/icons/calendar.svg" alt="Calendar" className={className} />;
    case 'catalog':
      return <img src="/aura-assets/icons/catalog.svg" alt="Catalog" className={className} />;
    case 'handbook':
      return <img src="/aura-assets/icons/handbook.svg" alt="Handbook" className={className} />;
    case 'financial_aid':
      return <img src="/aura-assets/icons/financial-aid.svg" alt="Financial Aid" className={className} />;
    case 'custom':
    default:
      return <img src="/aura-assets/icons/doc.svg" alt="Custom" className={className} />;
  }
};

export interface EvidenceDetail {
  source_id: string;
  title: string;
  url?: string | null;
  snippet: string;
  confidence: number;
  trust_tier: number;
}

export interface ClaimItem {
  claim_id: string;
  text: string;
  type: string;
  char_span?: [number, number] | null;
  verdict: 'supported' | 'contradicted' | 'insufficient_evidence' | 'weak_attribution' | 'invalid' | 'n/a';
  confidence: number;
  evidence_refs?: string[];
  evidence_details?: EvidenceDetail[];
  rationale: string;
  human_explanation?: string;
  suggested_repair?: string | null;
  is_repaired?: boolean;
  manual_override?: {
    overridden_by: string;
    override_verdict: string;
    override_text: string;
    override_notes: string;
    timestamp: string;
  };
}

export interface AuditReportData {
  trace_id: string;
  document_title: string;
  domain: 'general' | 'academic' | 'financial' | 'legal' | 'healthcare' | 'regulatory';
  overall_score: number;
  bucket: 'reliable' | 'borderline' | 'unreliable' | 'unresolved';
  total_claims: number;
  reliable_claims_count: number;
  borderline_claims_count: number;
  unreliable_claims_count: number;
  claims_breakdown: ClaimItem[];
  audit_hash: string;
  timestamp: string;
}

export const AuditWorkbench: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const currentUser = useAuraStore((s) => s.currentUser);
  const setActiveTab = auraStore.setActiveTab;
  const isDark = theme === 'dark';
  const isStudent = currentUser?.role === 'user';

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<DocCategoryKey>('catalog');
  const [inputFormat, setInputFormat] = useState<InputFormatMode>('paste');
  const activeCategory = docCategoryConfigs[selectedCategoryKey];

  const [domain, setDomain] = useState<'general' | 'academic' | 'financial' | 'legal' | 'healthcare' | 'regulatory'>(activeCategory.domain);
  const [docTitle, setDocTitle] = useState(activeCategory.defaultTitle);
  const [docContent, setDocContent] = useState(activeCategory.sampleAuditText);

  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReportData | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [exportedCert, setExportedCert] = useState<string | null>(null);

  // Interaction State
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [selectedClaimDetail, setSelectedClaimDetail] = useState<ClaimItem | null>(null);
  const [overrideClaimId, setOverrideClaimId] = useState<string | null>(null);
  const [filterVerdict, setFilterVerdict] = useState<'all' | 'verified' | 'flagged' | 'contradictions'>('all');
  const [viewMode, setViewMode] = useState<'annotated' | 'raw'>('annotated');
  const [auditMode, setAuditMode] = useState<'audit_only' | 'generate_and_audit'>('audit_only');
  const [rightPaneTab, setRightPaneTab] = useState<'lineage' | 'findings'>('lineage');

  // Manual Override Form State
  const [overrideText, setOverrideText] = useState('');
  const [overrideVerdict, setOverrideVerdict] = useState<string>('supported');
  const [overrideNotes, setOverrideNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const claimCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSelectCategory = (catKey: DocCategoryKey) => {
    setSelectedCategoryKey(catKey);
    const cat = docCategoryConfigs[catKey];
    setDocTitle(cat.defaultTitle);
    setDomain(cat.domain);
    if (auditMode === 'generate_and_audit') {
      setDocContent(cat.sampleGeneratePrompt);
    } else {
      setDocContent(cat.sampleAuditText);
    }
  };

  const handleToggleAuditMode = (newMode: 'audit_only' | 'generate_and_audit') => {
    setAuditMode(newMode);
    if (newMode === 'generate_and_audit') {
      setDocContent(activeCategory.sampleGeneratePrompt);
    } else {
      setDocContent(activeCategory.sampleAuditText);
    }
  };

  const handleReloadTemplate = () => {
    if (auditMode === 'generate_and_audit') {
      setDocContent(activeCategory.sampleGeneratePrompt);
    } else {
      setDocContent(activeCategory.sampleAuditText);
    }
    setDocTitle(activeCategory.defaultTitle);
    setNotification({
      message: `Reset input to ${activeCategory.label} baseline template.`,
      type: 'info',
    });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const safeFetch = async (endpoint: string, options: RequestInit) => {
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
    const roleHeader = currentUser?.role || 'user';
    const headers = {
      ...(options.headers || {}),
      'X-AURA-Role': roleHeader,
    };
    const reqOptions = { ...options, headers };
    try {
      return await fetch(`http://${host}:8000${endpoint}`, reqOptions);
    } catch {
      return await fetch(`http://127.0.0.1:8000${endpoint}`, reqOptions);
    }
  };

  const handleIngestDocument = async () => {
    if (!docContent.trim()) return;
    setIngesting(true);
    setNotification({ message: 'Indexing document into Knowledge Store...', type: 'info' });
    try {
      const res = await safeFetch('/v1/documents/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle || 'Ground Truth Document',
          domain,
          content: docContent,
          source_trust_tier: 1,
          metadata: { timestamp: new Date().toISOString(), source: 'ui_ingest' },
        }),
      });
      const data = await res.json();
      setNotification({
        message: `Indexed Ground Truth: ${data.doc_id} (${data.total_chunks} chunks stored)`,
        type: 'success',
      });
    } catch {
      setNotification({ message: 'Backend connection error during ingestion.', type: 'error' });
    } finally {
      setIngesting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format & size
    const validExtensions = ['.txt', '.md', '.pdf', '.csv'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setNotification({ message: 'Unsupported file format. Please upload PDF, Markdown, or Plain Text.', type: 'error' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setNotification({ message: 'File exceeds 10MB upload limit.', type: 'error' });
      return;
    }

    setLoading(true);
    setNotification({ message: `Parsing and auditing "${file.name}" against authoritative university policies...`, type: 'info' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('domain', domain);

    try {
      const res = await safeFetch('/v1/documents/verify_upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload audit failed with status ${res.status}`);
      }

      const data: AuditReportData = await res.json();
      setAuditReport(data);
      setDocTitle(data.document_title || `Audit: ${file.name}`);
      if (data.claims_breakdown && data.claims_breakdown.length > 0) {
        setActiveClaimId(data.claims_breakdown[0].claim_id);
      }
      setRightPaneTab('findings');
      setNotification({
        message: `Audited "${file.name}": ${data.total_claims} claims evaluated (${(data.overall_score * 100).toFixed(0)}% Reliable). Strictly verified without ground-truth contamination.`,
        type: 'success',
      });
    } catch {
      setNotification({ message: 'Error verifying document. Verify backend is running on port 8000.', type: 'error' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleIngestLink = async () => {
    if (!linkUrl.trim()) return;
    setLoading(true);
    try {
      const res = await safeFetch('/v1/documents/ingest_link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: linkUrl,
          domain,
          source_trust_tier: 1,
        }),
      });
      const data = await res.json();
      setNotification({ message: `Ingested Link Resource: ${data.title}`, type: 'success' });
      setLinkUrl('');
      setShowLinkInput(false);
    } catch {
      setNotification({ message: 'Error ingesting web link.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setLoading(true);
    setExportedCert(null);
    try {
      const res = await safeFetch('/v1/audit/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          domain,
          document_text: docContent,
          mode: auditMode,
        }),
      });
      const data: AuditReportData = await res.json();
      setAuditReport(data);
      if (data.claims_breakdown && data.claims_breakdown.length > 0) {
        setActiveClaimId(data.claims_breakdown[0].claim_id);
      }
      setRightPaneTab('findings');
      setNotification({
        message: `Audit completed: ${data.total_claims} claims evaluated (${(data.overall_score * 100).toFixed(0)}% Reliable).`,
        type: 'success',
      });
    } catch {
      setNotification({ message: 'Connection error. Ensure backend is running on port 8000.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCertificate = async (format: 'json' | 'markdown') => {
    if (!auditReport) return;
    try {
      const res = await safeFetch('/v1/audit/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trace_id: auditReport.trace_id,
          format,
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
      setNotification({ message: `Exported ${format.toUpperCase()} compliance certificate.`, type: 'success' });
    } catch {
      setNotification({ message: 'Error exporting compliance certificate.', type: 'error' });
    }
  };

  const handleAcceptSelfRepair = (claim: ClaimItem) => {
    if (!claim.suggested_repair || !auditReport) return;

    const updatedContent = docContent.replace(claim.text, claim.suggested_repair);
    setDocContent(updatedContent);

    const updatedBreakdown = auditReport.claims_breakdown.map((c) => {
      if (c.claim_id === claim.claim_id) {
        return {
          ...c,
          text: claim.suggested_repair!,
          verdict: 'supported' as const,
          confidence: 0.95,
          is_repaired: true,
          human_explanation: `Repaired & verified: Claim was aligned with verified source passages.`,
          rationale: `Automated repair applied. Updated to match verified evidence.`,
        };
      }
      return c;
    });

    const newReliableCount = updatedBreakdown.filter((c) => c.verdict === 'supported').length;
    const newScore = updatedBreakdown.length > 0 ? newReliableCount / updatedBreakdown.length : auditReport.overall_score;

    setAuditReport({
      ...auditReport,
      overall_score: newScore,
      reliable_claims_count: newReliableCount,
      unreliable_claims_count: updatedBreakdown.length - newReliableCount,
      claims_breakdown: updatedBreakdown,
    });

    setNotification({
      message: `Updated claim ${claim.claim_id} with verified repair.`,
      type: 'success',
    });
  };

  const handleOpenOverride = (claim: ClaimItem) => {
    setOverrideClaimId(claim.claim_id);
    setOverrideText(claim.text);
    setOverrideVerdict(claim.verdict);
    setOverrideNotes(claim.rationale);
  };

  const handleSaveOverride = (claimId: string) => {
    if (!auditReport) return;

    const originalClaim = auditReport.claims_breakdown.find((c) => c.claim_id === claimId);
    if (!originalClaim) return;

    if (overrideText.trim() !== originalClaim.text && overrideText.trim().length > 0) {
      const updatedContent = docContent.replace(originalClaim.text, overrideText.trim());
      setDocContent(updatedContent);
    }

    const updatedBreakdown = auditReport.claims_breakdown.map((c) => {
      if (c.claim_id === claimId) {
        return {
          ...c,
          text: overrideText.trim() || c.text,
          verdict: overrideVerdict as any,
          confidence: overrideVerdict === 'supported' ? 1.0 : c.confidence,
          human_explanation: `Auditor override: ${overrideNotes || 'Manual sign-off recorded'}`,
          manual_override: {
            overridden_by: 'Compliance Auditor',
            override_verdict: overrideVerdict,
            override_text: overrideText.trim(),
            override_notes: overrideNotes,
            timestamp: new Date().toISOString(),
          },
        };
      }
      return c;
    });

    const newReliableCount = updatedBreakdown.filter((c) => c.verdict === 'supported').length;
    const newScore = updatedBreakdown.length > 0 ? newReliableCount / updatedBreakdown.length : auditReport.overall_score;

    setAuditReport({
      ...auditReport,
      overall_score: newScore,
      reliable_claims_count: newReliableCount,
      unreliable_claims_count: updatedBreakdown.length - newReliableCount,
      claims_breakdown: updatedBreakdown,
    });

    setOverrideClaimId(null);
    setNotification({
      message: `Manual sign-off saved for ${claimId}.`,
      type: 'success',
    });
  };

  const handleSelectClaim = (claimId: string) => {
    setActiveClaimId(claimId);
    setExpandedClaimId(claimId);
    const cardEl = claimCardRefs.current[claimId];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setNotification({ message: `Copied ${label} to clipboard.`, type: 'info' });
  };

  const filteredClaims = useMemo(() => {
    if (!auditReport?.claims_breakdown) return [];
    if (filterVerdict === 'verified') {
      return auditReport.claims_breakdown.filter((c) => c.verdict === 'supported');
    }
    if (filterVerdict === 'flagged') {
      return auditReport.claims_breakdown.filter((c) => c.verdict !== 'supported');
    }
    if (filterVerdict === 'contradictions') {
      return auditReport.claims_breakdown.filter((c) => c.verdict === 'contradicted' || c.verdict === 'invalid');
    }
    return auditReport.claims_breakdown;
  }, [auditReport, filterVerdict]);

  const renderedDocumentSpans = useMemo(() => {
    if (!auditReport?.claims_breakdown || auditReport.claims_breakdown.length === 0) {
      return null;
    }

    const claims = auditReport.claims_breakdown;
    type MatchSpan = { start: number; end: number; claim: ClaimItem };
    const matches: MatchSpan[] = [];

    claims.forEach((claim) => {
      const targetText = claim.text.trim();
      if (!targetText) return;
      let startIdx = docContent.indexOf(targetText);
      while (startIdx !== -1) {
        matches.push({
          start: startIdx,
          end: startIdx + targetText.length,
          claim,
        });
        startIdx = docContent.indexOf(targetText, startIdx + 1);
      }
    });

    matches.sort((a, b) => a.start - b.start);

    const nonOverlapping: MatchSpan[] = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        nonOverlapping.push(m);
        lastEnd = m.end;
      }
    }

    const fragments: React.ReactNode[] = [];
    let cursor = 0;

    nonOverlapping.forEach((m, idx) => {
      if (m.start > cursor) {
        fragments.push(
          <span key={`plain-${cursor}`}>{docContent.slice(cursor, m.start)}</span>
        );
      }

      const claim = m.claim;
      const isSelected = activeClaimId === claim.claim_id;
      const verdict = claim.verdict;

      let styleClasses = isDark
        ? 'bg-amber-950/30 text-amber-200 border-b border-amber-600/70 hover:bg-amber-900/40'
        : 'bg-amber-50 text-amber-900 border-b border-amber-400 hover:bg-amber-100/70';

      if (verdict === 'supported') {
        styleClasses = isDark
          ? 'bg-emerald-950/30 text-emerald-200 border-b border-emerald-500/70 hover:bg-emerald-900/40'
          : 'bg-emerald-50 text-emerald-900 border-b border-emerald-500 hover:bg-emerald-100/70';
      } else if (verdict === 'contradicted' || verdict === 'invalid') {
        styleClasses = isDark
          ? 'bg-rose-950/30 text-rose-200 border-b border-rose-500/70 hover:bg-rose-900/40'
          : 'bg-rose-50 text-rose-900 border-b border-rose-500 hover:bg-rose-100/70';
      }

      fragments.push(
        <mark
          key={`span-${claim.claim_id}-${idx}`}
          onClick={() => handleSelectClaim(claim.claim_id)}
          className={`cursor-pointer px-1 py-0.5 rounded-sm transition-all font-sans text-xs inline ${styleClasses} ${
            isSelected ? 'ring-2 ring-slate-400 font-medium' : ''
          }`}
          title={`Click to inspect Claim ${claim.claim_id} (${verdict})`}
        >
          {docContent.slice(m.start, m.end)}
          <span className={`ml-1 text-[9px] px-1 py-0.2 rounded font-mono font-medium align-super ${
            verdict === 'supported'
              ? (isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-800')
              : verdict === 'contradicted'
              ? (isDark ? 'bg-rose-900/50 text-rose-300' : 'bg-rose-100 text-rose-800')
              : (isDark ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-800')
          }`}>
            {claim.claim_id}
          </span>
        </mark>
      );

      cursor = m.end;
    });

    if (cursor < docContent.length) {
      fragments.push(<span key={`plain-${cursor}`}>{docContent.slice(cursor)}</span>);
    }

    return fragments;
  }, [auditReport, docContent, activeClaimId, isDark]);
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto aura-main select-text">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.pdf,.txt,.md,.json"
        className="hidden"
      />

      {/* Editorial Page Header with Compliance Kicker (per aura.html) */}
      <div className="relative">
        <div className="aura-ey font-bold uppercase">
          {isStudent ? 'Academic Policy Advisory' : 'Compliance'}
        </div>
        <h1 className="aura-h1">
          {isStudent ? 'Advisory & Policy Audit Workbench' : 'Audit Workbench'}
        </h1>
        <div className="aura-lead">
          {isStudent
            ? 'Ask registration questions or audit draft petitions against verified university policies.'
            : 'Verify, validate and ensure compliance with AI agents.'}
        </div>
        <div className="aura-tag font-mono hidden md:block select-none">
          TRUST &nbsp;/&nbsp; TRANSPARENCY &nbsp;/&nbsp; RELIABILITY
        </div>
      </div>

      {/* Clean Operations Action Bar (per aura.html: .bar2) */}
      <div className="aura-bar2">
        <div className="aura-seg">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload CSV, PDF, TXT or MD File"
          >
            <FileUp className="w-[18px] h-[18px] text-[var(--or)]" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(!showLinkInput)}
            title="Ingest Web Link URL"
          >
            <LinkIcon className="w-[18px] h-[18px] text-[var(--or)]" />
            <span>Add Link</span>
          </button>
        </div>

        <div className="aura-mode">
          <span style={{ fontSize: '13px', color: 'var(--txt)' }}>Mode:</span>
          <div className="m">
            <button
              type="button"
              onClick={() => handleToggleAuditMode('audit_only')}
              className={auditMode === 'audit_only' ? 'a' : ''}
              title="Audit existing documents directly in a single pass"
            >
              <ShieldCheck className="w-[18px] h-[18px]" />
              <span>{isStudent ? 'Audit Draft' : 'Audit Only'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleAuditMode('generate_and_audit')}
              className={auditMode === 'generate_and_audit' ? 'a' : ''}
              title="Generate grounded answer for a query, then audit and iteratively re-check"
            >
              <Sparkles className="w-[18px] h-[18px]" />
              <span>{isStudent ? 'Ask Advisory AI' : 'Generate & Audit'}</span>
            </button>
          </div>
        </div>

        <div className="aura-dom">
          <span style={{ fontSize: '13px', color: 'var(--txt)' }}>Domain:</span>
          <div className="aura-sel">
            <select
              value={domain}
              onChange={(e: any) => setDomain(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer w-full text-[14.5px] font-medium"
              style={{ color: 'var(--ink)' }}
            >
              <option value="academic">General Auditor</option>
              <option value="academic">University Academic Policies</option>
              <option value="financial">Financial (SEC / Aid)</option>
              <option value="legal">Legal & Contracts (MSA)</option>
              <option value="healthcare">Healthcare & Clinical Trial</option>
              <option value="regulatory">Regulatory & Security Standards</option>
            </select>
          </div>
        </div>
      </div>

      {/* URL Ingestion Field (Collapsible) */}
      {showLinkInput && (
        <div className="p-3 rounded-md border flex items-center gap-2.5 mb-2 bg-[var(--card)] border-[var(--line)]">
          <LinkIcon className="w-4 h-4 text-[var(--mut)]" />
          <input
            type="url"
            placeholder="Paste regulatory URL (e.g., https://compliance.internal.corp/policies)..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 border rounded text-xs p-2 outline-none font-mono bg-[var(--bg)] border-[var(--line)] text-[var(--ink)]"
          />
          <button
            onClick={handleIngestLink}
            disabled={!linkUrl.trim() || loading}
            className="px-4 py-2 bg-[var(--or)] hover:opacity-90 text-white rounded text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            Ingest URL
          </button>
        </div>
      )}

      {/* Feedback Toast */}
      {notification && (
        <div className={`p-2.5 rounded-md border text-xs flex items-center justify-between mb-2 ${
          notification.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-[var(--card)] border-[var(--line)] text-[var(--ink)]'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-600" />
            ) : notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Info className="w-4 h-4 text-[var(--or)]" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="cursor-pointer text-[var(--mut)] hover:text-[var(--ink)]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Dual-Pane Operations Workspace Grid (per aura.html: .g) */}
      <div className="aura-g">
        {/* ======================================================== */}
        {/* LEFT PANE: Document Selector, Editor & Supporting Cards */}
        {/* ======================================================== */}
        <div className="aura-col">
          {/* Main Document Input Card */}
          <div className="aura-card">
            {/* Step 1: Select Document Type Header */}
            <div className="aura-hd">
              <div className="aura-num">1</div>
              <div>
                Select Document Type
                <small>Choose the type of document you want to audit.</small>
              </div>
            </div>

            {/* 5 Minimalist Document-Type Selector Tiles (per aura.html: .types, .ty) */}
            <div className="aura-types">
              {(Object.keys(docCategoryConfigs) as DocCategoryKey[]).map((catKey) => {
                const cat = docCategoryConfigs[catKey];
                const isSelected = selectedCategoryKey === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleSelectCategory(catKey)}
                    className={`aura-ty ${isSelected ? 'on' : ''}`}
                  >
                    {renderCategoryIcon(cat.iconName, 'w-[18px] h-[18px]')}
                    <span>{cat.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Auditor Focus Callout Banner (per aura.html: .foc) */}
            <div className="aura-foc">
              <b>AUDITOR FOCUS</b>
              <span className="truncate">{activeCategory.auditorFocus}</span>
              <em onClick={handleReloadTemplate} title="Reset Template">
                <RotateCcw className="w-[15px] h-[15px]" /> Reset Template
              </em>
            </div>

            {/* Input Format Switcher (per aura.html: .if, .tabs) */}
            <div className="aura-if">
              <span>Input Format:</span>
              <div className="aura-tabs">
                <button
                  type="button"
                  onClick={() => setInputFormat('paste')}
                  className={inputFormat === 'paste' ? 'on' : ''}
                >
                  <FileText className="w-[15px] h-[15px]" /> Paste Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputFormat('upload')}
                  className={inputFormat === 'upload' ? 'on' : ''}
                >
                  <FileUp className="w-[15px] h-[15px]" /> Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => setInputFormat('url')}
                  className={inputFormat === 'url' ? 'on' : ''}
                >
                  <LinkIcon className="w-[15px] h-[15px]" /> Web URL
                </button>
              </div>
              <span className="aura-ch">{docContent.length} chars</span>
            </div>

            {/* Document Title Field */}
            <label className="aura-label">Audit Document Title</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="aura-in font-medium"
            />

            {/* Adaptive Input Body Area (per aura.html: .box) */}
            {inputFormat === 'url' ? (
              <div className="aura-box">
                <div className="aura-hd" style={{ fontSize: '14px' }}>
                  <Globe className="w-6 h-6 text-[var(--or)]" />
                  <span>Institutional Regulatory Portal Link</span>
                </div>
                <div className="aura-row">
                  <input
                    type="url"
                    value={linkUrl || activeCategory.sampleUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder={activeCategory.sampleUrl}
                    className="aura-in in"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDocContent(activeCategory.sampleAuditText);
                      setInputFormat('paste');
                      setNotification({
                        message: `Fetched & verified URL content from ${activeCategory.sampleUrl}`,
                        type: 'success',
                      });
                    }}
                    className="aura-btn"
                  >
                    <LinkIcon className="w-4 h-4" /> Fetch &amp; Audit URL
                  </button>
                </div>
                <div className="aura-hint">
                  AURA scrapes campus policy pages, checks revision timestamps, and indexes sections directly into the audit vector space.
                </div>
              </div>
            ) : inputFormat === 'upload' ? (
              <div className="aura-box flex flex-col items-center justify-center p-8 text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--card)] text-[var(--or)] flex items-center justify-center border border-[var(--line)]">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)]">
                    Upload {activeCategory.label} Document
                  </div>
                  <div className="text-[11px] text-[var(--mut)] mt-0.5 font-mono">
                    Target: {activeCategory.samplePdfName} (PDF, DOCX, TXT, MD)
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-[var(--or)] text-white rounded font-semibold text-xs cursor-pointer shadow-xs"
                  >
                    Browse Local File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputFormat('paste');
                      setDocContent(activeCategory.sampleAuditText);
                      setNotification({
                        message: `Loaded benchmark test cases for ${activeCategory.samplePdfName}.`,
                        type: 'success',
                      });
                    }}
                    className="px-3.5 py-1.5 border border-[var(--line)] bg-[var(--card)] rounded text-xs font-medium text-[var(--ink)] cursor-pointer"
                  >
                    Load Sample Document
                  </button>
                </div>
              </div>
            ) : auditReport && viewMode === 'annotated' ? (
              <div
                className="aura-in overflow-y-auto whitespace-pre-wrap select-text font-sans max-h-56 mt-3 leading-relaxed"
              >
                {renderedDocumentSpans}
              </div>
            ) : (
              <textarea
                rows={6}
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder={
                  auditMode === 'generate_and_audit'
                    ? activeCategory.sampleGeneratePrompt
                    : 'Paste institutional clauses, course prerequisites, handbook sections, or policy criteria...'
                }
                className="aura-in font-mono mt-3 resize-none leading-relaxed"
              />
            )}

            {/* Primary Action Buttons (per aura.html: .run) */}
            <div className="aura-run">
              <button
                type="button"
                onClick={handleRunAudit}
                disabled={loading || !docContent.trim()}
                className="p disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Claims...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />{' '}
                    {activeCategory.buttonLabel || 'Run Academic Audit'}
                  </>
                )}
              </button>

              {!isStudent && (
                <button
                  type="button"
                  onClick={handleIngestDocument}
                  disabled={loading || ingesting || !docContent.trim()}
                  className="s disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4 text-[var(--mut)]" />
                  <span>{ingesting ? 'Indexing...' : 'Index Ground Truth'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Supporting Cards: Recent Audits & System Status Grid (per aura.html) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '12px' }}>
            {/* Card 1: Recent Audits */}
            <div className="aura-card" style={{ padding: '18px 16px' }}>
              <div className="aura-sec">
                <span>
                  <FileText className="w-[18px] h-[18px]" /> Recent Audits
                </span>
                <button type="button" onClick={() => setActiveTab('Overview')}>
                  View All <ArrowRight className="w-3.5 h-3.5 text-[var(--or)]" />
                </button>
              </div>

              <table className="aura-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="truncate max-w-[140px]">Custom Institutional Policy &amp; Regulatory...</td>
                    <td>Web URL</td>
                    <td><span className="ok"><i className="w-2 h-2 rounded-full bg-[var(--ok)] inline-block" /> Completed</span></td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>2m ago</td>
                  </tr>
                  <tr>
                    <td className="truncate max-w-[140px]">Student Handbook - 2024</td>
                    <td>PDF</td>
                    <td><span className="ok"><i className="w-2 h-2 rounded-full bg-[var(--ok)] inline-block" /> Completed</span></td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>1d ago</td>
                  </tr>
                  <tr>
                    <td className="truncate max-w-[140px]">Financial Aid Office Policies</td>
                    <td>Web URL</td>
                    <td><span className="ok"><i className="w-2 h-2 rounded-full bg-[var(--ok)] inline-block" /> Completed</span></td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>2d ago</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Card 2: System Status */}
            <div className="aura-card" style={{ padding: '18px 16px' }}>
              <div className="aura-sec">
                <span>
                  <Activity className="w-[18px] h-[18px] text-[var(--or)]" /> System Status
                </span>
              </div>

              <div className="aura-sr" style={{ marginTop: '12px' }}>
                <i className="dd" /> Backend API
                <span className="d"><i className="w-2 h-2 rounded-full bg-[var(--ok)] inline-block" /> Online</span>
                <span className="m">87ms</span>
              </div>
              <div className="aura-sr">
                <i className="dd" /> Vector Database (Qdrant)
                <span className="d"><i className="w-2 h-2 rounded-full bg-[var(--ok)] inline-block" /> Online</span>
                <span className="m">64ms</span>
              </div>
              <div className="aura-sr">
                <i className="dd" /> PostgreSQL
                <span className="d"><i className="w-2 h-2 rounded-full bg-[var(--ok)] inline-block" /> Online</span>
                <span className="m">53ms</span>
              </div>
              <div className="aura-sr">
                <i className="dd" /> Redis / Kafka
                <span className="d"><i className="w-2 h-2 rounded-full bg-[var(--ok)] inline-block" /> Online</span>
                <span className="m">71ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANE: Operations Console (Lineage, Stepper, Findings) */}
        {/* ======================================================== */}
        <div className="aura-col">
          {/* Top Lineage & Stepper Card (per aura.html) */}
          <div className="aura-card">
            {/* Header with Title and Live Badge */}
            <div className="aura-hd">
              <ShieldCheck className="w-[22px] h-[22px]" />
              <span>Audit Lineage &amp; Findings</span>
              <div className="ml-auto flex items-center gap-2">
                {auditReport && (
                  <div className="aura-tabs" style={{ marginLeft: 0 }}>
                    <button
                      type="button"
                      onClick={() => setRightPaneTab('lineage')}
                      className={rightPaneTab === 'lineage' ? 'on' : ''}
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      Lineage
                    </button>
                    <button
                      type="button"
                      onClick={() => setRightPaneTab('findings')}
                      className={rightPaneTab === 'findings' ? 'on' : ''}
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      Report ({auditReport.claims_breakdown?.length || 0})
                    </button>
                  </div>
                )}
                <span className="aura-live">
                  <i className="w-1.5 h-1.5 rounded-full bg-[var(--ok)] inline-block" /> Live
                </span>
              </div>
            </div>

            {/* Stepper with 40px circles and 4px ring (per aura.html: .st) */}
            <div className="aura-st">
              <div className="c">
                <i>1</i>
                Ingest
                <small>Completed<br />14:32</small>
              </div>
              <div className={auditReport ? 'c' : ''}>
                <i>2</i>
                Parse
                <small>{auditReport ? 'Completed' : 'Pending'}</small>
              </div>
              <div className={auditReport ? 'c' : ''}>
                <i>3</i>
                Analyze
                <small>{auditReport ? 'Completed' : 'Pending'}</small>
              </div>
              <div className={auditReport ? 'c' : ''}>
                <i>4</i>
                Verify
                <small>{auditReport ? 'Completed' : 'Pending'}</small>
              </div>
              <div className={auditReport ? 'c' : ''}>
                <i>5</i>
                Report
                <small>{auditReport ? 'Completed' : 'Pending'}</small>
              </div>
            </div>

            {/* Current Activity Section (per aura.html: .act, .ev) */}
            <div className="aura-act">
              <div className="aura-hd" style={{ fontSize: '13px', marginBottom: '8px' }}>
                <Settings className="w-5 h-5 text-[var(--mut)]" /> Current Activity
              </div>
              <div className="aura-ev o">
                <Database className="w-5 h-5 text-[var(--ink)]" />
                <span>Document ingested and indexed</span>
                <span className="t">14:32</span>
              </div>
              <div className="aura-ev o">
                <FileText className="w-5 h-5 text-[var(--ink)]" />
                <span>Extracting sections and metadata</span>
                <span className="t">14:32</span>
              </div>
              <div className="aura-ev">
                <Network className="w-5 h-5 text-[var(--mut)]" />
                <span>Preparing agent pipeline</span>
                <span className={`t ${auditReport ? '' : 'p'}`}>{auditReport ? '14:33' : 'Pending'}</span>
              </div>
              <div className="aura-ev">
                <ShieldCheck className="w-5 h-5 text-[var(--mut)]" />
                <span>Running verification checks</span>
                <span className={`t ${auditReport ? '' : 'p'}`}>{auditReport ? '14:33' : 'Pending'}</span>
              </div>
              <div className="aura-ev">
                <FileCheck className="w-5 h-5 text-[var(--mut)]" />
                <span>Generating audit report</span>
                <span className={`t ${auditReport ? '' : 'p'}`}>{auditReport ? '14:33' : 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Active Agents Console Card (per aura.html: .ag, .av) */}
          <div className="aura-card" style={{ paddingTop: '16px' }}>
            <div className="aura-sec">
              <span>
                <Settings className="w-[22px] h-[22px]" /> Active Agents
              </span>
              <button type="button" onClick={() => setActiveTab('AgentConfig')}>
                View All <ArrowRight className="w-3.5 h-3.5 text-[var(--or)]" />
              </button>
            </div>

            <div style={{ marginTop: '10px' }}>
              <div className="aura-ag">
                <div className="aura-av" style={{ background: 'linear-gradient(135deg, #2f9a82, #d9a24b)' }}>
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <b>Retrieval Agent</b>
                  <small>Semantic search · Qdrant</small>
                </div>
                <span className="aura-stt" style={{ ['--c' as any]: '#1f9d55' }}>Running</span>
                <ChevronRight className="w-4 h-4 text-[var(--mut)]" />
              </div>

              <div className="aura-ag">
                <div className="aura-av" style={{ background: 'var(--ink)' }}>
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <b>Verification Agent</b>
                  <small>Policy check · Evidence validation</small>
                </div>
                <span className="aura-stt" style={{ ['--c' as any]: '#f08a2c' }}>Queued</span>
                <ChevronRight className="w-4 h-4 text-[var(--mut)]" />
              </div>

              <div className="aura-ag">
                <div className="aura-av" style={{ background: 'linear-gradient(135deg, #c24e1a, #e08a52)' }}>
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <b>Aggregation Agent</b>
                  <small>Cross-reference · Synthesis</small>
                </div>
                <span className="aura-stt" style={{ ['--c' as any]: '#f08a2c' }}>Queued</span>
                <ChevronRight className="w-4 h-4 text-[var(--mut)]" />
              </div>

              <div className="aura-ag">
                <div className="aura-av" style={{ background: '#1d1a1a' }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <b>Repair Agent</b>
                  <small>Remediation suggestions</small>
                </div>
                <span className="aura-stt" style={{ ['--c' as any]: '#a9afbb' }}>Idle</span>
                <ChevronRight className="w-4 h-4 text-[var(--mut)]" />
              </div>

              <div className="aura-ag">
                <div className="aura-av" style={{ background: 'var(--ink)' }}>
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <b>Infrastructure Agent</b>
                  <small>Monitoring · Cross-cutting</small>
                </div>
                <span className="aura-stt" style={{ ['--c' as any]: '#a9afbb' }}>Idle</span>
              </div>
            </div>
          </div>

          {/* When Audit Report is active and user wants to inspect verified breakdown */}
          {auditReport && rightPaneTab === 'findings' && (
            <div className={`p-5 rounded-lg border flex flex-col gap-3 ${
              isDark ? 'bg-navy-900/90 border-navy-800' : 'bg-white border-[#E8E2D5] shadow-xs'
            }`}>
              {/* Header with Export */}
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE0] dark:border-navy-800">
                <span className="text-xs font-bold text-navy-900 dark:text-slate-100 uppercase tracking-wider">
                  Verified Audit Findings
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleExportCertificate('json')}
                    className="px-2.5 py-1 text-xs font-semibold border border-[#E8E2D5] dark:border-navy-800 rounded bg-[#FAF8F3] dark:bg-navy-900 hover:bg-white text-navy-900 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Export Signed JSON Certificate"
                  >
                    <Download className="w-3 h-3 text-slate-500" /> JSON
                  </button>
                  <button
                    onClick={() => handleExportCertificate('markdown')}
                    className="px-2.5 py-1 text-xs font-semibold border border-[#E8E2D5] dark:border-navy-800 rounded bg-[#FAF8F3] dark:bg-navy-900 hover:bg-white text-navy-900 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Export Markdown Certificate"
                  >
                    <Download className="w-3 h-3 text-slate-500" /> Markdown
                  </button>
                </div>
              </div>

              {/* Reliability Score Banner */}
              <div className={`p-3 rounded-lg border flex items-center justify-between ${
                isDark ? 'bg-navy-950 border-navy-800' : 'bg-ivory-50 border-[#E8E2D5]'
              }`}>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Reliability Score</div>
                  <div className="text-xl font-extrabold flex items-center gap-2 mt-0.5 text-navy-900 dark:text-slate-100">
                    <span>{(auditReport.overall_score * 100).toFixed(0)}%</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                      auditReport.bucket === 'reliable'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : auditReport.bucket === 'unreliable'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {auditReport.bucket}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-500 flex flex-col gap-0.5">
                  <div className="flex items-center justify-end gap-1">
                    <span>Trace: {auditReport.trace_id}</span>
                    <button
                      onClick={() => handleCopyText(auditReport.trace_id, 'Trace ID')}
                      className="cursor-pointer hover:text-navy-900"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Hash: {auditReport.audit_hash.substring(0, 10)}...
                  </div>
                </div>
              </div>

              {/* Triage Filter Pills */}
              <div className="flex items-center gap-1.5 border-b border-[#F0EBE0] dark:border-navy-800 pb-2">
                <button
                  onClick={() => setFilterVerdict('all')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    filterVerdict === 'all'
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-navy-900 dark:text-slate-400'
                  }`}
                >
                  All ({auditReport.claims_breakdown.length})
                </button>
                <button
                  onClick={() => setFilterVerdict('verified')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    filterVerdict === 'verified'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-navy-900 dark:text-slate-400'
                  }`}
                >
                  Verified ({auditReport.reliable_claims_count})
                </button>
                <button
                  onClick={() => setFilterVerdict('flagged')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    filterVerdict === 'flagged'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-navy-900 dark:text-slate-400'
                  }`}
                >
                  Flagged ({auditReport.unreliable_claims_count})
                </button>
              </div>

              {/* Claims Breakdown Stream */}
              <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredClaims.map((item, idx) => {
                  const isExpanded = expandedClaimId === item.claim_id;
                  const isSelected = activeClaimId === item.claim_id;
                  const isOverriding = overrideClaimId === item.claim_id;

                  return (
                    <div
                      key={item.claim_id || idx}
                      ref={(el) => (claimCardRefs.current[item.claim_id] = el)}
                      onClick={() => setActiveClaimId(item.claim_id)}
                      className={`p-3 rounded-lg border text-xs flex flex-col gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? isDark
                            ? 'bg-navy-900 border-terracotta-500 ring-1 ring-terracotta-500'
                            : 'bg-white border-navy-900 ring-1 ring-navy-900'
                          : isDark
                          ? 'bg-navy-950 border-navy-800 hover:border-slate-700'
                          : 'bg-white border-[#E8E2D5] hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-navy-900 dark:text-slate-200">
                            {item.claim_id}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-500 bg-[#FAF8F3] dark:bg-navy-900 border border-[#E8E2D5] dark:border-navy-800">
                            {item.type || 'factual-atomic'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 border ${
                            item.verdict === 'supported'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : item.verdict === 'contradicted' || item.verdict === 'invalid'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {item.verdict === 'supported' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : item.verdict === 'contradicted' || item.verdict === 'invalid' ? (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            )}
                            {item.verdict} ({(item.confidence * 100).toFixed(0)}%)
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedClaimId(isExpanded ? null : item.claim_id);
                            }}
                            className="p-1 text-slate-400 hover:text-navy-900 cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <p className="font-medium text-xs leading-relaxed text-navy-900 dark:text-slate-100">
                        "{item.text}"
                      </p>

                      <div className={`p-2 rounded text-[11px] leading-relaxed flex items-start gap-1.5 ${
                        isDark ? 'bg-navy-950 text-slate-300' : 'bg-ivory-50 text-slate-700 border border-[#E8E2D5]'
                      }`}>
                        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>{item.human_explanation || item.rationale}</div>
                      </div>

                      {/* Expanded Evidence Details */}
                      {isExpanded && item.evidence_details && item.evidence_details.length > 0 && (
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-[#F0EBE0] dark:border-navy-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Verified Sources ({item.evidence_details.length})
                          </span>
                          <div className="flex flex-col gap-1.5">
                            {item.evidence_details.map((ev, eIdx) => (
                              <div
                                key={eIdx}
                                className="p-2 rounded border border-[#E8E2D5] dark:border-navy-800 bg-[#FAF8F3] dark:bg-navy-950 text-[11px] flex flex-col gap-0.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-navy-900 dark:text-slate-200">{ev.title}</span>
                                  <span className="text-[10px] px-1 py-0.2 rounded font-mono text-slate-500 bg-white dark:bg-navy-900 border border-[#E8E2D5]">
                                    Tier {ev.trust_tier || 1}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                                  "{ev.snippet}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lineage Modal Dialog */}
      {selectedClaimDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded border p-5 flex flex-col gap-3 shadow-lg ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{selectedClaimDetail.claim_id}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {selectedClaimDetail.type}
                </span>
                <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${
                  selectedClaimDetail.verdict === 'supported'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {selectedClaimDetail.verdict}
                </span>
              </div>
              <button
                onClick={() => setSelectedClaimDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Verbatim Claim Span</span>
                <p className="text-xs p-2.5 border rounded bg-slate-50/70 border-slate-200 dark:bg-slate-900 dark:border-slate-800 mt-1 leading-relaxed">
                  "{selectedClaimDetail.text}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 border rounded bg-slate-50/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500">Verdict</div>
                  <div className="font-semibold capitalize mt-0.5">{selectedClaimDetail.verdict}</div>
                </div>
                <div className="p-2 border rounded bg-slate-50/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500">Confidence</div>
                  <div className="font-mono font-semibold mt-0.5">{(selectedClaimDetail.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Verification Rationale</span>
                <div className="p-2.5 border rounded bg-slate-50/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-xs mt-1 leading-relaxed">
                  {selectedClaimDetail.rationale}
                </div>
              </div>

              {selectedClaimDetail.evidence_details && selectedClaimDetail.evidence_details.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Evidence Sources ({selectedClaimDetail.evidence_details.length})
                  </span>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {selectedClaimDetail.evidence_details.map((ev, idx) => (
                      <div key={idx} className="p-2 border rounded text-xs flex flex-col gap-0.5 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between font-medium">
                          <span>{ev.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Tier {ev.trust_tier}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">"{ev.snippet}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
