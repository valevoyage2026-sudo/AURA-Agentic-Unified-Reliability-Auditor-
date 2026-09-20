import { AgentEvent, AgentId, AgentStatus, ExecutionAdapter, MessagePulse } from '../types/verification';
import { auraStore } from '../store/useAuraStore';

export interface SimulationStep {
  delayMs: number;
  event: Omit<AgentEvent, 'id' | 'timestamp'>;
  agentUpdates?: Partial<Record<AgentId, { status?: AgentStatus; progress?: number; operation?: string }>>;
  pulse?: { from: AgentId; to: AgentId; color: string };
  missionProgress?: number;
}

const deterministicSequence: SimulationStep[] = [
  {
    delayMs: 1000,
    event: {
      sourceAgentId: 'orchestrator',
      type: 'agent_activated',
      message: 'Audit initialized by Orchestrator',
    },
    agentUpdates: {
      orchestrator: { status: 'active', progress: 10, operation: 'Initializing verification graph' },
    },
    missionProgress: 5,
  },
  {
    delayMs: 1500,
    event: {
      sourceAgentId: 'orchestrator',
      targetAgentId: 'planner',
      type: 'task_started',
      message: 'Planner activated (Decomposing user prompt)',
    },
    agentUpdates: {
      planner: { status: 'active', progress: 30, operation: 'Extracting atomic claims & char spans' },
    },
    pulse: { from: 'orchestrator', to: 'planner', color: '#0284c7' },
    missionProgress: 15,
  },
  {
    delayMs: 2000,
    event: {
      sourceAgentId: 'planner',
      targetAgentId: 'researcher',
      type: 'result_produced',
      message: 'Planner decomposed 8 atomic claims & causal dependencies',
    },
    agentUpdates: {
      planner: { status: 'completed', progress: 100, operation: 'Decomposition complete (8 claims)' },
      researcher: { status: 'active', progress: 20, operation: 'Initiating evidence retrieval request' },
    },
    pulse: { from: 'planner', to: 'researcher', color: '#06b6d4' },
    missionProgress: 25,
  },
  {
    delayMs: 1800,
    event: {
      sourceAgentId: 'researcher',
      targetAgentId: 'searcher',
      type: 'message_sent',
      message: 'Researcher requested vector & graph retrieval',
    },
    agentUpdates: {
      searcher: { status: 'active', progress: 40, operation: 'Querying Qdrant vector collection & Neo4j' },
    },
    pulse: { from: 'researcher', to: 'searcher', color: '#3b82f6' },
    missionProgress: 35,
  },
  {
    delayMs: 2200,
    event: {
      sourceAgentId: 'searcher',
      targetAgentId: 'researcher',
      type: 'result_produced',
      message: 'Searcher returned 12 evidence sources & 4 entity nodes',
    },
    agentUpdates: {
      searcher: { status: 'completed', progress: 100, operation: 'Retrieval completed (12 passages)' },
      researcher: { status: 'active', progress: 60, operation: 'Structuring document evidence & trust tiers' },
    },
    pulse: { from: 'searcher', to: 'researcher', color: '#06b6d4' },
    missionProgress: 45,
  },
  {
    delayMs: 1800,
    event: {
      sourceAgentId: 'researcher',
      targetAgentId: 'analyst',
      type: 'message_sent',
      message: 'Researcher sent evidence passages to Analyst',
    },
    agentUpdates: {
      analyst: { status: 'active', progress: 50, operation: 'Checking internal claim contradictions & temporal graph paths' },
    },
    pulse: { from: 'researcher', to: 'analyst', color: '#a855f7' },
    missionProgress: 55,
  },
  {
    delayMs: 2000,
    event: {
      sourceAgentId: 'analyst',
      targetAgentId: 'verifier',
      type: 'processing_update',
      message: 'Analyst completed graph path checks. Dispatching to Verifier',
    },
    agentUpdates: {
      analyst: { status: 'completed', progress: 100, operation: 'Contradiction analysis clean' },
      verifier: { status: 'conflict', progress: 40, operation: 'Evaluating claim C2: Conflict detected' },
    },
    pulse: { from: 'analyst', to: 'verifier', color: '#f59e0b' },
    missionProgress: 65,
  },
  {
    delayMs: 2500,
    event: {
      sourceAgentId: 'verifier',
      targetAgentId: 'evaluator',
      type: 'conflict_resolved',
      message: 'Verifier resolved conflict on C2 via trust-tier weighting',
    },
    agentUpdates: {
      verifier: { status: 'completed', progress: 100, operation: 'All 8 claims verified (Supported)' },
      evaluator: { status: 'active', progress: 60, operation: 'Calculating deterministic reliability score' },
    },
    pulse: { from: 'verifier', to: 'evaluator', color: '#64748b' },
    missionProgress: 80,
  },
  {
    delayMs: 1800,
    event: {
      sourceAgentId: 'evaluator',
      targetAgentId: 'writer',
      type: 'result_produced',
      message: 'Evaluator score: 0.88 (RELIABLE). Routing to Writer',
    },
    agentUpdates: {
      evaluator: { status: 'completed', progress: 100, operation: 'Reliability report finalized' },
      writer: { status: 'active', progress: 70, operation: 'Synthesizing final audited response & caveats' },
    },
    pulse: { from: 'evaluator', to: 'writer', color: '#10b981' },
    missionProgress: 90,
  },
  {
    delayMs: 2000,
    event: {
      sourceAgentId: 'writer',
      targetAgentId: 'orchestrator',
      type: 'audit_completed',
      message: 'Writer generated report. Audit completed successfully',
    },
    agentUpdates: {
      writer: { status: 'completed', progress: 100, operation: 'Report synthesis complete' },
      orchestrator: { status: 'completed', progress: 100, operation: 'Execution completed' },
    },
    pulse: { from: 'writer', to: 'orchestrator', color: '#06b6d4' },
    missionProgress: 100,
  },
];

