"use client";

import React, { useState, useMemo, Fragment } from "react";
import type { CallStatus, ScenarioInfo } from "../../lib/types";
import StatusBadge from "../StatusBadge";
import { api } from "../../lib/api";
import PageHeader from "../ui/PageHeader";

interface LogsViewProps {
  initialCalls: CallStatus[];
  scenarios: ScenarioInfo[];
}

export default function LogsView({ initialCalls, scenarios }: LogsViewProps) {
  const [calls, setCalls] = useState<CallStatus[]>(initialCalls);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Filters
  const [selectedScenario, setSelectedScenario] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const syncLogs = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.listCalls();
      setCalls(data.calls);
    } catch {
      // Keep existing calls on failure
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleRow = (callId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(callId)) {
        next.delete(callId);
      } else {
        next.add(callId);
      }
      return next;
    });
  };

  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      const matchScenario =
        selectedScenario === "all" || call.scenario === selectedScenario;
      const matchStatus =
        selectedStatus === "all" || call.status === selectedStatus;
      return matchScenario && matchStatus;
    });
  }, [calls, selectedScenario, selectedStatus]);

  const getScenarioLabel = (id: string) => {
    const sc = scenarios.find((s) => s.id === id);
    return sc ? sc.label : id;
  };

  return (
    <div className="space-y-6 flex flex-col h-full overflow-y-auto pr-2 select-none">
      {/* Page Header */}
      <PageHeader
        title="Logs"
        description="Audit logs of outbound confirmations, speech-to-text transcriptions, and API call costs."
      />

      {/* Table Container */}
      <div className="bg-v-card border border-v-border rounded-lg overflow-hidden">
        {/* Vapi Filter / Command Bar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-v-border bg-v-card">
          <span className="text-xs text-v-muted font-medium">Filters:</span>

          {/* Scenario Filter Select */}
          <div className="relative">
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="h-8 px-3 pr-8 bg-v-input border border-v-border-i rounded-md text-xs text-v-text outline-none appearance-none font-medium hover:border-v-border-f transition-colors"
            >
              <option value="all">All Scenarios</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-v-muted text-[10px]">
              ▼
            </div>
          </div>

          {/* Status Filter Select */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 px-3 pr-8 bg-v-input border border-v-border-i rounded-md text-xs text-v-text outline-none appearance-none font-medium hover:border-v-border-f transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="in-progress">Live</option>
              <option value="ended">Ended</option>
              <option value="failed">Failed</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-v-muted text-[10px]">
              ▼
            </div>
          </div>

          <div className="flex-1" />

          {/* Sync Button — Vapi Ghost style */}
          <button
            type="button"
            disabled={isRefreshing}
            onClick={syncLogs}
            className="h-8 px-3.5 border border-v-border-i text-v-muted text-xs font-semibold rounded-md hover:bg-v-hover hover:text-v-text transition-colors flex items-center gap-1.5"
          >
            {isRefreshing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-v-muted border-r-transparent rounded-full animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
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
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                <span>Sync</span>
              </>
            )}
          </button>
        </div>

        {/* Data list table */}
        {filteredCalls.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-v-muted font-sans select-none">
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <span className="text-xs">No call logs matching search parameters</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm select-none border-collapse">
              <thead>
                <tr className="bg-v-hover/50 border-b border-v-border text-v-muted text-xs font-semibold select-none">
                  <th className="px-5 py-3 w-10 select-none">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-v-border-i bg-v-input accent-v-white"
                      disabled
                    />
                  </th>
                  <th className="px-5 py-3 w-[150px]">Call ID</th>
                  <th className="px-5 py-3">Scenario</th>
                  <th className="px-5 py-3">Phone Number</th>
                  <th className="px-5 py-3 w-[140px]">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-v-border font-sans">
                {filteredCalls.map((call) => {
                  const expanded = expandedIds.has(call.call_id);
                  return (
                    <Fragment key={call.call_id}>
                      <tr className="hover:bg-v-hover transition-colors">
                        <td className="px-5 py-3.5 select-none">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-v-border-i bg-v-input accent-v-white"
                            disabled
                          />
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-v-muted whitespace-nowrap">
                          {call.call_id.slice(0, 8)}…{call.call_id.slice(-4)}
                        </td>
                        <td className="px-5 py-3.5 text-v-text whitespace-nowrap font-medium">
                          {getScenarioLabel(call.scenario)}
                        </td>
                        <td className="px-5 py-3.5 text-v-text font-mono">
                          {call.phone_number}
                        </td>
                        <td className="px-5 py-3.5 text-v-muted">Outbound</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={call.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono">
                          <button
                            type="button"
                            onClick={() => toggleRow(call.call_id)}
                            className="text-xs font-semibold text-v-sub hover:text-v-white transition-colors"
                          >
                            {expanded ? "Hide Details" : "View Details"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Panel */}
                      {expanded && (
                        <tr className="bg-v-hover/10 border-b border-v-border">
                          <td colSpan={7} className="px-5 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
                              {/* Dialogue Transcript Container */}
                              <div className="space-y-2 pr-4 border-r border-v-border">
                                <p className="text-[10px] uppercase font-bold tracking-[0.05em] text-v-faint font-mono">
                                  Dialogue Transcript
                                </p>
                                <div className="bg-v-input/40 border border-v-border rounded-md p-4 max-h-48 overflow-y-auto font-mono text-xs leading-relaxed text-v-text space-y-3">
                                  {call.transcript ? (
                                    call.transcript
                                      .split("\n")
                                      .filter((line) => line.trim())
                                      .map((line, idx) => (
                                        <div key={idx} className="text-xs">
                                          {line}
                                        </div>
                                      ))
                                  ) : (
                                    <span className="italic text-v-faint select-none">
                                      No dialogue stream available.
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Metadata audit panel */}
                              <div className="space-y-4 font-mono text-xs text-v-muted">
                                <div>
                                  <p className="text-[10px] uppercase font-bold tracking-[0.05em] text-v-faint mb-2">
                                    Operational Metadata
                                  </p>
                                  <div className="bg-v-card border border-v-border rounded-md p-3.5 space-y-1.5 select-none">
                                    <div className="flex justify-between gap-4">
                                      <span>Session UUID:</span>
                                      <span className="text-v-text select-all truncate max-w-[140px]">
                                        {call.call_id}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Financial Cost:</span>
                                      <span className="text-v-text">
                                        {call.cost !== null
                                          ? `$${call.cost.toFixed(4)}`
                                          : "--"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Ended Reason:</span>
                                      <span className="text-v-text font-sans text-xs">
                                        {call.ended_reason || "--"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Recording audio trigger */}
                                {call.recording_url && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-bold tracking-[0.05em] text-v-faint">
                                      Audio Recording Playback
                                    </p>
                                    <audio
                                      src={call.recording_url}
                                      controls
                                      className="w-full max-h-8 text-xs select-none outline-none focus:outline-none"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination block */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-v-border text-xs text-v-muted select-none">
          <span>Page 1 of 1</span>
          <div className="flex items-center gap-2 select-none">
            <span>Rows per page</span>
            <select className="h-7 px-2 bg-v-input border border-v-border rounded text-xs outline-none">
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
