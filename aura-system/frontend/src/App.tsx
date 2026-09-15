import React, { useEffect } from 'react';
import { HeaderBanner } from './components/layout/HeaderBanner';
import { AgentSidebar } from './components/sidebar/AgentSidebar';
import { LiveAgentNetworkCanvas } from './components/network/LiveAgentNetworkCanvas';
import { ExecutionFlowTimeline } from './components/network/ExecutionFlowTimeline';
import { AgentInspectorPanel } from './components/inspector/AgentInspectorPanel';
import { auraStore } from './store/useAuraStore';

export default function App() {
  // Check backend health on mount
  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => auraStore.setBackendStatus(data.status === 'healthy' ? 'Online' : 'Offline'))
      .catch(() => auraStore.setBackendStatus('Offline'));
  }, []);

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden">
      {/* Top Header Command Banner */}
      <HeaderBanner />

      {/* Main 3-Column Command Dashboard */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Agent Roster & System Metrics Sidebar */}
        <AgentSidebar />

        {/* Center Main Live Agent Network Canvas & Execution Flow */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          <LiveAgentNetworkCanvas />
          <ExecutionFlowTimeline />
        </main>

        {/* Right Inspection & Event Stream Drawer */}
        <AgentInspectorPanel />
      </div>
    </div>
  );
}
