"use client";

import { useCallback, useEffect, useState } from "react";
import { NavigationProvider, useNavigation } from "../lib/navigation";
import Sidebar from "./shell/Sidebar";
import Topbar from "./shell/Topbar";

import OverviewView from "./views/OverviewView";
import ScenarioView from "./views/ScenarioView";
import LiveMonitorView from "./views/LiveMonitorView";
import LogsView from "./views/LogsView";
import SettingsView from "./views/SettingsView";

import { api } from "../lib/api";
import type { CallStatus, ScenarioInfo } from "../lib/types";

interface DashboardProps {
  initialScenarios: ScenarioInfo[];
  initialCalls: CallStatus[];
}

function DashboardInner({
  initialScenarios,
  initialCalls,
}: DashboardProps) {
  const [scenarios] = useState<ScenarioInfo[]>(initialScenarios);
  const [calls, setCalls] = useState<CallStatus[]>(initialCalls);
  const { activeView, setActiveCallId, activeCallId } = useNavigation();

  const refreshCalls = useCallback(async () => {
    try {
      const data = await api.listCalls();
      setCalls(data.calls);
    } catch {
      // Keep existing calls on failure
    }
  }, []);

  // Poll for call updates globally every 10 seconds to keep metrics in sync
  useEffect(() => {
    refreshCalls();
    const interval = setInterval(refreshCalls, 10000);
    return () => clearInterval(interval);
  }, [refreshCalls]);

  const handleCallInitiated = useCallback(
    async (callId: string) => {
      setActiveCallId(callId);
      await refreshCalls();
    },
    [setActiveCallId, refreshCalls]
  );

  const handleCallEnded = useCallback(async () => {
    await refreshCalls();
  }, [refreshCalls]);

  const renderActiveView = () => {
    if (activeView === "overview") {
      return <OverviewView calls={calls} scenarios={scenarios} />;
    }
    if (activeView === "monitor") {
      return <LiveMonitorView onCallEnded={handleCallEnded} />;
    }
    if (activeView === "logs") {
      return <LogsView initialCalls={calls} scenarios={scenarios} />;
    }
    if (activeView === "settings") {
      return <SettingsView />;
    }
    if (activeView.startsWith("scenario/")) {
      const scenarioId = activeView.split("/")[1] as any;
      return (
        <ScenarioView
          scenarioId={scenarioId}
          scenarios={scenarios}
          calls={calls}
          onCallInitiated={handleCallInitiated}
        />
      );
    }
    return (
      <div className="text-xs text-v-muted font-mono select-none">
        Active view profile not found.
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-v-base text-v-text antialiased">
      {/* Sidebar navigation */}
      <Sidebar scenarios={scenarios} />

      {/* Main workspace */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Topbar />
        
        {/* Workspace views slot */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-v-base">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function Dashboard({
  initialScenarios,
  initialCalls,
}: DashboardProps) {
  return (
    <NavigationProvider>
      <DashboardInner
        initialScenarios={initialScenarios}
        initialCalls={initialCalls}
      />
    </NavigationProvider>
  );
}
