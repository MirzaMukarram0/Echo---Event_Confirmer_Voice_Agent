"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { CallStatus } from "@/lib/types";

interface ActiveCallCardProps {
  callId: string | null;
  onCallEnded: () => void;
}

export default function ActiveCallCard({
  callId,
  onCallEnded,
}: ActiveCallCardProps) {
  const [call, setCall] = useState<CallStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const fetchCall = async () => {
      if (!callId) {
        setCall(null);
        return;
      }
      try {
        const data = await api.getCall(callId);
        setCall(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load call.";
        setError(message);
      }
    };

    fetchCall();

    if (callId) {
      interval = setInterval(fetchCall, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [callId]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (call?.status === "in-progress") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [call?.status]);

  useEffect(() => {
    if (call && (call.status === "ended" || call.status === "failed")) {
      onCallEnded();
    }
  }, [call, onCallEnded]);

  const durationLabel = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [elapsedSeconds]);

  if (!callId) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-ops-border/70 bg-ops-elevated/30 p-6 text-sm text-ops-muted">
        No active call yet. Launch a call to see live status.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                call?.status === "in-progress"
                  ? "bg-emerald-400 pulse-dot"
                  : call?.status === "queued"
                  ? "bg-ops-muted"
                  : call?.status === "failed"
                  ? "bg-red-400"
                  : "bg-slate-400"
              }`}
            />
            <span className="text-sm text-ops-text">
              {call?.status === "queued" && "Connecting..."}
              {call?.status === "in-progress" && "Live call in progress"}
              {call?.status === "ended" && "Call completed"}
              {call?.status === "failed" && "Call failed"}
            </span>
          </div>
          <p className="mt-2 font-mono text-xs text-ops-muted">{callId}</p>
        </div>
        {call?.status && <StatusBadge status={call.status} />}
      </div>

      <div className="grid gap-4 rounded-lg border border-ops-border/60 bg-ops-elevated/30 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ops-muted">
            Phone
          </p>
          <p className="mt-1 font-mono text-sm text-ops-text">
            {call?.phone_number ?? "--"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ops-muted">
            Scenario
          </p>
          <p className="mt-1 text-sm text-ops-text">{call?.scenario ?? "--"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ops-muted">
            Live Timer
          </p>
          <p className="mt-1 font-mono text-sm text-ops-text">
            {call?.status === "in-progress" ? durationLabel : "--"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ops-muted">
            Ended Reason
          </p>
          <p className="mt-1 text-sm text-ops-text">
            {call?.ended_reason ?? "--"}
          </p>
        </div>
      </div>

      {call?.status === "in-progress" && (
        <button
          type="button"
          onClick={() => api.endCall(callId)}
          className="rounded-md border border-ops-border bg-ops-elevated px-4 py-2 text-xs uppercase tracking-[0.25em] text-ops-muted transition hover:text-ops-text"
        >
          End Call
        </button>
      )}

      {call?.status === "ended" && call.transcript && (
        <div className="rounded-lg border border-ops-border/70 bg-ops-elevated/40 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-ops-muted">
            Transcript
          </p>
          <p className="mt-2 text-sm text-ops-text">{call.transcript}</p>
        </div>
      )}
    </div>
  );
}
