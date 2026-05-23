"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    if (!activeCallId) {
      const latestActive = calls.find(
        (call) => call.status === "queued" || call.status === "in-progress"
      );
      if (latestActive) {
        setActiveCallId(latestActive.call_id);
      }
    }
  }, [activeCallId, calls]);

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

  const headline = useMemo(() => {
    return scenarios.length ? "Voice AI Agent" : "Voice AI Agent";
  }, [scenarios.length]);

  return (
    <main className="px-6 py-8">
      <section className="mx-auto max-w-6xl fade-in">
        <header className="flex flex-col gap-2 rounded-xl border border-ops-border bg-ops-surface px-6 py-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-3 w-3 rounded-full bg-ops-accent shadow-glow" />
              <h1 className="text-lg font-semibold tracking-[0.24em] text-ops-text">
                ARIA
              </h1>
            </div>
            <span className="text-xs uppercase tracking-[0.32em] text-ops-muted">
              {headline} v1.0
            </span>
          </div>
          <p className="text-sm text-ops-muted">
            Launch outbound confirmations, monitor live status, and archive the
            call trail in one place.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
          <section className="fade-in fade-in-delay-1 rounded-xl border border-ops-border bg-ops-surface p-6 shadow-lg">
            <h2 className="text-xs uppercase tracking-[0.3em] text-ops-muted">
              Launch A Call
            </h2>
            <CallLauncher
              scenarios={scenarios}
              onCallInitiated={handleCallInitiated}
            />
          </section>

          <section className="fade-in fade-in-delay-2 space-y-6">
            <div className="rounded-xl border border-ops-border bg-ops-surface p-6 shadow-lg">
              <h2 className="text-xs uppercase tracking-[0.3em] text-ops-muted">
                Active Call
              </h2>
              <ActiveCallCard
                callId={activeCallId}
                onCallEnded={handleCallEnded}
              />
            </div>

            <div className="rounded-xl border border-ops-border bg-ops-surface p-6 shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xs uppercase tracking-[0.3em] text-ops-muted">
                  Call History
                </h2>
                <button
                  type="button"
                  onClick={refreshCalls}
                  className="rounded-md border border-ops-border bg-ops-elevated px-3 py-1 text-xs uppercase tracking-[0.2em] text-ops-muted transition hover:text-ops-text"
                >
                  {isRefreshing ? "Refreshing" : "Refresh"}
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
