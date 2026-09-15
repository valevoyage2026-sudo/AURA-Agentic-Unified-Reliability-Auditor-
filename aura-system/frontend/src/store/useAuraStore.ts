import { useSyncExternalStore } from 'react';
import {
  AgentId,
  AgentInfo,
  AgentEvent,
  MessagePulse,
  SystemMetrics,
  AuditArtifact,
  ExecutionFlowStep,
} from '../types/verification';

export interface AuraStoreState {
  mission: {
    title: string;
    description: string;
    elapsedTime: string;
    status: 'EXECUTION IN PROGRESS' | 'IDLE' | 'COMPLETED' | 'FAILED';
  };
  backendStatus: 'Online' | 'Offline' | 'Checking...';
  activeAgentsCount: number;
  totalAgentsCount: number;
  totalTokens: string;
  avgLatency: string;
  selectedAgentId: AgentId;
  agents: Record<AgentId, AgentInfo>;
  events: AgentEvent[];
  pulses: MessagePulse[];
  systemMetrics: SystemMetrics;
  artifacts: AuditArtifact[];
  executionFlow: ExecutionFlowStep[];
  activeTab: 'Overview' | 'Agents' | 'Artifacts';
  adapterMode: 'simulation' | 'real';
}

const initialAgents: Record<AgentId, AgentInfo> = {
  orchestrator: {
    id: 'orchestrator',
    name: 'ORCHESTRATOR',
    role: 'Coordinating flow',
    status: 'active',
    currentTask: 'Coordinating overall verification and claim assignment flow across sub-agents.',
    currentOperation: 'Dispatching claims to Researcher & Verifier',
    progress: 85,
    progressDetail: 'Assigning sub-tasks',
    input: 'User payload: "Analyze salary increase trends for tech roles (2022-2025)"',
    output: 'Routing matrix & execution graph active',
    confidence: 94,
    tokens: 4210,
    latencyMs: 340,
    model: 'gemini-1.5-pro',
    elapsedTime: '00:04:32',
  },
  planner: {
    id: 'planner',
    name: 'PLANNER',
    role: 'Planning next steps',
    status: 'active',
    currentTask: 'Decomposing response text into factual-atomic & compound claims with character spans.',
    currentOperation: 'Claim extraction & dependency mapping',
    progress: 100,
    progressDetail: 'Extracted 5 atomic claims',
    input: 'Raw text span (len 1,420 chars)',
    output: '5 Claim objects (IDs: claim_a1b2, claim_c3d4...)',
    confidence: 90,
    tokens: 1850,
    latencyMs: 210,
    model: 'qwen3.5:9b',
  },
  searcher: {
    id: 'searcher',
    name: 'SEARCHER',
    role: 'Exploring sources',
    status: 'processing',
    currentTask: 'Executing Qdrant vector similarity search across indexed document corpora.',
    currentOperation: 'Querying vector collection on port 6333',
    progress: 60,
    progressDetail: 'Fetched 14 vector passages',
    input: 'Vector embedding query (768-dim)',
    output: 'Top 14 passages (cos sim > 0.78)',
    confidence: 82,
    tokens: 2100,
    latencyMs: 95,
    model: 'qwen3.5:9b',
  },
  researcher: {
    id: 'researcher',
    name: 'RESEARCHER',
    role: 'Gathering information',
    status: 'active',
    currentTask: 'Find latest salary increase trends for tech roles (2022-2025) and cross-check with multiple sources.',
    currentOperation: 'Searching web & knowledge graph',
    progress: 72,
    progressDetail: 'Found 12 sources • 8 relevant',
    input: 'From: Orchestrator\n"Analyze salary increase trends for tech roles (2022-2025)"',
    output: '12 documents • 4 entities • 3 claims',
    confidence: 87,
    tokens: 3821,
    latencyMs: 1400,
    model: 'qwen3.5:9b',
  },
  verifier: {
    id: 'verifier',
    name: 'VERIFIER',
    role: 'Validating claims',
    status: 'active',
    currentTask: 'Cross-checking extracted claims against retrieved vector passages and citation entailment.',
    currentOperation: 'Evaluating passage entailment & trust tiers',
    progress: 45,
    progressDetail: 'Evaluating claim 2 of 5',
    input: 'Claim text vs. Evidence passages',
    output: 'Verdict: supported (conf: 0.91)',
    confidence: 91,
    tokens: 2940,
    latencyMs: 450,
    model: 'gemini-1.5-pro',
  },
  analyst: {
    id: 'analyst',
    name: 'ANALYST',
    role: 'Processing data',
    status: 'processing',
    currentTask: 'Detecting internal contradictions between claims and Neo4j graph entity relationships.',
    currentOperation: 'Graph path analysis & temporal sanity checks',
    progress: 50,
    progressDetail: 'Checking temporal consistency',
    input: 'Claims & Neo4j graph edges',
    output: '0 hard contradictions detected',
    confidence: 88,
    tokens: 1650,
    latencyMs: 180,
    model: 'qwen3.5:9b',
  },
  evaluator: {
    id: 'evaluator',
    name: 'EVALUATOR',
    role: 'Scoring reliability',
    status: 'waiting',
    currentTask: 'Aggregating verification verdicts according to precedence rules (invalid > contradiction > score).',
    currentOperation: 'Waiting for Verifier & Analyst results',
    progress: 10,
    progressDetail: 'Pending input stream',
    input: 'VerificationResult list',
    output: 'ReliabilityReport stub (score: 0.86)',
    confidence: 86,
    tokens: 920,
    latencyMs: 86,
    model: 'gemini-1.5-pro',
  },
  writer: {
    id: 'writer',
    name: 'WRITER',
    role: 'Generating report',
    status: 'waiting',
    currentTask: 'Refining unsupported claims and synthesizing final audited response with visible caveats.',
    currentOperation: 'Constructing final markdown response',
    progress: 0,
    progressDetail: 'Waiting for Evaluator clearance',
    input: 'Refined claims & audit annotations',
    output: 'Pending final output stream',
    confidence: 0,
    tokens: 0,
    latencyMs: 0,
    model: 'gemini-1.5-pro',
  },
};

