"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import type { CallStatus, CallStatusType } from "../../lib/types";
import { api } from "../../lib/api";
import { useNavigation } from "../../lib/navigation";
import StatusBadge from "../StatusBadge";
import PageHeader from "../ui/PageHeader";

interface LiveMonitorViewProps {
  onCallEnded: () => void;
}

export default function LiveMonitorView({ onCallEnded }: LiveMonitorViewProps) {
  const { activeCallId, setActiveCallId } = useNavigation();
  const [call, setCall] = useState<CallStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStatusRef = useRef<CallStatusType | null>(null);
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null);

  // Poll for call status updates
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const fetchCall = async () => {
      if (!activeCallId) {
        setCall(null);
        return;
      }
      try {
        const data = await api.getCall(activeCallId);
        if (!cancelled) {
          setCall(data);
          setError(null);

          // Stop polling if call ends
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
          setError("Failed to sync call state.");
        }
      }
    };

    fetchCall();

    if (activeCallId) {
      interval = setInterval(fetchCall, 3000);
    }

    return () => {
      cancelled = true;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeCallId]);

  // Live timer counts elapsed seconds
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

  // Trigger state refresh on terminal transition
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

  // Auto-scroll transcript container
  useEffect(() => {
    if (transcriptBottomRef.current) {
      transcriptBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [call?.transcript]);

  const handleEndCall = async () => {
    if (!activeCallId || isEnding) return;
    setIsEnding(true);
    try {
      await api.endCall(activeCallId);
      setActiveCallId(null);
      onCallEnded();
    } catch {
      setError("Unable to cancel outbound session.");
    } finally {
      setIsEnding(false);
    }
  };

  const handleClearActive = () => {
    setActiveCallId(null);
  };

  const formattedTimer = useMemo(() => {
    const min = Math.floor(elapsedSeconds / 60);
    const sec = elapsedSeconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }, [elapsedSeconds]);

  if (!activeCallId) {
    return (
      <div className="space-y-6 flex flex-col h-full overflow-y-auto pr-2 select-none">
        <PageHeader title="Live Monitor" description="Real-time call tracking dashboard." />
        <div className="flex flex-col items-center justify-center h-72 gap-3 border border-dashed border-v-border rounded-lg select-none font-sans text-center px-4 bg-v-card/25">
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
              d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9v6h3.75l4.5 4.5V4.5L8.25 9H4.5z"
            />
          </svg>
          <span className="text-sm text-v-sub font-semibold">No Outbound Session Active</span>
          <span className="text-xs text-v-muted max-w-xs">
            Initiate a call from any scenario to begin monitoring live status.
          </span>
        </div>
      </div>
    );
  }

  // Parse lines in transcript to show dialogue
  const parsedTranscript = useMemo(() => {
    if (!call?.transcript) return [];
    return call.transcript
      .split("\n")
      .filter((line) => line.trim())
      .map((line, idx) => {
        const isAgent =
          line.toLowerCase().startsWith("assistant:") ||
          line.toLowerCase().startsWith("aria:");
        const isUser = line.toLowerCase().startsWith("user:");

        let speaker = "Unknown";
        let content = line;

        if (isAgent) {
          speaker = "Aria";
          content = line.substring(line.indexOf(":") + 1).trim();
        } else if (isUser) {
          speaker = "User";
          content = line.substring(line.indexOf(":") + 1).trim();
        }

        return {
          id: idx,
          speaker,
          content,
          isAgent,
          isUser,
        };
      });
  }, [call?.transcript]);

  return (
    <div className="space-y-6 flex flex-col h-full overflow-y-auto pr-2 select-none">
      {/* Page Header */}
      <PageHeader
        title="Live Monitor"
        description={`Session UUID: ${activeCallId}`}
      />

      {error && (
        <div className="text-xs text-v-red bg-v-red/10 border border-v-red/20 rounded-md p-3 select-none">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 items-stretch min-h-[380px]">
        {/* Connection Details Card */}
        <div className="bg-v-card border border-v-border rounded-lg flex flex-col justify-between overflow-hidden">
          <div>
            {/* Card internal header */}
            <div className="px-5 py-4 border-b border-v-border select-none">
              <h3 className="text-xs font-semibold text-v-faint uppercase tracking-[0.05em]">
                Operational Status
              </h3>
            </div>

            {/* Key-value rows */}
            <div className="divide-y divide-v-border">
              {/* Destination */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm text-v-muted">Destination Target</span>
                <span className="font-mono text-sm text-v-white select-all">
                  {call?.phone_number ?? "--"}
                </span>
              </div>

              {/* Scenario Profile */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm text-v-muted">Scenario Profile</span>
                <span className="text-sm text-v-white font-sans font-medium">
                  {call?.scenario
                    ? call.scenario
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")
                    : "--"}
                </span>
              </div>

              {/* Live Status Badge */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm text-v-muted">Session Status</span>
                {call?.status ? (
                  <StatusBadge status={call.status} />
                ) : (
                  <span className="text-sm text-v-faint">Connecting...</span>
                )}
              </div>

              {/* Duration / Waveform */}
              {call?.status === "in-progress" && (
                <div className="px-5 py-4 bg-v-base/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-v-muted">Call Duration</span>
                    <span className="font-mono text-sm text-v-white font-semibold flex items-center gap-1.5 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-v-green animate-pulse-dot" />
                      {formattedTimer}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1 h-6 select-none pt-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-full rounded-full bg-v-green animate-waveform"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Terminal Cost / Summary */}
              {call?.status === "ended" && (
                <div className="px-5 py-3.5 space-y-2 bg-v-base/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-v-muted">Total Duration:</span>
                    <span className="text-v-white font-mono">
                      {call.duration_seconds ? `${call.duration_seconds}s` : "--"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-v-muted">Financial Cost:</span>
                    <span className="text-v-white font-mono">
                      {call.cost !== null ? `$${call.cost.toFixed(4)}` : "--"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Destructive Cancel Button */}
          <div className="px-5 py-4 border-t border-v-border">
            {call?.status === "in-progress" || call?.status === "queued" ? (
              <button
                type="button"
                disabled={isEnding}
                onClick={handleEndCall}
                className="w-full h-8 px-3 border border-[#7f1d1d] text-v-red text-xs font-semibold rounded-md hover:bg-[#1c0a0a] transition-colors select-none"
              >
                {isEnding ? "Terminating active protocol..." : "Terminate Call"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClearActive}
                className="w-full h-8 px-3 border border-v-border-i text-v-muted text-xs font-semibold rounded-md hover:bg-v-hover hover:text-v-text transition-colors select-none"
              >
                Reset Monitor
              </button>
            )}
          </div>
        </div>

        {/* Live Transcript Stream */}
        <div className="bg-v-card border border-v-border rounded-lg flex flex-col justify-between overflow-hidden">
          {/* Card internal header */}
          <div className="px-5 py-4 border-b border-v-border flex items-center justify-between select-none">
            <h3 className="text-xs font-semibold text-v-faint uppercase tracking-[0.05em]">
              Transcript Stream
            </h3>
            {call?.status === "in-progress" && (
              <span className="text-[10px] font-bold text-v-green animate-pulse select-none">
                ● LIVE
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[350px] p-5 space-y-3.5">
            {parsedTranscript.length === 0 ? (
              <div className="h-full flex items-center justify-center text-v-faint text-xs italic font-sans select-none">
                {call?.status === "queued"
                  ? "Awaiting outbound connection handshake..."
                  : "Awaiting dialogue events..."}
              </div>
            ) : (
              parsedTranscript.map((t) => (
                <div
                  key={t.id}
                  className={`flex flex-col gap-1 p-3 rounded-md ${
                    t.isAgent
                      ? "bg-v-active border border-v-border select-none"
                      : "ml-4 border border-v-border/30 bg-v-input/40 select-none"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold tracking-widest uppercase ${
                      t.isAgent ? "text-v-white" : "text-v-muted"
                    }`}
                  >
                    {t.speaker}
                  </span>
                  <span className="text-sm text-v-text leading-relaxed font-sans font-normal">
                    {t.content}
                  </span>
                </div>
              ))
            )}
            <div ref={transcriptBottomRef} />
          </div>

          <div className="px-5 py-3 border-t border-v-border text-[10px] text-v-faint select-none">
            Audio processing powered by Vapi WebSocket connections.
          </div>
        </div>
      </div>
    </div>
  );
}
