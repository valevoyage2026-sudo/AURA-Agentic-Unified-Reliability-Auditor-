export type AgentId =
  | 'orchestrator'
  | 'planner'
  | 'searcher'
  | 'researcher'
  | 'verifier'
  | 'analyst'
  | 'evaluator'
  | 'writer';

export type AgentStatus = 'active' | 'processing' | 'waiting' | 'idle' | 'warning' | 'error';

export interface AgentInfo {
  id: AgentId;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask: string;
  currentOperation: string;
  progress: number;
  progressDetail: string;
  input: string;
  output: string;
  confidence: number; // 0-100
  tokens: number;
  latencyMs: number;
  model: string;
  elapsedTime?: string;
}

export type EventType =
  | 'agent_activated'
  | 'task_started'
  | 'message_sent'
  | 'processing_update'
  | 'result_produced'
  | 'error_raised';

export interface AgentEvent {
  id: string;
  timestamp: string;
  sourceAgentId: AgentId;
  targetAgentId?: AgentId;
  type: EventType;
  message: string;
  details?: Record<string, unknown>;
}

export interface MessagePulse {
  id: string;
  fromAgentId: AgentId;
  toAgentId: AgentId;
  timestamp: number;
  color: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  gpu: number;
  disk: number;
}

export interface AuditArtifact {
  id: string;
  name: string;
  type: 'markdown' | 'json' | 'image';
  size: string;
  updatedAt: string;
}

export interface ExecutionFlowStep {
  agentId: AgentId;
  name: string;
  statusText: string;
  durationText: string;
  status: AgentStatus;
}

// Execution Adapter Interface (Directive 4)
export interface ExecutionAdapter {
  subscribe(onEvent: (event: AgentEvent) => void): () => void;
  startAudit(query: string, mode: 'generate_and_audit' | 'audit_only'): Promise<void>;
  cancelAudit(): void;
}
