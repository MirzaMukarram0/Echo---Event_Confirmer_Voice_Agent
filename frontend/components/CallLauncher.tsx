"use client";

import { useMemo, useState } from "react";

import ScenarioConfigurator from "./ScenarioConfigurator";
import { api } from "../lib/api";
import type { ScenarioInfo, ScenarioType } from "../lib/types";

interface CallLauncherProps {
  scenarios: ScenarioInfo[];
  onCallInitiated: (callId: string) => void;
}

export default function CallLauncher({
  scenarios,
  onCallInitiated,
}: CallLauncherProps) {
  const initialScenario = scenarios[0]?.id ?? "event_registration";
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>(
    initialScenario
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [scenarioConfig, setScenarioConfig] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenario),
    [scenarios, selectedScenario]
  );

  const fields = activeScenario?.fields ?? [];

  const isFormValid = useMemo(() => {
    if (!phoneNumber.trim()) return false;
    return !fields
      .filter((field) => field.required)
      .some((field) => !scenarioConfig[field.key]?.trim());
  }, [fields, scenarioConfig, phoneNumber]);

  const handleScenarioChange = (value: ScenarioType) => {
    setSelectedScenario(value);
    setScenarioConfig({});
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!phoneNumber.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!isFormValid) {
      setError("Please fill in all required scenario fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.initiateCall({
        phone_number: phoneNumber.trim(),
        scenario: selectedScenario,
        scenario_config: scenarioConfig,
      });
      onCallInitiated(response.call_id);
      setPhoneNumber("");
      setScenarioConfig({});
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start call.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-1.5 relative group">
        <label
          htmlFor="phone-input"
          className="text-[10px] uppercase tracking-[0.2em] text-ops-muted transition-colors group-focus-within:text-ops-accent"
        >
          Phone Number
        </label>
        <div className="relative">
          <input
            id="phone-input"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+1 415 555 0123"
            className="glass-input w-full rounded-lg px-4 py-3 font-mono text-sm text-ops-text outline-none placeholder:text-ops-muted/40"
          />
          {/* Subtle accent line on focus */}
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-ops-accent transition-all duration-300 group-focus-within:w-full" />
        </div>
        <p className="text-[10px] text-ops-muted/70 pt-1">
          E.164 format with country code required.
        </p>
      </div>

      <div className="space-y-1.5 relative group">
        <label
          htmlFor="scenario-select"
          className="text-[10px] uppercase tracking-[0.2em] text-ops-muted transition-colors group-focus-within:text-ops-accent"
        >
          Scenario Profile
        </label>
        <div className="relative">
          <select
            id="scenario-select"
            value={selectedScenario}
            onChange={(event) => handleScenarioChange(event.target.value as ScenarioType)}
            className="glass-input w-full rounded-lg px-4 py-3 text-sm text-ops-text outline-none appearance-none"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select>
          {/* Custom select arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ops-accent">
            ▼
          </div>
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-ops-accent transition-all duration-300 group-focus-within:w-full" />
        </div>
        {activeScenario?.description && (
          <p className="text-[10px] text-ops-muted/70 pt-1">{activeScenario.description}</p>
        )}
      </div>

      <div className="pt-2">
        <ScenarioConfigurator
          fields={fields}
          values={scenarioConfig}
          onChange={(key, value) =>
            setScenarioConfig((prev) => ({ ...prev, [key]: value }))
          }
        />
      </div>

      <div className="pt-6 space-y-3">
        <button
          type="button"
          disabled={isSubmitting || !isFormValid}
          onClick={handleSubmit}
          className="group relative w-full overflow-hidden rounded-lg bg-ops-elevated border border-ops-accent/30 px-4 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-ops-accent transition-all hover:bg-ops-accent/10 hover:shadow-glow hover:border-ops-accent active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-ops-elevated disabled:hover:shadow-none disabled:active:scale-100 disabled:border-ops-border disabled:text-ops-muted"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ops-accent border-r-transparent" />
                Initializing...
              </>
            ) : (
              <>
                <span className="opacity-70 group-hover:opacity-100 transition-opacity">▶</span> Execute Call
              </>
            )}
          </span>
          {/* Button Hover gradient effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ops-accent/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
        </button>
        {error && <p className="text-[11px] text-ops-status-failed text-center bg-ops-status-failed/10 py-2 rounded border border-ops-status-failed/20">{error}</p>}
      </div>
    </div>
  );
}
