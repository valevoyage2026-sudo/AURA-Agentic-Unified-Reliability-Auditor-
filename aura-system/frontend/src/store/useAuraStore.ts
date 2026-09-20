import { useSyncExternalStore } from 'react';
import {
  AgentId,
  AgentInfo,
  AgentEvent,
  MessagePulse,
  SystemMetrics,
  AuditArtifact,
  ExecutionFlowStep,
  EvidenceSource,
  KeyClaimItem,
  ThemeMode,
} from '../types/verification';

import { playSound, setSoundEnabled } from '../services/soundEffects';

export interface AuraStoreState {
  theme: ThemeMode;
  mission: {
    title: string;
    description: string;
    elapsedTime: string;
    progress: number;
    status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'IDLE';
  };
  backendStatus: 'Online' | 'Offline' | 'Checking...';
  activeAgentsCount: number;
  totalAgentsCount: number;
  issuesCount: number;
  evidenceCount: number;
  claimsCount: number;
  totalTokens: string;
  avgLatency: string;
  selectedAgentId: AgentId;
  agents: Record<AgentId, AgentInfo>;
  events: AgentEvent[];
  pulses: MessagePulse[];
  systemMetrics: SystemMetrics;
  artifacts: AuditArtifact[];
  executionFlow: ExecutionFlowStep[];
  sources: EvidenceSource[];
  keyClaims: KeyClaimItem[];
  activeTab: 'Overview' | 'Executions' | 'Agents' | 'Evidence' | 'Artifacts' | 'Logs';
  adapterMode: 'simulation' | 'real';
  simulationStatus: 'idle' | 'running' | 'paused' | 'completed';
  isLeftSidebarOpen: boolean;
  isRightInspectorOpen: boolean;
  soundMuted: boolean;
}

