import { AgentEvent, ExecutionAdapter } from '../types/verification';
import { auraStore } from '../store/useAuraStore';

export class SimulationExecutionAdapter implements ExecutionAdapter {
  private listeners: Set<(event: AgentEvent) => void> = new Set();
  private timer: number | null = null;

  subscribe(onEvent: (event: AgentEvent) => void): () => void {
    this.listeners.add(onEvent);
    return () => this.listeners.delete(onEvent);
  }

  private dispatchEvent(event: AgentEvent) {
    this.listeners.forEach((listener) => listener(event));
    auraStore.addEvent(event);
  }

  async startAudit(query: string, mode: 'generate_and_audit' | 'audit_only'): Promise<void> {
    console.log(`[SimulationExecutionAdapter] Starting audit with query: "${query}", mode: ${mode}`);
    
    // Dispatch initial sequence of simulated events
    const steps: Omit<AgentEvent, 'id' | 'timestamp'>[] = [
      {
        sourceAgentId: 'orchestrator',
        targetAgentId: 'planner',
        type: 'agent_activated',
        message: 'Audit job received. Planner decomposing text into claims.',
      },
      {
        sourceAgentId: 'planner',
        targetAgentId: 'searcher',
        type: 'task_started',
        message: '5 atomic claims extracted. Requesting vector search.',
      },
      {
        sourceAgentId: 'searcher',
        targetAgentId: 'researcher',
        type: 'processing_update',
        message: 'Qdrant vector query returned 14 candidate evidence passages.',
      },
      {
        sourceAgentId: 'researcher',
        targetAgentId: 'verifier',
        type: 'message_sent',
        message: 'Passing evidence passages & claims to Verifier.',
      },
      {
        sourceAgentId: 'verifier',
        targetAgentId: 'analyst',
        type: 'processing_update',
        message: 'Entailment checks in progress (Fact & Citation verification).',
      },
      {
        sourceAgentId: 'analyst',
        targetAgentId: 'evaluator',
        type: 'result_produced',
        message: 'Contradiction checks clean. Routing to Evaluator.',
      },
      {
        sourceAgentId: 'evaluator',
        targetAgentId: 'writer',
        type: 'result_produced',
        message: 'Reliability bucket evaluated: RELIABLE (Score: 0.88).',
      },
      {
        sourceAgentId: 'writer',
        targetAgentId: 'orchestrator',
        type: 'result_produced',
        message: 'Self-repair complete. Final audited payload ready.',
      },
    ];

    let index = 0;
    this.timer = window.setInterval(() => {
      if (index >= steps.length) {
        if (this.timer) clearInterval(this.timer);
        return;
      }
      const step = steps[index++];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      this.dispatchEvent({
        ...step,
        id: `sim-evt-${Date.now()}-${index}`,
        timestamp: timeStr,
      });
    }, 2000);
  }

  cancelAudit(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
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
      type: 'result_produced',
      message: `Verification complete. Trace ID: ${data.trace_id}, Bucket: ${data.reliability?.bucket || 'reliable'}`,
      details: data,
    };

    this.listeners.forEach((listener) => listener(realEvent));
    auraStore.addEvent(realEvent);
  }

  cancelAudit(): void {
    console.log('[RealExecutionAdapter] Audit cancelled.');
  }
}

export function getExecutionAdapter(mode: 'simulation' | 'real'): ExecutionAdapter {
  return mode === 'simulation' ? new SimulationExecutionAdapter() : new RealExecutionAdapter();
}
