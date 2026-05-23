"use client";

import { Fragment, useState } from "react";

import StatusBadge from "@/components/StatusBadge";
import type { CallStatus } from "@/lib/types";

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
      <div className="mt-6 rounded-lg border border-dashed border-ops-border/70 bg-ops-elevated/30 p-6 text-center text-sm text-ops-muted">
        No calls yet. Initiate a call to get started.
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-[0.2em] text-ops-muted">
            <th className="pb-3">Phone</th>
            <th className="pb-3">Scenario</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Duration</th>
            <th className="pb-3">Started</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => {
            const expanded = expandedIds.has(call.call_id);
            const duration =
              call.duration_seconds !== null && call.duration_seconds !== undefined
                ? `${Math.floor(call.duration_seconds / 60)}:${String(
                    call.duration_seconds % 60
                  ).padStart(2, "0")}`
                : "--";

            return (
              <Fragment key={call.call_id}>
                <tr className="border-t border-ops-border/50 text-ops-text">
                  <td className="py-3 font-mono text-xs text-ops-text">
                    {call.phone_number}
                  </td>
                  <td className="py-3 text-xs text-ops-text">
                    {call.scenario}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="py-3 font-mono text-xs text-ops-muted">
                    {duration}
                  </td>
                  <td className="py-3 font-mono text-xs text-ops-muted">
                    {call.started_at
                      ? new Date(call.started_at).toLocaleString()
                      : "--"}
                  </td>
                  <td className="py-3">
                    {call.transcript ? (
                      <button
                        type="button"
                        onClick={() => toggleTranscript(call.call_id)}
                        className="text-xs uppercase tracking-[0.2em] text-ops-accent"
                      >
                        {expanded ? "Hide" : "View"}
                      </button>
                    ) : (
                      <span className="text-xs text-ops-muted">--</span>
                    )}
                  </td>
                </tr>
                {expanded && call.transcript && (
                  <tr className="border-b border-ops-border/50">
                    <td colSpan={6} className="pb-4 pt-2">
                      <div className="rounded-md border border-ops-border/60 bg-ops-elevated/40 p-3 text-sm text-ops-text">
                        {call.transcript}
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
