import React, { useEffect } from 'react';
import { HeaderBanner } from './components/layout/HeaderBanner';
import { AgentSidebar } from './components/sidebar/AgentSidebar';
import { LiveAgentNetworkCanvas } from './components/network/LiveAgentNetworkCanvas';
import { ExecutionFlowTimeline } from './components/network/ExecutionFlowTimeline';
import { AgentInspectorPanel } from './components/inspector/AgentInspectorPanel';
import { useAuraStore, auraStore } from './store/useAuraStore';

export default function App() {
  const theme = useAuraStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Check backend health on mount
  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => auraStore.setBackendStatus(data.status === 'healthy' ? 'Online' : 'Offline'))
      .catch(() => auraStore.setBackendStatus('Offline'));
  }, []);

  return (
    <div
      className={`w-screen h-screen font-sans flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Header Command Banner */}
      <HeaderBanner />

      {/* Main 3-Column Command Dashboard */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Agent Roster & Navigation Sidebar */}
        <AgentSidebar />

        {/* Center Main Live Agent Network Canvas & Execution Flow */}
        <main className={`flex-1 flex flex-col overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
          <LiveAgentNetworkCanvas />
          <ExecutionFlowTimeline />
        </main>

        {/* Right Inspection & Event Stream Panel */}
        <AgentInspectorPanel />
      </div>
    </div>
  );
}
