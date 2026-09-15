import React, { useEffect, useRef, useState } from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import { AgentId } from '../../types/verification';
import { Plus, Minus, RotateCcw, Shield, Search, CheckCircle2, BarChart3, Database, FileText, Sparkles, HelpCircle } from 'lucide-react';

interface NodePosition {
  id: AgentId;
  name: string;
  statusText: string;
  angleDeg: number;
  radius: number;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
}

const orbitalConfig: NodePosition[] = [
  {
    id: 'researcher',
    name: 'RESEARCHER',
    statusText: 'Active',
    angleDeg: -135,
    radius: 200,
    color: '#06b6d4', // Cyan
    glowColor: 'rgba(6, 182, 212, 0.4)',
    icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
  },
  {
    id: 'searcher',
    name: 'SEARCHER',
    statusText: 'Processing',
    angleDeg: -70,
    radius: 240,
    color: '#3b82f6', // Blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
    icon: <Search className="w-5 h-5 text-blue-400" />,
  },
  {
    id: 'analyst',
    name: 'ANALYST',
    statusText: 'Processing',
    angleDeg: -15,
    radius: 220,
    color: '#a855f7', // Purple
    glowColor: 'rgba(168, 85, 247, 0.4)',
    icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
  },
  {
    id: 'verifier',
    name: 'VERIFIER',
    statusText: 'Active',
    angleDeg: 30,
    radius: 230,
    color: '#f59e0b', // Amber/Gold
    glowColor: 'rgba(245, 158, 11, 0.4)',
    icon: <CheckCircle2 className="w-5 h-5 text-amber-400" />,
  },
  {
    id: 'writer',
    name: 'WRITER',
    statusText: 'Waiting',
    angleDeg: 90,
    radius: 210,
    color: '#10b981', // Emerald
    glowColor: 'rgba(16, 185, 129, 0.4)',
    icon: <FileText className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: 'evaluator',
    name: 'EVALUATOR',
    statusText: 'Idle',
    angleDeg: 140,
    radius: 210,
    color: '#64748b', // Slate
    glowColor: 'rgba(100, 116, 139, 0.4)',
    icon: <Database className="w-5 h-5 text-slate-400" />,
  },
  {
    id: 'planner',
    name: 'PLANNER',
    statusText: 'Planning',
    angleDeg: -195,
    radius: 210,
    color: '#0284c7', // Sky Blue
    glowColor: 'rgba(2, 132, 199, 0.4)',
    icon: <HelpCircle className="w-5 h-5 text-sky-400" />,
  },
];

const interAgentLinks: { from: AgentId; to: AgentId; color: string }[] = [
  { from: 'researcher', to: 'verifier', color: '#06b6d4' },
  { from: 'searcher', to: 'researcher', color: '#3b82f6' },
  { from: 'analyst', to: 'verifier', color: '#a855f7' },
  { from: 'verifier', to: 'evaluator', color: '#f59e0b' },
  { from: 'evaluator', to: 'writer', color: '#10b981' },
];

export const LiveAgentNetworkCanvas: React.FC = () => {
  const selectedAgentId = useAuraStore((s) => s.selectedAgentId);
  const agents = useAuraStore((s) => s.agents);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  // Derive canvas dimensions and particle animations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particleOffset = 0;

    const render = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 600);
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle orbital grid rings
      ctx.save();
      ctx.scale(zoom, zoom);

      [130, 210, 270].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Calculate node positions
      const positions: Record<AgentId, { x: number; y: number }> = {
        orchestrator: { x: cx, y: cy },
        planner: { x: cx, y: cy },
        searcher: { x: cx, y: cy },
        researcher: { x: cx, y: cy },
        verifier: { x: cx, y: cy },
        analyst: { x: cx, y: cy },
        evaluator: { x: cx, y: cy },
        writer: { x: cx, y: cy },
      };

      orbitalConfig.forEach((node) => {
        const rad = (node.angleDeg * Math.PI) / 180;
        positions[node.id] = {
          x: cx + Math.cos(rad) * node.radius,
          y: cy + Math.sin(rad) * node.radius,
        };
      });

      // Draw connection links & animated particles
      particleOffset = (particleOffset + 0.008) % 1;

      // 1. Orchestrator to all orbital nodes
      orbitalConfig.forEach((node) => {
        const target = positions[node.id];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = node.glowColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated stream particle along Orchestrator link
        const px = cx + (target.x - cx) * particleOffset;
        const py = cy + (target.y - cy) * particleOffset;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 2. Inter-agent curved links
      interAgentLinks.forEach((link) => {
        const p1 = positions[link.from];
        const p2 = positions[link.to];
        const mx = (p1.x + p2.x) / 2 + (p1.y - p2.y) * 0.15;
        const my = (p1.y + p2.y) / 2 + (p2.x - p1.x) * 0.15;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(mx, my, p2.x, p2.y);
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Particle stream along curved inter-agent path
        const t = (particleOffset + 0.5) % 1;
        const px = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * mx + t * t * p2.x;
        const py = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * my + t * t * p2.y;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = link.color;
        ctx.fill();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [zoom]);

  return (
    <div className="relative flex-1 bg-slate-950/90 overflow-hidden select-none flex items-center justify-center">
      {/* Header Overlay tag */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">LIVE AGENT NETWORK</span>
      </div>

      {/* Pan / Zoom Control Widget */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 1.5))}
          className="p-1.5 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
          className="p-1.5 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* HTML5 Canvas Background Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Interactive HTML Node Elements Overlay */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Central Orchestrator Node */}
        <div
          onClick={() => auraStore.selectAgent('orchestrator')}
          className={`absolute cursor-pointer flex flex-col items-center justify-center transition-all ${
            selectedAgentId === 'orchestrator' ? 'scale-110' : 'hover:scale-105'
          }`}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-slate-900/90 border-2 border-cyan-400/80 shadow-2xl shadow-cyan-500/40">
            <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-indigo-600/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <span className="mt-2 text-xs font-extrabold tracking-widest text-cyan-400 uppercase">ORCHESTRATOR</span>
          <span className="text-[10px] text-slate-400 font-mono">Active • 00:04:32</span>
        </div>

        {/* 7 Orbital Nodes */}
        {orbitalConfig.map((node) => {
          const rad = (node.angleDeg * Math.PI) / 180;
          const x = Math.cos(rad) * node.radius;
          const y = Math.sin(rad) * node.radius;
          const isSelected = selectedAgentId === node.id;
          const agentData = agents[node.id];

          return (
            <div
              key={node.id}
              onClick={() => auraStore.selectAgent(node.id)}
              className={`absolute cursor-pointer flex flex-col items-center justify-center transition-all ${
                isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
              }`}
              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-900/90 border-2 transition-all shadow-xl`}
                style={{
                  borderColor: node.color,
                  boxShadow: isSelected ? `0 0 20px ${node.glowColor}` : `0 0 10px ${node.glowColor}`,
                }}
              >
                {node.icon}
              </div>
              <span className="mt-1.5 text-[11px] font-bold tracking-wider text-slate-200">{node.name}</span>
              <span className="text-[9px] font-medium" style={{ color: node.color }}>
                {agentData?.status ? agentData.status.toUpperCase() : node.statusText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
