import React, { useEffect, useRef, useState } from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import { AgentId, AgentStatus } from '../../types/verification';
import {
  Plus,
  Minus,
  RotateCcw,
  Shield,
  Search,
  CheckCircle2,
  BarChart3,
  Database,
  FileText,
  Sparkles,
  HelpCircle,
  Target,
  GripHorizontal,
  Move,
} from 'lucide-react';

interface NodeDef {
  id: AgentId;
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
}

const nodeDefs: NodeDef[] = [
  { id: 'orchestrator', name: 'Orchestrator', role: 'Routing • Planning', icon: <Shield className="w-4 h-4 text-amber-400" />, color: '#f59e0b' },
  { id: 'researcher', name: 'Researcher', role: 'Find sources & data', icon: <Sparkles className="w-4 h-4 text-cyan-400" />, color: '#06b6d4' },
  { id: 'planner', name: 'Planner', role: 'Create plan', icon: <HelpCircle className="w-4 h-4 text-sky-400" />, color: '#0284c7' },
  { id: 'analyst', name: 'Analyst', role: 'Process & extract claims', icon: <BarChart3 className="w-4 h-4 text-purple-400" />, color: '#a855f7' },
  { id: 'searcher', name: 'Searcher', role: 'Query knowledge graph', icon: <Search className="w-4 h-4 text-blue-400" />, color: '#3b82f6' },
  { id: 'verifier', name: 'Verifier', role: 'Check claims & evidence', icon: <CheckCircle2 className="w-4 h-4 text-amber-400" />, color: '#f59e0b' },
  { id: 'evaluator', name: 'Evaluator', role: 'Scoring reliability', icon: <Database className="w-4 h-4 text-slate-400" />, color: '#64748b' },
  { id: 'writer', name: 'Writer', role: 'Generate report', icon: <FileText className="w-4 h-4 text-emerald-400" />, color: '#10b981' },
];

export interface ConnectionLink {
  from: AgentId;
  to: AgentId;
  isDashed?: boolean;
  label?: string;
}

const defaultConnections: ConnectionLink[] = [
  { from: 'orchestrator', to: 'researcher' },
  { from: 'orchestrator', to: 'planner' },
  { from: 'orchestrator', to: 'analyst' },
  { from: 'researcher', to: 'searcher' },
  { from: 'searcher', to: 'researcher' },
  { from: 'researcher', to: 'verifier' },
  { from: 'planner', to: 'verifier' },
  { from: 'analyst', to: 'verifier' },
  { from: 'verifier', to: 'writer' },
  { from: 'verifier', to: 'researcher', isDashed: true, label: 'Needs more evidence' },
];