const initialEvents: AgentEvent[] = [
  {
    id: 'evt-1',
    timestamp: '21:04:31',
    sourceAgentId: 'orchestrator',
    targetAgentId: 'researcher',
    type: 'agent_activated',
    message: 'Researcher awakened',
  },
  {
    id: 'evt-2',
    timestamp: '21:04:32',
    sourceAgentId: 'researcher',
    targetAgentId: 'searcher',
    type: 'processing_update',
    message: 'Querying knowledge graph & vector store',
  },
  {
    id: 'evt-3',
    timestamp: '21:04:33',
    sourceAgentId: 'searcher',
    targetAgentId: 'researcher',
    type: 'result_produced',
    message: '17 entities & passages discovered',
  },
  {
    id: 'evt-4',
    timestamp: '21:04:34',
    sourceAgentId: 'orchestrator',
    targetAgentId: 'analyst',
    type: 'agent_activated',
    message: 'Analyst activated',
  },
  {
    id: 'evt-5',
    timestamp: '21:04:36',
    sourceAgentId: 'orchestrator',
    targetAgentId: 'verifier',
    type: 'agent_activated',
    message: 'Verifier activated',
  },
  {
    id: 'evt-6',
    timestamp: '21:04:37',
    sourceAgentId: 'researcher',
    targetAgentId: 'verifier',
    type: 'message_sent',
    message: 'Message sent to Verifier',
  },
  {
    id: 'evt-7',
    timestamp: '21:04:38',
    sourceAgentId: 'verifier',
    targetAgentId: 'analyst',
    type: 'processing_update',
    message: 'Conflicting evidence detected in passage #4',
  },
  {
    id: 'evt-8',
    timestamp: '21:04:41',
    sourceAgentId: 'orchestrator',
    targetAgentId: 'searcher',
    type: 'agent_activated',
    message: 'Secondary searcher spawned',
  },
  {
    id: 'evt-9',
    timestamp: '21:04:45',
    sourceAgentId: 'analyst',
    targetAgentId: 'verifier',
    type: 'result_produced',
    message: 'Conflict resolved via trust-tier weighting',
  },
  {
    id: 'evt-10',
    timestamp: '21:04:48',
    sourceAgentId: 'orchestrator',
    targetAgentId: 'evaluator',
    type: 'processing_update',
    message: 'Synthesis initiated',
  },
];

const initialArtifacts: AuditArtifact[] = [
  {
    id: 'art-1',
    name: 'research_summary.md',
    type: 'markdown',
    size: '2.4 KB',
    updatedAt: '2m ago',
  },
  {
    id: 'art-2',
    name: 'data_sources.json',
    type: 'json',
    size: '18 KB',
    updatedAt: '3m ago',
  },
  {
    id: 'art-3',
    name: 'salary_trends_graph.png',
    type: 'image',
    size: '542 KB',
    updatedAt: '4m ago',
  },
  {
    id: 'art-4',
    name: 'final_report.md',
    type: 'markdown',
    size: '12 KB',
    updatedAt: '5m ago',
  },
];

const initialExecutionFlow: ExecutionFlowStep[] = [
  {
    agentId: 'researcher',
    name: 'Researcher',
    statusText: 'Gathering data',
    durationText: '00:01:12',
    status: 'active',
  },
  {
    agentId: 'searcher',
    name: 'Searcher',
    statusText: 'Querying sources',
    durationText: '00:01:48',
    status: 'processing',
  },
  {
    agentId: 'analyst',
    name: 'Analyst',
    statusText: 'Analyzing results',
    durationText: '00:02:36',
    status: 'processing',
  },
  {
    agentId: 'verifier',
    name: 'Verifier',
    statusText: 'Checking claims',
    durationText: '00:03:21',
    status: 'active',
  },
  {
    agentId: 'writer',
    name: 'Writer',
    statusText: 'Generating report',
    durationText: '00:04:10',
    status: 'waiting',
  },
];

let state: AuraStoreState = {
  mission: {
    title: 'Analyze Salary Increase Trends',
    description: 'Cross-check data, verify sources, find insights',
    elapsedTime: '00:04:32',
    status: 'EXECUTION IN PROGRESS',
  },
  backendStatus: 'Online',
  activeAgentsCount: 7,
  totalAgentsCount: 8,
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
  activeTab: 'Overview',
  adapterMode: 'simulation',
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const auraStore = {
  getState: () => state,
  setState: (partial: Partial<AuraStoreState> | ((prev: AuraStoreState) => Partial<AuraStoreState>)) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
    notify();
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  selectAgent: (agentId: AgentId) => {
    state = { ...state, selectedAgentId: agentId };
    notify();
  },
  setActiveTab: (tab: 'Overview' | 'Agents' | 'Artifacts') => {
    state = { ...state, activeTab: tab };
    notify();
  },
  addEvent: (event: AgentEvent) => {
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
};

export function useAuraStore<T>(selector: (s: AuraStoreState) => T): T {
  return useSyncExternalStore(
    auraStore.subscribe,
    () => selector(auraStore.getState()),
    () => selector(auraStore.getState())
  );
}
