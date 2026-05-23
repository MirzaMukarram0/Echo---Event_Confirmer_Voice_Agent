"use client";

import { Fragment, useState } from "react";

import StatusBadge from "./StatusBadge";
import type { CallStatus } from "../lib/types";

interface CallHistoryTableProps {
  calls: CallStatus[];
}

export default function CallHistoryTable({ calls }: CallHistoryTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleTranscript = (callId: string) => {
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

  if (!calls.length) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed border-ops-border bg-ops-surface/20 text-sm text-ops-muted backdrop-blur-sm">
        No calls found. Initiate your first call to begin.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-ops-border bg-ops-surface/30 backdrop-blur-sm">
      <table className="w-full text-left text-sm text-ops-text">
        <thead className="bg-ops-elevated/80 text-[10px] uppercase tracking-[0.2em] text-ops-muted">
          <tr>
            <th className="px-6 py-4 font-medium border-b border-ops-border">Created At</th>
            <th className="px-6 py-4 font-medium border-b border-ops-border">Scenario</th>
            <th className="px-6 py-4 font-medium border-b border-ops-border">Destination</th>
            <th className="px-6 py-4 font-medium border-b border-ops-border">Status</th>
            <th className="px-6 py-4 font-medium border-b border-ops-border">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ops-border">
          {calls.map((call) => {
            const expanded = expandedIds.has(call.call_id);
            return (
              <Fragment key={call.call_id}>
                <tr className="group transition-colors hover:bg-ops-elevated/50">
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-[11px] text-ops-muted group-hover:text-ops-text transition-colors">
                    {call.started_at ? new Date(call.started_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }) : "--"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="rounded bg-ops-border/50 px-2 py-1 text-[10px] font-mono tracking-wider text-ops-accent">
                      {call.scenario}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs">
                    {call.phone_number}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] ${
                        call.status === "ended"
                          ? "border-ops-accent/30 bg-ops-accent/10 text-ops-accent"
                          : call.status === "failed"
                          ? "border-ops-status-failed/30 bg-ops-status-failed/10 text-ops-status-failed"
                          : call.status === "in-progress"
                          ? "border-ops-status-active/30 bg-ops-status-active/10 text-ops-status-active shadow-[0_0_10px_rgba(16,185,129,0.2)] heartbeat"
                          : "border-ops-status-ended/30 bg-ops-status-ended/10 text-ops-status-ended"
                      }`}
                    >
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    {call.transcript || call.ended_reason ? (
                      <button
                        type="button"
                        onClick={() => toggleTranscript(call.call_id)}
                        className="text-[10px] uppercase tracking-[0.2em] text-ops-accent transition-opacity hover:opacity-70"
                      >
                        {expanded ? "Hide Details" : "View Details"}
                      </button>
                    ) : (
                      <span className="text-xs text-ops-muted">--</span>
                    )}
                  </td>
                </tr>
                {expanded && (call.transcript || call.ended_reason) && (
                  <tr className="border-b border-ops-border/50 bg-ops-elevated/20">
                    <td colSpan={5} className="px-6 pb-4 pt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {call.ended_reason && (
                          <div className="rounded-lg border border-ops-border/60 bg-ops-surface/50 p-4">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-ops-muted mb-2">Summary</h4>
                            <p className="text-sm text-ops-text/90 leading-relaxed">{call.ended_reason}</p>
                          </div>
                        )}
                        {call.transcript && (
                          <div className="rounded-lg border border-ops-border/60 bg-ops-surface/50 p-4">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-ops-muted mb-2">Transcript</h4>
                            <p className="font-mono text-xs text-ops-text/90 leading-relaxed max-h-[150px] overflow-y-auto pr-2">{call.transcript}</p>
                          </div>
                        )}
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
  );
}
