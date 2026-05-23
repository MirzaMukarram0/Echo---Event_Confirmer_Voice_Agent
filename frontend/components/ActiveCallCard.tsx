"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import StatusBadge from "./StatusBadge";
import { api } from "../lib/api";
import type { CallStatus, CallStatusType } from "../lib/types";

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
  const [isEnding, setIsEnding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStatusRef = useRef<CallStatusType | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const fetchCall = async () => {
      if (!callId) {
        setCall(null);
        return;
      }
      try {
        const data = await api.getCall(callId);
        if (!cancelled) {
          setCall(data);
          setError(null);

          /* Stop polling once the call reaches a terminal state */
          if (
            (data.status === "ended" || data.status === "failed") &&
            interval
          ) {
            clearInterval(interval);
            interval = null;
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Unable to load call.";
          setError(message);
        }
      }
    };

    fetchCall();

    if (callId) {
      interval = setInterval(fetchCall, 3000);
    }

    return () => {
      cancelled = true;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [callId]);

  /* Live timer — only runs while call is in-progress */
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (call?.status === "in-progress") {
      setElapsedSeconds(0);
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

  /* Notify parent only on *transition* to ended/failed (not on initial load) */
  useEffect(() => {
    const currentStatus = call?.status ?? null;
    const prev = prevStatusRef.current;

    if (
      currentStatus &&
      (currentStatus === "ended" || currentStatus === "failed") &&
      prev !== null &&
      prev !== currentStatus
    ) {
      onCallEnded();
    }

    prevStatusRef.current = currentStatus;
  }, [call?.status, onCallEnded]);

  const handleEndCall = async () => {
    if (!callId || isEnding) return;
    setIsEnding(true);
    try {
      await api.endCall(callId);
      onCallEnded();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to end call.";
      setError(message);
    } finally {
      setIsEnding(false);
    }
  };

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
                  ? "bg-ops-muted pulse-dot"
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
              {!call && "Loading..."}
            </span>
          </div>
          <p className="mt-2 font-mono text-xs text-ops-muted">{callId}</p>
        </div>
        {call?.status && <StatusBadge status={call.status} />}
      </div>
      <div className="glass-panel rounded-lg border border-ops-border/60 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-ops-muted">Call ID</span>
              <span className="font-mono text-xs text-ops-text">
                {call?.call_id?.slice(0, 8)}…{call?.call_id?.slice(-4)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-ops-muted">Status</span>
              <span
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold ${
                  call?.status === "in-progress"
                    ? "border-ops-status-active/30 bg-ops-status-active/10 text-ops-status-active shadow-[0_0_10px_rgba(16,185,129,0.2)] heartbeat"
                    : call?.status === "ended"
                    ? "border-ops-accent/30 bg-ops-accent/10 text-ops-accent"
                    : call?.status === "failed"
                    ? "border-ops-status-failed/30 bg-ops-status-failed/10 text-ops-status-failed"
                    : "border-ops-status-ended/30 bg-ops-status-ended/10 text-ops-status-ended"
                }`}
              >
                {call?.status === "in-progress" && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ops-status-active opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-ops-status-active"></span>
                  </span>
                )}
                {call?.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-ops-muted">Destination</span>
            <span className="font-mono text-sm text-ops-text">
              {call?.phone_number ?? "--"}
            </span>
          </div>

          {call?.transcript && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-ops-muted">Live Transcript</span>
              <div className="glass-input max-h-[200px] overflow-y-auto rounded-lg p-4 font-mono text-xs leading-relaxed text-ops-text/90 shadow-inner">
                {call.transcript}
              </div>
            </div>
          )}

          {call?.status === "in-progress" && (
            <div className="flex justify-center py-4">
              {/* Waveform animation for active calls */}
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-1 rounded-full bg-ops-status-active animate-waveform"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {call?.status === "in-progress" && (
        <button
          type="button"
          disabled={isEnding}
          onClick={handleEndCall}
          className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          {isEnding ? "Ending..." : "End Call"}
        </button>
      )}

      {call?.status === "ended" && call.cost !== null && call.cost !== undefined && (
        <div className="flex items-center gap-4 text-xs text-ops-muted">
          <span>
            Duration:{" "}
            <span className="font-mono text-ops-text">
              {call.duration_seconds
                ? `${Math.floor(call.duration_seconds / 60)}:${String(
                    call.duration_seconds % 60
                  ).padStart(2, "0")}`
                : "--"}
            </span>
          </span>
          <span>
            Cost:{" "}
            <span className="font-mono text-ops-text">
              ${call.cost.toFixed(4)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
