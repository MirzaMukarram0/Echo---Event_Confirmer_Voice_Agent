import type {
  CallStatus,
  InitiateCallRequest,
  InitiateCallResponse,
  ScenarioInfo,
} from "@/lib/types";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  getScenarios: () =>
    apiFetch<{ scenarios: ScenarioInfo[] }>("/api/scenarios"),

  initiateCall: (body: InitiateCallRequest) =>
    apiFetch<InitiateCallResponse>("/api/calls", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getCall: (callId: string) => apiFetch<CallStatus>(`/api/calls/${callId}`),

  listCalls: () => apiFetch<{ calls: CallStatus[]; total: number }>("/api/calls"),

  endCall: (callId: string) =>
    apiFetch<void>(`/api/calls/${callId}`, { method: "DELETE" }),
};
