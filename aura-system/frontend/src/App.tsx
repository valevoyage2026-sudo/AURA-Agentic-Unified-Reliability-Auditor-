import React, { useEffect } from 'react';
import { HeaderBanner } from './components/layout/HeaderBanner';
import { AgentSidebar } from './components/sidebar/AgentSidebar';
import { useAuraStore, auraStore } from './store/useAuraStore';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AuditWorkbench } from './components/workbench/AuditWorkbench';
import { MinimalDashboard } from './components/dashboard/MinimalDashboard';
import { AgentConfigurationPanel } from './components/config/AgentConfigurationPanel';
import { OfficerPortal } from './components/officer/OfficerPortal';

export default function App() {
  const theme = useAuraStore((s) => s.theme);
  const viewState = useAuraStore((s) => s.viewState);
  const activeTab = useAuraStore((s) => s.activeTab);
  const currentUser = useAuraStore((s) => s.currentUser);
  const isDark = theme === 'dark';

  // Check backend health on mount
  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => auraStore.setBackendStatus(data.status === 'healthy' ? 'Online' : 'Offline'))
      .catch(() => auraStore.setBackendStatus('Offline'));
  }, []);

  // Synchronize dark class on document root to prevent media query dark-mode override
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // 1. Landing Page View
  if (viewState === 'landing') return <LandingPage />;

  // 2. Unauthenticated View: Direct to LoginPage
  if (viewState === 'login' || !currentUser) return <LoginPage />;

  // 3. Authenticated Workspace Router with Strict Role Containment
  const isOfficer = currentUser.role === 'officer';

  const renderActiveModule = () => {
    // Student Role Protection: Students can only access the Advisory & Policy Audit Workbench
    if (!isOfficer) {
      return <AuditWorkbench />;
    }

    // Officer Role Routes
    switch (activeTab) {
      case 'OfficerPortal':
      case 'KnowledgeVault':
        return <OfficerPortal />;
      case 'AuditWorkbench':
        return <AuditWorkbench />;
      case 'AgentConfig':
        return <AgentConfigurationPanel />;
      case 'Overview':
      default:
        return <MinimalDashboard />;
    }
  };

  return (
    <div
      className={`${isDark ? 'dark' : ''} w-screen h-screen font-sans flex flex-col overflow-hidden transition-colors`}
      style={{
        background: 'var(--bg)',
        color: 'var(--txt)',
      }}
    >
      {/* Top Enterprise Operations Header */}
      <HeaderBanner />

      {/* Main Dual-Pane Operations Shell (per aura.html: 248px 1fr) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <AgentSidebar />

        {/* Center Main Workspace */}
        <main
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            background: 'var(--bg)',
          }}
        >
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}
