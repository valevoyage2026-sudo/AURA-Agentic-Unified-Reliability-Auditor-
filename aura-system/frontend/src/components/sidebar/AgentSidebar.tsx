import React from 'react';
import { useAuraStore, auraStore } from '../../store/useAuraStore';
import {
  ShieldCheck,
  Sliders,
  Activity,
  Database,
  FileCheck,
} from 'lucide-react';

export const AgentSidebar: React.FC = () => {
  const isLeftSidebarOpen = useAuraStore((s) => s.isLeftSidebarOpen);
  const activeTab = useAuraStore((s) => s.activeTab);
  const currentUser = useAuraStore((s) => s.currentUser);

  if (!isLeftSidebarOpen) return null;

  const isOfficer = currentUser?.role === 'officer';

  // Role-gated navigation items: Officers get full administrative tools; Students only get advisory auditing
  const navItems = isOfficer
    ? [
        { id: 'AuditWorkbench' as const, label: 'Audit Workbench', icon: 'shield' },
        { id: 'KnowledgeVault' as const, label: 'Knowledge Vault', icon: 'database' },
        { id: 'Overview' as const, label: 'Campus Telemetry', icon: 'activity' },
        { id: 'AgentConfig' as const, label: 'Pipeline Config', icon: 'pipeline' },
      ]
    : [
        { id: 'AuditWorkbench' as const, label: 'Audit Workbench', icon: 'shield' },
      ];

  const renderNavIcon = (icon: string, isActive: boolean) => {
    switch (icon) {
      case 'shield':
        return <ShieldCheck className="w-[18px] h-[18px]" strokeWidth={1.7} />;
      case 'database':
        return <Database className="w-[18px] h-[18px]" strokeWidth={1.7} />;
      case 'activity':
        return <Activity className="w-[18px] h-[18px]" strokeWidth={1.7} />;
      case 'pipeline':
        return <Sliders className="w-[18px] h-[18px]" strokeWidth={1.7} />;
      default:
        return <FileCheck className="w-[18px] h-[18px]" strokeWidth={1.7} />;
    }
  };

  return (
    <aside
      className="w-[248px] shrink-0 border-r select-none flex flex-col justify-between relative overflow-hidden"
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--line)',
        minHeight: '760px',
      }}
    >
      {/* Top Workspace Navigation Links */}
      <div>
        <h6
          className="font-medium text-[11px] tracking-[0.14em] uppercase"
          style={{
            color: 'var(--txt)',
            padding: '22px 30px 14px',
          }}
        >
          {isOfficer ? 'Administrative Workspace' : 'Student Workspace'}
        </h6>

        <nav className="flex flex-col">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => auraStore.setActiveTab(item.id)}
                className={`flex items-center gap-[14px] text-[14.5px] transition-all cursor-pointer font-medium ${
                  isActive ? 'on' : ''
                }`}
                style={{
                  padding: isActive ? '13px 36px 13px 23px' : '13px 36px',
                  color: isActive ? 'var(--or)' : 'var(--ink)',
                  background: isActive ? 'linear-gradient(90deg, #fbe3cf, #fbeee2)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--or)' : '3px solid transparent',
                  margin: isActive ? '0 12px 0 10px' : '0',
                  borderRadius: isActive ? '2px' : '0',
                }}
              >
                <span style={{ color: isActive ? 'var(--or)' : 'var(--ink)' }}>
                  {renderNavIcon(item.icon, isActive)}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mountain Landscape Artwork from assets/aura/mountains.png */}
      <img
        src="/assets/aura/mountains.png"
        alt="Mountain Landscape"
        className="mount select-none pointer-events-none"
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          bottom: '176px',
          display: 'block',
          maskImage: 'linear-gradient(#0000, #000 22%)',
          WebkitMaskImage: 'linear-gradient(#0000, #000 22%)',
        }}
      />

      {/* Bottom System Health Console Card (per aura.html measurements) */}
      <div
        className="health"
        style={{
          position: 'absolute',
          left: '20px',
          right: '28px',
          bottom: '70px',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: '10px',
          padding: '14px 14px 18px',
          boxShadow: '0 8px 24px rgba(18, 48, 90, 0.08)',
          fontSize: '12px',
        }}
      >
        <div className="flex items-center justify-between" style={{ color: 'var(--ink)' }}>
          <span className="flex items-center gap-[9px] font-semibold">
            <ShieldCheck className="w-4 h-4" strokeWidth={1.7} style={{ color: 'var(--ink)' }} />
            <span>System Health</span>
          </span>
          <span
            className="pill text-[12px] font-medium"
            style={{
              background: '#e3f3e8',
              color: 'var(--ok)',
              borderRadius: '4px',
              padding: '2px 12px',
            }}
          >
            Healthy
          </span>
        </div>

        <small
          className="block text-[10.5px]"
          style={{
            color: 'var(--mut)',
            margin: '10px 0 12px',
            fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace',
          }}
        >
          Agents • Infra • Qdrant • Postgres
        </small>

        {/* 4px Two-Tone Segmented Progress Bar: Orange then Navy */}
        <div
          className="bar"
          style={{
            height: '4px',
            background: '#e4dfd6',
            borderRadius: '3px',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          <i style={{ width: '60%', background: 'var(--or)', display: 'block', height: '100%' }} />
          <i style={{ width: '40%', background: 'var(--nav)', display: 'block', height: '100%' }} />
        </div>
      </div>
    </aside>
  );
};