const initialAgents: Record<AgentId, AgentInfo> = {
  orchestrator: {
    id: 'orchestrator',
    name: 'Orchestrator',
    role: 'Routing • Planning',
    status: 'active',
    currentTask: 'Find latest salary increase trends for tech roles (2022-2025) and cross-check with multiple sources.',
    currentOperation: 'Coordinating workflow graph across sub-agents',
    progress: 72,
    progressDetail: 'Routing active sub-tasks',
    input: 'User payload: "Analyze salary increase trends for tech roles (2022-2025)"',
    output: 'Routing matrix & execution graph active',
    confidence: 94,
    tokens: 4210,
    latencyMs: 340,
    model: 'gemini-1.5-pro',
    elapsedTime: '00:04:32',
    recentActivity: [
      { timestamp: '21:04:31', text: 'Pipeline initialized' },
      { timestamp: '21:04:32', text: 'Dispatched query to Planner' },
      { timestamp: '21:04:34', text: 'Assigned retrieval to Researcher' },
    ],
  },
  planner: {
    id: 'planner',
    name: 'Planner',
    role: 'Create plan',
    status: 'active',
    currentTask: 'Decomposing input text into factual-atomic & compound claims with character spans.',
    currentOperation: 'Claim extraction & dependency mapping',
    progress: 100,
    progressDetail: 'Extracted 8 atomic claims',
    input: 'Raw prompt text span',
    output: '8 Claim objects (IDs: claim_c1, claim_c2...)',
    confidence: 90,
    tokens: 1850,
    latencyMs: 210,
    model: 'qwen3.5:9b',
    recentActivity: [
      { timestamp: '21:04:32', text: 'Decomposed 8 claims' },
      { timestamp: '21:04:34', text: 'Mapped causal dependencies' },
    ],
  },
  searcher: {
    id: 'searcher',
    name: 'Searcher',
    role: 'Query knowledge graph',
    status: 'active',
    currentTask: 'Executing Qdrant vector search and Neo4j graph traversal for entity relationships.',
    currentOperation: 'Searching vector collection & graph nodes',
    progress: 80,
    progressDetail: '12 vector passages fetched',
    input: 'Vector embedding query (768-dim)',
    output: '12 documents • 4 entities • 3 claims',
    confidence: 85,
    tokens: 2100,
    latencyMs: 95,
    model: 'qwen3.5:9b',
    recentActivity: [
      { timestamp: '21:04:32', text: 'Queried 5 new sources' },
      { timestamp: '21:04:33', text: 'Found 12 evidence passages' },
    ],
  },
  researcher: {
    id: 'researcher',
    name: 'Researcher',
    role: 'Find sources & data',
    status: 'active',
    currentTask: 'Find latest salary increase trends for tech roles (2022-2025) and cross-check with multiple sources.',
    currentOperation: 'Searching web & knowledge graph',
    progress: 72,
    progressDetail: 'Found 12 sources • 8 relevant',
    input: 'From Orchestrator: "Analyze salary increase trends for tech roles (2022-2025)"',
    output: '12 documents • 4 entities • 3 claims',
    confidence: 87,
    tokens: 3821,
    latencyMs: 1400,
    model: 'qwen3.5:9b',
    recentActivity: [
      { timestamp: '21:04:32', text: 'Queried 5 new sources' },
      { timestamp: '21:04:34', text: 'Extracted 8 claims' },
      { timestamp: '21:04:37', text: 'Sent data to Analyst' },
      { timestamp: '21:04:41', text: 'Found 2 additional sources' },
    ],
  },
  verifier: {
    id: 'verifier',
    name: 'Verifier',
    role: 'Check claims & evidence',
    status: 'conflict',
    currentTask: 'Cross-checking claims against retrieved vector passages and citation entailment.',
    currentOperation: 'Evaluating passage entailment & trust tiers',
    progress: 45,
    progressDetail: 'Evaluating claim 3 of 8 (Conflict detected on C2)',
    input: 'Claim text vs. Evidence passages',
    output: 'Conflict detected (C2): Resolving via trust tiers',
    confidence: 76,
    tokens: 2940,
    latencyMs: 450,
    model: 'gemini-1.5-pro',
    recentActivity: [
      { timestamp: '21:04:36', text: 'Checking claims against evidence' },
      { timestamp: '21:04:38', text: 'Conflict detected on Claim C2' },
      { timestamp: '21:04:42', text: 'Applying trust-tier reweighting' },
    ],
  },
  analyst: {
    id: 'analyst',
    name: 'Analyst',
    role: 'Process & extract claims',
    status: 'active',
    currentTask: 'Detecting internal contradictions between claims and Neo4j graph entity relationships.',
    currentOperation: 'Graph path analysis & temporal sanity checks',
    progress: 60,
    progressDetail: 'Analyzing causal chains',
    input: 'Claims & Neo4j graph edges',
    output: '1 potential numeric discrepancy flagged',
    confidence: 88,
    tokens: 1650,
    latencyMs: 180,
    model: 'qwen3.5:9b',
    recentActivity: [
      { timestamp: '21:04:34', text: 'Extracted 8 claims' },
      { timestamp: '21:04:37', text: 'Sent data to Verifier' },
    ],
  },
  evaluator: {
    id: 'evaluator',
    name: 'Evaluator',
    role: 'Scoring reliability',
    status: 'idle',
    currentTask: 'Aggregating verification verdicts according to deterministic precedence rules.',
    currentOperation: 'Awaiting Verifier & Analyst resolution',
    progress: 20,
    progressDetail: 'Pending input stream',
    input: 'VerificationResult list',
    output: 'ReliabilityReport (Score: 0.88 - RELIABLE)',
    confidence: 88,
    tokens: 920,
    latencyMs: 86,
    model: 'gemini-1.5-pro',
    recentActivity: [
      { timestamp: '21:04:40', text: 'Standing by for final score calculation' },
    ],
  },
  writer: {
    id: 'writer',
    name: 'Writer',
    role: 'Generate report',
    status: 'waiting',
    currentTask: 'Refining unsupported claims and synthesizing final audited response with visible caveats.',
    currentOperation: 'Constructing final markdown report',
    progress: 0,
    progressDetail: 'Waiting for Evaluator clearance',
    input: 'Refined claims & audit annotations',
    output: 'Pending final output synthesis',
    confidence: 0,
    tokens: 0,
    latencyMs: 0,
    model: 'gemini-1.5-pro',
    recentActivity: [
      { timestamp: '21:04:48', text: 'Synthesis queued' },
    ],
  },
};

