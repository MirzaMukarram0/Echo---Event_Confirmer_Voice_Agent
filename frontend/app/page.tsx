import { headers } from "next/headers";

import Dashboard from "@/components/Dashboard";
import type { CallStatus, ScenarioInfo } from "@/lib/types";

function getBaseUrl(): string {
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

async function fetchScenarios(): Promise<ScenarioInfo[]> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/scenarios`, { cache: "no-store" });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as { scenarios: ScenarioInfo[] };
    return data.scenarios;
  } catch {
    return [];
  }
}

async function fetchCalls(): Promise<CallStatus[]> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/calls`, { cache: "no-store" });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as { calls: CallStatus[] };
    return data.calls;
  } catch {
    return [];
  }
}

export default async function Page() {
  const [scenarios, calls] = await Promise.all([fetchScenarios(), fetchCalls()]);

  return <Dashboard initialScenarios={scenarios} initialCalls={calls} />;
}