const statusColors: Record<AgentStatus, { border: string; bg: string; text: string; dot: string }> = {
  active: { border: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', text: '#06b6d4', dot: '#06b6d4' },
  processing: { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7', dot: '#a855f7' },
  waiting: { border: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', text: '#38bdf8', dot: '#38bdf8' },
  completed: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', dot: '#10b981' },
  conflict: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', dot: '#f59e0b' },
  failed: { border: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e', dot: '#f43f5e' },
  queued: { border: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)', text: '#0284c7', dot: '#0284c7' },
  idle: { border: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', text: '#64748b', dot: '#64748b' },
};

const getDefaultPositions = (): Record<AgentId, { x: number; y: number }> => ({
  orchestrator: { x: 380, y: 100 },
  researcher: { x: 120, y: 240 },
  planner: { x: 380, y: 240 },
  analyst: { x: 640, y: 240 },
  searcher: { x: 120, y: 410 },
  verifier: { x: 380, y: 410 },
  evaluator: { x: 640, y: 410 },
  writer: { x: 380, y: 570 },
});

export const LiveAgentNetworkCanvas: React.FC = () => {
  const theme = useAuraStore((s) => s.theme);
  const selectedAgentId = useAuraStore((s) => s.selectedAgentId);
  const agents = useAuraStore((s) => s.agents);
  const pulses = useAuraStore((s) => s.pulses);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [graphMode, setGraphMode] = useState<'Execution' | 'Evidence' | 'Communication'>('Execution');

  // Node positions state
  const [positions, setPositions] = useState<Record<AgentId, { x: number; y: number }>>(getDefaultPositions());
  const [draggingNodeId, setDraggingNodeId] = useState<AgentId | null>(null);

  // Canvas Panning State
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDark = theme === 'dark';

  // Node Dragging Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, id: AgentId) => {
    e.stopPropagation();
    auraStore.selectAgent(id);
    setDraggingNodeId(id);
  };

  // Canvas Viewport Panning Handlers
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    // Enable panning unless explicitly clicking an interactive button/node element or grip
    const target = e.target as HTMLElement;
    const isNodeOrButton = target.closest('button') || target.closest('.agent-node-card');
    
    if (!isNodeOrButton) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - panOffset.x) / zoom - 85;
      const currentY = (e.clientY - rect.top - panOffset.y) / zoom - 30;

      setPositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: currentX,
          y: currentY,
        },
      }));
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
    setZoom((z) => Math.min(Math.max(z * zoomFactor, 0.5), 2.0));
  };

  // 60FPS Canvas Animation Renderer for connection lines, directed arrows, and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particleOffset = 0;

    const render = () => {
      const w = (canvas.width = canvas.parentElement?.clientWidth || 900);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 700);

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoom, zoom);

      const getNodeCenter = (id: AgentId) => ({
        x: (positions[id]?.x || 0) + 85,
        y: (positions[id]?.y || 0) + 35,
      });

      // 1. Mission to Orchestrator link
      const missionCenter = { x: 380 + 90, y: 35 };
      const orchCenter = getNodeCenter('orchestrator');

      ctx.beginPath();
      ctx.moveTo(missionCenter.x, missionCenter.y);
      ctx.lineTo(orchCenter.x, orchCenter.y);
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Render clean connections with directed arrowheads & glowing particles
      particleOffset = (particleOffset + 0.006) % 1;

      defaultConnections.forEach((conn) => {
        const p1 = getNodeCenter(conn.from);
        const p2 = getNodeCenter(conn.to);

        ctx.beginPath();
        if (conn.isDashed) {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#f59e0b';
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.6)' : 'rgba(203, 213, 225, 0.8)';
        }

        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Directed Arrowhead pointing towards target node
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const arrowLen = 8;
        const arrowDist = 0.82; // Stop arrow before node border
        const arrowX = p1.x + (p2.x - p1.x) * arrowDist;
        const arrowY = p1.y + (p2.y - p1.y) * arrowDist;

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLen * Math.cos(angle - Math.PI / 6),
          arrowY - arrowLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - arrowLen * Math.cos(angle + Math.PI / 6),
          arrowY - arrowLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = conn.isDashed ? '#f59e0b' : isDark ? '#06b6d4' : '#0284c7';
        ctx.fill();

        // Label on connection wire
        if (conn.label) {
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          ctx.font = '10px monospace';
          ctx.fillStyle = '#f59e0b';
          ctx.fillText(conn.label, mx - 45, my - 6);
        }

        // Particle moving cleanly along direct line
        const px = p1.x + (p2.x - p1.x) * particleOffset;
        const py = p1.y + (p2.y - p1.y) * particleOffset;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = conn.isDashed ? '#f59e0b' : '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [zoom, panOffset, isDark, positions, pulses]);

  const resetLayout = () => {
    setPositions(getDefaultPositions());
    setPanOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative flex-1 overflow-hidden select-none flex flex-col transition-colors ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      } ${isDark ? 'bg-slate-950/90 text-slate-100' : 'bg-slate-100/90 text-slate-900'}`}
    >
      {/* Sub-Header Bar */}
      <div className={`h-12 border-b px-4 flex items-center justify-between z-10 ${isDark ? 'border-slate-900 bg-slate-950/70' : 'border-slate-200 bg-white/70'}`}>
        <div className={`flex items-center gap-1 p-0.5 rounded-lg border text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
          {(['Execution', 'Evidence', 'Communication'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setGraphMode(tab)}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                graphMode === tab
                  ? 'bg-cyan-600 text-white shadow-sm font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Move className="w-3 h-3 text-cyan-400" /> Click background to pan • Drag node to move
          </span>

          <div className="flex items-center gap-1">
            <button onClick={() => setZoom((z) => Math.min(z + 0.1, 1.4))} className={`p-1.5 rounded-lg border cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.7))} className={`p-1.5 rounded-lg border cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button onClick={resetLayout} className={`p-1.5 rounded-lg border cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`} title="Reset Viewport & Nodes">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Connection Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Status Legend */}
      <div className={`absolute top-16 right-6 z-10 p-3 rounded-xl border flex flex-col gap-1.5 text-[10px] font-semibold backdrop-blur-md shadow-lg ${isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-700'}`}>
        <span className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status Legend</span>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Active</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-400" /> Processing</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-400" /> Waiting</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Complete</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400" /> Conflict</div>
      </div>

      {/* Draggable Agent Nodes & Viewport Transform Overlay Container */}
      <div
        className="relative w-full h-full transition-transform duration-75 z-10"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Top Root Mission Node */}
        <div
          className={`absolute px-4 py-2 rounded-xl border flex items-center gap-2.5 shadow-xl ${isDark ? 'bg-slate-900/90 border-indigo-500/60' : 'bg-white border-indigo-300'}`}
          style={{ left: '380px', top: '20px', transform: 'translateX(-50%)' }}
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Mission</span>
            <span className="text-xs font-bold truncate">Analyze Salary Increase Trends</span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2" />
        </div>

        {/* 8 Clean Draggable Agent Nodes */}
        {nodeDefs.map((def) => {
          const pos = positions[def.id] || { x: 100, y: 100 };
          const agentData = agents[def.id];
          const status = agentData?.status || 'idle';
          const style = statusColors[status];
          const isSelected = selectedAgentId === def.id;

          return (
            <div
              key={def.id}
              onMouseDown={(e) => handleNodeMouseDown(e, def.id)}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                borderColor: isSelected ? '#06b6d4' : style.border,
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
              }}
              className={`agent-node-card absolute w-[170px] p-2.5 rounded-xl border flex flex-col gap-1.5 shadow-xl cursor-grab active:cursor-grabbing transition-shadow ${
                isSelected ? 'ring-2 ring-cyan-400 shadow-cyan-500/30 z-30' : 'z-20 hover:shadow-cyan-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {def.icon}
                  <span className="text-xs font-bold tracking-wide truncate">{def.name}</span>
                </div>
                <GripHorizontal className="w-3.5 h-3.5 text-slate-500" />
              </div>

              <span className={`text-[9.5px] truncate text-left ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{def.role}</span>

              <div className="flex items-center justify-between text-[9px] font-mono pt-0.5">
                <span className="font-bold uppercase" style={{ color: style.text }}>
                  ● {status}
                </span>
                <span className="text-slate-400 font-bold">{agentData?.progress || 0}%</span>
              </div>

              <div className="w-full h-1 bg-slate-700/30 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${agentData?.progress || 0}%`, backgroundColor: style.border }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
