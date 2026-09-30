import React, { useEffect } from 'react';
import { HeaderBanner } from './components/layout/HeaderBanner';
import { AgentSidebar } from './components/sidebar/AgentSidebar';
import { useAuraStore, auraStore } from './store/useAuraStore';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AuditWorkbench } from './components/workbench/AuditWorkbench';
import { MinimalDashboard } from './components/dashboard/MinimalDashboard';
import { AgentConfigurationPanel } from './components/config/AgentConfigurationPanel';

export default function App() {
  const theme = useAuraStore((s) => s.theme);
  const viewState = useAuraStore((s) => s.viewState);
  const activeTab = useAuraStore((s) => s.activeTab);
  const isDark = theme === 'dark';

  // Check backend health on mount
  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => auraStore.setBackendStatus(data.status === 'healthy' ? 'Online' : 'Offline'))
      .catch(() => auraStore.setBackendStatus('Offline'));
  }, []);

  if (viewState === 'landing') return <LandingPage />;
  if (viewState === 'login') return <LoginPage />;

  return (
    <div
      className={`w-screen h-screen font-sans flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Enterprise Header */}
      <HeaderBanner />

      {/* Main Command Dashboard */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <AgentSidebar />

        {/* Center Main Module */}
        <main className={`flex-1 flex flex-col overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
          {activeTab === 'AuditWorkbench' ? (
            <AuditWorkbench />
          ) : activeTab === 'AgentConfig' ? (
            <AgentConfigurationPanel />
          ) : (
            <MinimalDashboard />
          )}
        </main>
      </div>
    </div>
  );
}