const initialEvents: AgentEvent[] = [
  {
    id: 'evt-1',
    timestamp: '21:04:31',
    sourceAgentId: 'orchestrator',
    targetAgentId: 'researcher',
    type: 'agent_activated',
    message: 'Researcher started (Find salary trend sources)',
  },
  {
    id: 'evt-2',
    timestamp: '21:04:32',
    sourceAgentId: 'researcher',
    targetAgentId: 'searcher',
    type: 'processing_update',
    message: 'Searcher queried knowledge graph (12 sources found)',
  },
  {
    id: 'evt-3',
    timestamp: '21:04:34',
    sourceAgentId: 'orchestrator',
    targetAgentId: 'analyst',
    type: 'agent_activated',
    message: 'Analyst activated (Extracted 8 claims)',
  },
  {
    id: 'evt-4',
    timestamp: '21:04:36',
    sourceAgentId: 'orchestrator',
    targetAgentId: 'verifier',
    type: 'conflict_detected',
    message: 'Verifier checking claims (Conflict detected C2)',
  },
  {
    id: 'evt-5',
    timestamp: '21:04:41',
    sourceAgentId: 'orchestrator',
    targetAgentId: 'researcher',
    type: 'processing_update',
    message: 'Secondary researcher spawned (Need more evidence)',
  },
  {
    id: 'evt-6',
    timestamp: '21:04:45',
    sourceAgentId: 'verifier',
    targetAgentId: 'analyst',
    type: 'conflict_resolved',
    message: 'Conflict resolved (Evidence verified)',
  },
  {
    id: 'evt-7',
    timestamp: '21:04:48',
    sourceAgentId: 'orchestrator',
    targetAgentId: 'writer',
    type: 'processing_update',
    message: 'Synthesis initiated (Generating report)',
  },
];

const initialSources: EvidenceSource[] = [
  { id: 1, domain: 'techcrunch.com', title: 'Salary trends in tech (2024)', trustTier: 'High' },
  { id: 2, domain: 'linkedin.com', title: 'Hiring trends and compensation', trustTier: 'High' },
  { id: 3, domain: 'glassdoor.com', title: 'Salary reports (2022-2025)', trustTier: 'Medium' },
  { id: 4, domain: 'bloomberg.com', title: 'Tech industry outlook', trustTier: 'Medium' },
  { id: 5, domain: 'forbes.com', title: 'AI/ML salary growth', trustTier: 'Low' },
];

const initialKeyClaims: KeyClaimItem[] = [
  { id: 'C1', text: 'Salary growth in tech roles ~ 12-18% (2022-2025)' },
  { id: 'C2', text: 'Increased demand for AI/ML engineers' },
  { id: 'C3', text: 'Remote work has impacted compensation' },
];

const initialArtifacts: AuditArtifact[] = [
  { id: 'art-1', name: 'research_summary.md', type: 'markdown', size: '2.4 KB', updatedAt: '2m ago' },
  { id: 'art-2', name: 'data_sources.json', type: 'json', size: '18 KB', updatedAt: '3m ago' },
  { id: 'art-3', name: 'salary_trends_graph.png', type: 'image', size: '542 KB', updatedAt: '4m ago' },
  { id: 'art-4', name: 'final_report.md', type: 'markdown', size: '12 KB', updatedAt: '5m ago' },
];

const initialExecutionFlow: ExecutionFlowStep[] = [
  { agentId: 'researcher', name: 'Researcher', statusText: 'Find salary trend sources', durationText: '21:04:31', status: 'completed' },
  { agentId: 'searcher', name: 'Searcher', statusText: '12 sources found', durationText: '21:04:32', status: 'completed' },
  { agentId: 'analyst', name: 'Analyst', statusText: 'Extracted 8 claims', durationText: '21:04:34', status: 'completed' },
  { agentId: 'verifier', name: 'Verifier', statusText: 'Conflict detected (C2)', durationText: '21:04:36', status: 'conflict' },
  { agentId: 'researcher', name: 'Researcher', statusText: 'Need more evidence', durationText: '21:04:41', status: 'active' },
  { agentId: 'verifier', name: 'Verifier', statusText: 'Evidence verified', durationText: '21:04:45', status: 'active' },
  { agentId: 'writer', name: 'Writer', statusText: 'Generating report', durationText: '21:04:48', status: 'waiting' },
];

