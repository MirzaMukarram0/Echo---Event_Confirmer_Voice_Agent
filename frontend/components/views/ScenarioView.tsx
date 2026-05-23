"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { CallStatus, ScenarioInfo, ScenarioType } from "../../lib/types";
import { api } from "../../lib/api";
import { useNavigation } from "../../lib/navigation";
import PageHeader from "../ui/PageHeader";
import FormField from "../ui/FormField";
import StatusBadge from "../StatusBadge";

interface ScenarioViewProps {
  scenarioId: ScenarioType;
  scenarios: ScenarioInfo[];
  calls: CallStatus[];
  onCallInitiated: (callId: string) => void;
}

export default function ScenarioView({
  scenarioId,
  scenarios,
  calls,
  onCallInitiated,
}: ScenarioViewProps) {
  const { setView } = useNavigation();

  // Find scenario metadata
  const scenario = useMemo(() => {
    return scenarios.find((s) => s.id === scenarioId);
  }, [scenarios, scenarioId]);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [fieldsState, setFieldsState] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset local state when scenario changes
  useEffect(() => {
    setPhoneNumber("");
    setFieldsState({});
    setError(null);
    setSuccess(false);
  }, [scenarioId]);

  // Compute recent runs for this specific scenario profile
  const recentScenarioCalls = useMemo(() => {
    return calls
      .filter((c) => c.scenario === scenarioId)
      .sort((a, b) => {
        const dateA = a.started_at ? new Date(a.started_at).getTime() : 0;
        const dateB = b.started_at ? new Date(b.started_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [calls, scenarioId]);

  // Check if there is currently an active ongoing session for this scenario
  const activeScenarioCall = useMemo(() => {
    return calls.find(
      (c) =>
        c.scenario === scenarioId &&
        (c.status === "in-progress" || c.status === "queued")
    );
  }, [calls, scenarioId]);

  if (!scenario) {
    return (
      <div className="h-64 flex items-center justify-center text-v-muted border border-dashed border-v-border rounded-md font-mono text-xs">
        Scenario profile '{scenarioId}' not loaded
      </div>
    );
  }

  const fields = scenario.fields || [];

  const isFormValid = useMemo(() => {
    if (!phoneNumber.trim()) return false;
    return !fields
      .filter((f) => f.required)
      .some((f) => !fieldsState[f.key]?.trim());
  }, [fields, fieldsState, phoneNumber]);

  const handleFieldChange = (key: string, val: string) => {
    setFieldsState((prev) => ({ ...prev, [key]: val }));
    setError(null);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError("Target destination phone number is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setSuccess(false);

    try {
      const response = await api.initiateCall({
        phone_number: phoneNumber.trim(),
        scenario: scenarioId,
        scenario_config: fieldsState,
      });

      setSuccess(true);
      setTimeout(() => {
        onCallInitiated(response.call_id);
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Outbound call handshake failed.";
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full overflow-y-auto pr-2 select-none">
      {/* Page Header */}
      <PageHeader title={scenario.label} description={scenario.description} />

      <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-8 items-start">
        {/* Left Form Panel */}
        <form onSubmit={handleLaunch} className="space-y-6">
          {/* Call Destination Section */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-v-faint uppercase tracking-[0.05em] select-none border-b border-v-border pb-2">
              Call Destination
            </p>
            <FormField
              label="Phone Number"
              required
              hint="+92 300 1234567 (Must include country code, +92 for Pakistan)"
            >
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full h-[34px] px-3 bg-v-input border border-v-border-i rounded-md text-sm text-v-text placeholder:text-v-faint focus:outline-none focus:border-v-border-f transition-colors duration-100 font-mono"
              />
            </FormField>
          </div>

          <div className="border-t border-v-border my-2" />

          {/* Scenario Parameters Section */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-v-faint uppercase tracking-[0.05em] select-none border-b border-v-border pb-2">
              Scenario Parameters
            </p>
            {fields.length === 0 ? (
              <span className="text-xs text-v-muted italic select-none">
                No parameters required for this profile.
              </span>
            ) : (
              <div className="space-y-4">
                {fields.map((field) => (
                  <FormField
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    hint={field.placeholder}
                  >
                    <input
                      type={
                        field.type === "phone"
                          ? "tel"
                          : field.type === "date"
                          ? "date"
                          : "text"
                      }
                      required={field.required}
                      value={fieldsState[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      className={`w-full h-[34px] px-3 bg-v-input border border-v-border-i rounded-md text-sm text-v-text placeholder:text-v-faint focus:outline-none focus:border-v-border-f transition-colors duration-100 ${
                        field.type === "date" ? "date-input" : ""
                      }`}
                    />
                  </FormField>
                ))}
              </div>
            )}
          </div>

          {/* Error messages block */}
          {error && (
            <div className="text-xs text-v-red bg-v-red/10 border border-v-red/20 rounded-md p-3 select-none leading-relaxed">
              Error: {error}
            </div>
          )}

          {/* Primary Action Launch Button: WHITE background, BLACK text */}
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`w-full h-9 bg-v-white text-v-base text-sm font-semibold rounded-md hover:bg-[#e5e5e5] active:bg-[#d4d4d4] transition-colors flex items-center justify-center gap-2 select-none disabled:opacity-40 disabled:hover:bg-v-white disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-v-base border-r-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : success ? (
              <>
                <svg
                  className="w-4 h-4 text-v-base"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <span>Call Handshake Initiated</span>
              </>
            ) : (
              <span>Initiate Call</span>
            )}
          </button>
        </form>

        {/* Right-side Panel Stack — Fills the empty space perfectly! */}
        <div className="space-y-6">
          {/* Active Call Alert Banner */}
          {activeScenarioCall && (
            <div
              onClick={() => setView("monitor")}
              className="bg-v-active border border-v-green/30 hover:border-v-green/60 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-100"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-v-green animate-pulse-dot" />
                <span className="text-xs font-semibold text-v-white font-mono">
                  Active call in progress for this profile
                </span>
              </div>
              <span className="text-[10px] text-v-sub font-mono hover:text-v-white transition-colors">
                View Monitor ➔
              </span>
            </div>
          )}

          {/* How It Works Card */}
          <div className="bg-v-card border border-v-border rounded-lg p-5">
            <p className="text-xs font-semibold text-v-faint uppercase tracking-[0.05em] mb-3 select-none">
              How It Works
            </p>
            <p className="text-sm text-v-sub leading-relaxed font-sans select-none">
              Aria will call the destination using your provisioned outbound
              number, confirm the attendee's registration details in a natural
              conversation flow, and automatically sync confirmation logs back to your panel.
            </p>
          </div>

          {/* Recent Scenario Runs Card — FILLS THE EMPTY SPACE UNDERNEATH HOW IT WORKS */}
          <div className="bg-v-card border border-v-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-v-border select-none">
              <h3 className="text-xs font-semibold text-v-faint uppercase tracking-[0.05em]">
                Recent Scenario Runs
              </h3>
            </div>

            {recentScenarioCalls.length === 0 ? (
              <div className="p-6 text-center text-v-faint text-xs italic select-none">
                No past calls logged for this scenario.
              </div>
            ) : (
              <div className="divide-y divide-v-border font-mono text-xs select-none">
                {recentScenarioCalls.map((c) => (
                  <div
                    key={c.call_id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-v-hover/50 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-v-text font-semibold">
                        {c.phone_number}
                      </span>
                      <span className="text-[10px] text-v-faint">
                        {c.started_at
                          ? new Date(c.started_at).toLocaleTimeString(
                              undefined,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              }
                            )
                          : "--"}
                      </span>
                    </div>
                    <div>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
