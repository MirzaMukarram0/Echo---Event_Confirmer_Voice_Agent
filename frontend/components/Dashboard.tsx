"use client";

import { useCallback, useEffect, useState } from "react";

import ActiveCallCard from "@/components/ActiveCallCard";
import CallHistoryTable from "@/components/CallHistoryTable";
import CallLauncher from "@/components/CallLauncher";
import { api } from "@/lib/api";
import type { CallStatus, ScenarioInfo } from "@/lib/types";

interface DashboardProps {
  initialScenarios: ScenarioInfo[];
  initialCalls: CallStatus[];
}

export default function Dashboard({
  initialScenarios,
  initialCalls,
}: DashboardProps) {
  const [scenarios] = useState<ScenarioInfo[]>(initialScenarios);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [calls, setCalls] = useState<CallStatus[]>(initialCalls);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* On mount, if there's already an active call in the initial data, show it */
  useEffect(() => {
    if (!activeCallId) {
      const latestActive = calls.find(
        (call) => call.status === "queued" || call.status === "in-progress"
      );
      if (latestActive) {
        setActiveCallId(latestActive.call_id);
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCalls = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await api.listCalls();
      setCalls(data.calls);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleCallInitiated = useCallback(
    async (callId: string) => {
      setActiveCallId(callId);
      await refreshCalls();
    },
    [refreshCalls]
  );

  const handleCallEnded = useCallback(async () => {
    await refreshCalls();
  }, [refreshCalls]);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl fade-in">
        <header className="glass-panel flex flex-col gap-2 rounded-2xl px-6 py-6 lg:px-8 relative overflow-hidden">
          {/* Subtle decorative glow in header */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ops-accent/10 blur-[80px] pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <span className="pulse-dot inline-flex h-3 w-3 rounded-full bg-ops-accent shadow-glow" />
              <h1 className="text-xl font-bold tracking-[0.2em] text-ops-text">
                ECHO <span className="font-light text-ops-accent opacity-80">//</span> OPS
              </h1>
            </div>
            <span className="rounded-full border border-ops-accent/30 bg-ops-accent/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-ops-accent font-mono backdrop-blur-md">
              System Online
            </span>
          </div>
          <p className="text-sm text-ops-muted mt-2 relative z-10 max-w-2xl leading-relaxed">
            Outbound confirmation intelligence. Monitor live connections, deploy scenarios, and review interaction logs.
          </p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.5fr] items-start">
          <section className="fade-in fade-in-delay-1 glass-panel rounded-2xl p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-ops-accent/5 rounded-bl-full blur-2xl pointer-events-none" />
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-ops-accent mb-6">
              <span className="h-px w-4 bg-ops-accent/50" />
              Launch Protocol
            </h2>
            <CallLauncher
              scenarios={scenarios}
              onCallInitiated={handleCallInitiated}
            />
          </section>

          <section className="fade-in fade-in-delay-2 space-y-8">
            <div className="glass-panel rounded-2xl p-6 lg:p-8">
              <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-ops-muted mb-6">
                <span className="h-px w-4 bg-ops-muted/30" />
                Live Monitoring
              </h2>
              <ActiveCallCard
                callId={activeCallId}
                onCallEnded={handleCallEnded}
              />
            </div>

            <div className="glass-panel rounded-2xl p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-ops-muted">
                  <span className="h-px w-4 bg-ops-muted/30" />
                  Interaction Logs
                </h2>
                <button
                  type="button"
                  onClick={refreshCalls}
                  disabled={isRefreshing}
                  className="rounded-lg border border-ops-border bg-ops-surface px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ops-muted transition-all hover:text-ops-text hover:border-ops-accent/50 hover:bg-ops-elevated disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isRefreshing ? "Syncing..." : "Sync Logs"}
                </button>
              </div>
              <CallHistoryTable calls={calls} />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
