"use client";

import React, { useMemo } from "react";
import PageHeader from "../ui/PageHeader";
import StatusBadge from "../StatusBadge";
import type { CallStatus, ScenarioInfo } from "../../lib/types";
import { useNavigation } from "../../lib/navigation";

interface OverviewViewProps {
  calls: CallStatus[];
  scenarios: ScenarioInfo[];
}

export default function OverviewView({ calls, scenarios }: OverviewViewProps) {
  const { setView } = useNavigation();

  // Statistics calculations
  const stats = useMemo(() => {
    const totalCalls = calls.length;
    const liveCalls = calls.filter(
      (c) => c.status === "in-progress" || c.status === "queued"
    ).length;

    const endedCalls = calls.filter((c) => c.status === "ended");
    const successRate =
      totalCalls > 0
        ? Math.round((endedCalls.length / totalCalls) * 100)
        : 0;

    const totalCost = calls.reduce((acc, c) => acc + (c.cost || 0), 0);
    const avgCost = totalCalls > 0 ? totalCost / totalCalls : 0;

    return {
      totalCalls,
      liveCalls,
      successRate,
      avgCost,
    };
  }, [calls]);

  // Recent 5 calls
  const recentCalls = useMemo(() => {
    return [...calls]
      .sort((a, b) => {
        const dateA = a.started_at ? new Date(a.started_at).getTime() : 0;
        const dateB = b.started_at ? new Date(b.started_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [calls]);

  const handleLaunchClick = () => {
    if (scenarios.length > 0) {
      setView(`scenario/${scenarios[0].id}`);
    } else {
      setView("settings");
    }
  };

  const getScenarioLabel = (id: string) => {
    const sc = scenarios.find((s) => s.id === id);
    return sc ? sc.label : id;
  };

  return (
    <div className="space-y-6 flex flex-col h-full overflow-y-auto pr-2 select-none">
      {/* Page Header */}
      <PageHeader
        title="Overview"
        description="Operational status of your Voice AI Agent and confirmation analytics."
        action={
          <button
            type="button"
            onClick={handleLaunchClick}
            className="h-8 px-3.5 bg-white text-[#0a0a0a] text-xs font-semibold rounded-md hover:bg-[#e5e5e5] transition-colors flex items-center gap-1.5"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
            <span>New Call</span>
          </button>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Total Calls */}
        <div className="bg-v-card border border-v-border rounded-lg p-5">
          <p className="text-sm text-v-muted mb-3 font-medium">Total Calls</p>
          <p className="text-3xl font-semibold text-v-white leading-none mb-2 font-mono">
            {stats.totalCalls}
          </p>
          <p className="text-xs text-v-faint">Lifetime processed</p>
        </div>

        {/* Live Calls */}
        <div className="bg-v-card border border-v-border rounded-lg p-5">
          <p className="text-sm text-v-muted mb-3 font-medium">Live Calls</p>
          <p className="text-3xl font-semibold text-v-white leading-none mb-2 font-mono">
            {stats.liveCalls}
          </p>
          <p className="text-xs text-v-faint">Currently connected</p>
        </div>

        {/* Success Rate */}
        <div className="bg-v-card border border-v-border rounded-lg p-5">
          <p className="text-sm text-v-muted mb-3 font-medium">Answered Rate</p>
          <p className="text-3xl font-semibold text-v-white leading-none mb-2 font-mono">
            {stats.successRate}%
          </p>
          <p className="text-xs text-v-faint">Connection completion</p>
        </div>

        {/* Avg Cost */}
        <div className="bg-v-card border border-v-border rounded-lg p-5">
          <p className="text-sm text-v-muted mb-3 font-medium">Avg Cost / Call</p>
          <p className="text-3xl font-semibold text-v-white leading-none mb-2 font-mono">
            ${stats.avgCost.toFixed(3)}
          </p>
          <p className="text-xs text-v-faint">Optimized Vapi pricing</p>
        </div>
      </div>

      {/* Recent call log activity table */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="px-1 py-2">
            <h3 className="text-xs font-semibold text-v-muted uppercase tracking-[0.05em]">
              Recent Call Activity
            </h3>
          </div>

          <div className="bg-v-card border border-v-border rounded-lg overflow-hidden mt-1">
            {recentCalls.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2 text-v-muted">
                <svg
                  className="w-8 h-8 text-v-faint animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.535-5.143-3.854-6.678-6.678l1.293-.97c.362-.271.527-.833.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                <span className="text-xs font-mono">No calls captured yet</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm select-none">
                  <thead>
                    <tr className="bg-v-hover border-b border-v-border text-v-muted text-xs font-medium">
                      <th className="px-5 py-3 w-[180px]">Timestamp</th>
                      <th className="px-5 py-3">Scenario</th>
                      <th className="px-5 py-3">Destination</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-v-border">
                    {recentCalls.map((call) => (
                      <tr
                        key={call.call_id}
                        className="hover:bg-v-hover transition-colors font-sans"
                      >
                        <td className="px-5 py-3.5 text-v-muted whitespace-nowrap font-mono text-xs">
                          {call.started_at
                            ? new Date(call.started_at).toLocaleTimeString(
                                undefined,
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }
                              )
                            : "--"}
                        </td>
                        <td className="px-5 py-3.5 text-v-sub font-medium whitespace-nowrap">
                          {getScenarioLabel(call.scenario)}
                        </td>
                        <td className="px-5 py-3.5 text-v-text font-mono">
                          {call.phone_number}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={call.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right text-v-sub whitespace-nowrap font-mono text-xs">
                          {call.cost !== null ? `$${call.cost.toFixed(4)}` : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {recentCalls.length > 0 && (
          <div className="text-right mt-2 px-1">
            <button
              type="button"
              onClick={() => setView("logs")}
              className="text-xs font-semibold text-v-sub hover:text-v-white transition-colors"
            >
              View Full History Logs ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