export class SimulationExecutionAdapter implements ExecutionAdapter {
  private listeners: Set<(event: AgentEvent) => void> = new Set();
  private timer: number | null = null;
  private currentStep = 0;
  private isPaused = false;

  subscribe(onEvent: (event: AgentEvent) => void): () => void {
    this.listeners.add(onEvent);
    return () => this.listeners.delete(onEvent);
  }

  private dispatchEvent(event: AgentEvent) {
    this.listeners.forEach((listener) => listener(event));
    auraStore.addEvent(event);
  }

  async startAudit(query: string, mode: 'generate_and_audit' | 'audit_only'): Promise<void> {
    console.log(`[SimulationExecutionAdapter] Starting audit sequence for query: "${query}", mode: ${mode}`);
    this.currentStep = 0;
    this.isPaused = false;
    auraStore.resetSimulation();
    auraStore.setSimulationStatus('running');
    this.executeNextStep();
  }

  private executeNextStep() {
    if (this.isPaused) return;

    if (this.currentStep >= deterministicSequence.length) {
      auraStore.setSimulationStatus('completed');
      return;
    }

    const step = deterministicSequence[this.currentStep++];
    this.timer = window.setTimeout(() => {
      if (this.isPaused) return;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      // 1. Dispatch event to store
      this.dispatchEvent({
        ...step.event,
        id: `sim-evt-${Date.now()}-${this.currentStep}`,
        timestamp: timeStr,
      });

      // 2. Update agent semantic states in store
      if (step.agentUpdates) {
        Object.entries(step.agentUpdates).forEach(([agentIdStr, update]) => {
          const id = agentIdStr as AgentId;
          const current = auraStore.getState().agents[id];
          auraStore.updateAgent(id, {
            status: update.status || current.status,
            progress: update.progress !== undefined ? update.progress : current.progress,
            currentOperation: update.operation || current.currentOperation,
          });
        });
      }

      // 3. Spawn pulse if message_sent
      if (step.pulse) {
        const pulse: MessagePulse = {
          id: `pulse-${Date.now()}`,
          fromAgentId: step.pulse.from,
          toAgentId: step.pulse.to,
          timestamp: Date.now(),
          color: step.pulse.color,
        };
        auraStore.addPulse(pulse);
      }

      // 4. Update overall mission progress
      if (step.missionProgress !== undefined) {
        auraStore.setState((prev) => ({
          mission: {
            ...prev.mission,
            progress: step.missionProgress!,
          },
        }));
      }

      // Recurse to next step
      this.executeNextStep();
    }, step.delayMs);
  }

  pauseAudit(): void {
    this.isPaused = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    auraStore.setSimulationStatus('paused');
  }

  resumeAudit(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    auraStore.setSimulationStatus('running');
    this.executeNextStep();
  }

  cancelAudit(): void {
    this.isPaused = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    auraStore.resetSimulation();
  }
}

export class RealExecutionAdapter implements ExecutionAdapter {
  private listeners: Set<(event: AgentEvent) => void> = new Set();

  subscribe(onEvent: (event: AgentEvent) => void): () => void {
    this.listeners.add(onEvent);
    return () => this.listeners.delete(onEvent);
  }

  async startAudit(query: string, mode: 'generate_and_audit' | 'audit_only'): Promise<void> {
    const response = await fetch('http://localhost:8000/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: query, mode }),
    });

    if (!response.ok) {
      throw new Error(`Backend verification failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[RealExecutionAdapter] Received AuraState from backend:', data);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const realEvent: AgentEvent = {
      id: `real-evt-${Date.now()}`,
      timestamp: timeStr,
      sourceAgentId: 'orchestrator',
      type: 'audit_completed',
      message: `Verification complete. Trace ID: ${data.trace_id}, Bucket: ${data.reliability?.bucket || 'reliable'}`,
      details: data,
    };

    this.listeners.forEach((listener) => listener(realEvent));
    auraStore.addEvent(realEvent);
  }

  pauseAudit(): void {}
  resumeAudit(): void {}
  cancelAudit(): void {}
}

const simulationAdapter = new SimulationExecutionAdapter();
const realAdapter = new RealExecutionAdapter();

export function getExecutionAdapter(mode: 'simulation' | 'real'): ExecutionAdapter {
  return mode === 'simulation' ? simulationAdapter : realAdapter;
}