let state: AuraStoreState = {
  theme: 'dark',
  mission: {
    title: 'Analyze Salary Increase Trends',
    description: 'Cross-check data, verify sources, find insights',
    elapsedTime: '00:04:32',
    progress: 72,
    status: 'RUNNING',
  },
  backendStatus: 'Online',
  activeAgentsCount: 7,
  totalAgentsCount: 8,
  issuesCount: 1,
  evidenceCount: 12,
  claimsCount: 8,
  totalTokens: '12.4k',
  avgLatency: '86ms',
  selectedAgentId: 'researcher',
  agents: initialAgents,
  events: initialEvents,
  pulses: [],
  systemMetrics: {
    cpu: 42,
    memory: 68,
    gpu: 31,
    disk: 12,
  },
  artifacts: initialArtifacts,
  executionFlow: initialExecutionFlow,
  sources: initialSources,
  keyClaims: initialKeyClaims,
  activeTab: 'Overview',
  adapterMode: 'simulation',
  simulationStatus: 'idle',
  isLeftSidebarOpen: true,
  isRightInspectorOpen: true,
  soundMuted: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const auraStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  setState: (partial: Partial<AuraStoreState> | ((prev: AuraStoreState) => Partial<AuraStoreState>)) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
    notify();
  },
  toggleTheme: () => {
    playSound('toggle');
    state = { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    notify();
  },
  toggleLeftSidebar: () => {
    playSound('toggle');
    state = { ...state, isLeftSidebarOpen: !state.isLeftSidebarOpen };
    notify();
  },
  toggleRightInspector: () => {
    playSound('toggle');
    state = { ...state, isRightInspectorOpen: !state.isRightInspectorOpen };
    notify();
  },
  toggleSound: () => {
    const nextMuted = !state.soundMuted;
    setSoundEnabled(!nextMuted);
    if (!nextMuted) playSound('toggle');
    state = { ...state, soundMuted: nextMuted };
    notify();
  },
  selectAgent: (agentId: AgentId) => {
    playSound('nodeSelect');
    state = { ...state, selectedAgentId: agentId };
    notify();
  },
  setActiveTab: (tab: AuraStoreState['activeTab']) => {
    playSound('toggle');
    state = { ...state, activeTab: tab };
    notify();
  },
  addEvent: (event: AgentEvent) => {
    if (event.type === 'conflict_detected') {
      playSound('conflict');
    } else {
      playSound('eventPulse');
    }
    state = {
      ...state,
      events: [event, ...state.events].slice(0, 50),
    };
    notify();
  },
  addPulse: (pulse: MessagePulse) => {
    state = {
      ...state,
      pulses: [...state.pulses, pulse].slice(-20),
    };
    notify();
  },
  clearPulses: () => {
    state = { ...state, pulses: [] };
    notify();
  },
  updateAgent: (agentId: AgentId, update: Partial<AgentInfo>) => {
    state = {
      ...state,
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          ...update,
        },
      },
    };
    notify();
  },
  setBackendStatus: (status: 'Online' | 'Offline' | 'Checking...') => {
    state = { ...state, backendStatus: status };
    notify();
  },
  setSimulationStatus: (status: AuraStoreState['simulationStatus']) => {
    if (status === 'running') playSound('simStart');
    if (status === 'completed') playSound('complete');
    state = {
      ...state,
      simulationStatus: status,
      mission: {
        ...state.mission,
        status: status === 'running' ? 'RUNNING' : status === 'paused' ? 'PAUSED' : status === 'completed' ? 'COMPLETED' : 'IDLE',
      },
    };
    notify();
  },
  resetSimulation: () => {
    state = {
      ...state,
      simulationStatus: 'idle',
      mission: {
        ...state.mission,
        elapsedTime: '00:00:00',
        progress: 0,
        status: 'IDLE',
      },
      agents: Object.keys(initialAgents).reduce((acc, key) => {
        const id = key as AgentId;
        acc[id] = {
          ...initialAgents[id],
          status: id === 'orchestrator' ? 'active' : 'idle',
          progress: id === 'orchestrator' ? 10 : 0,
        };
        return acc;
      }, {} as Record<AgentId, AgentInfo>),
      events: [],
      pulses: [],
      executionFlow: [],
    };
    notify();
  },
};

export function useAuraStore<T>(selector: (s: AuraStoreState) => T): T {
  return useSyncExternalStore(
    auraStore.subscribe,
    () => selector(auraStore.getState()),
    () => selector(auraStore.getState())
  );
}
