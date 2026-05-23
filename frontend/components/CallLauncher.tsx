"use client";

import { useMemo, useState } from "react";

import ScenarioConfigurator from "@/components/ScenarioConfigurator";
import { api } from "@/lib/api";
import type { ScenarioField, ScenarioInfo, ScenarioType } from "@/lib/types";

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

  const requiredMissing = useMemo(() => {
    return fields
      .filter((field) => field.required)
      .some((field) => !scenarioConfig[field.key]?.trim());
  }, [fields, scenarioConfig]);

  const handleScenarioChange = (value: ScenarioType) => {
    setSelectedScenario(value);
    setScenarioConfig({});
  };

  const handleSubmit = async () => {
    setError(null);
    if (!phoneNumber.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (requiredMissing) {
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
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-ops-muted">
          Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder="+1 415 555 0123"
          className="w-full rounded-md border border-ops-border bg-ops-elevated px-4 py-3 font-mono text-sm text-ops-text outline-none transition focus:border-ops-accent"
        />
        <p className="text-xs text-ops-muted">
          Use E.164 format, including country code.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-ops-muted">
          Scenario
        </label>
        <select
          value={selectedScenario}
          onChange={(event) => handleScenarioChange(event.target.value as ScenarioType)}
          className="w-full rounded-md border border-ops-border bg-ops-elevated px-4 py-3 text-sm text-ops-text outline-none transition focus:border-ops-accent"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.label}
            </option>
          ))}
        </select>
        {activeScenario?.description && (
          <p className="text-xs text-ops-muted">{activeScenario.description}</p>
        )}
      </div>

      <ScenarioConfigurator
        fields={fields}
        values={scenarioConfig}
        onChange={(key, value) =>
          setScenarioConfig((prev) => ({ ...prev, [key]: value }))
        }
      />

      <div className="space-y-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="w-full rounded-md bg-ops-accent px-4 py-3 text-sm font-semibold text-ops-bg shadow-glow transition active:scale-[0.98]"
        >
          {isSubmitting ? "Connecting..." : "Initiate Call"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
