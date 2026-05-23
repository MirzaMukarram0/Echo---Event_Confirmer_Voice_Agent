"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "../ui/PageHeader";

interface HealthData {
  status: string;
  version: string;
  environment: string;
  vapi_configured: boolean;
}

export default function SettingsView() {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 flex flex-col h-full overflow-y-auto pr-2 select-none">
      {/* Page Header */}
      <PageHeader
        title="Settings"
        description="Overview of active integrations, voice agent parameters, and webhook triggers."
      />

      {/* Grid Layout for Settings Card Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Column 1 */}
        <div className="space-y-6">
          {/* Voice AI Infrastructure */}
          <div className="bg-v-card border border-v-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-v-border select-none">
              <h3 className="text-xs font-semibold text-v-faint uppercase tracking-[0.05em]">
                Voice AI Infrastructure
              </h3>
            </div>

            <div className="divide-y divide-v-border font-mono text-sm">
              {/* Vapi API Status */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0 select-none">
                <span className="text-v-muted font-sans font-normal">Vapi API Status</span>
                <span className="text-v-white font-sans font-medium flex items-center gap-1.5">
                  {health?.vapi_configured ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-v-green animate-pulse-dot" />
                      <span className="text-v-green text-xs font-mono">Connected</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-v-red" />
                      <span className="text-v-red text-xs font-mono">Unconfigured</span>
                    </>
                  )}
                </span>
              </div>

              {/* Outbound number */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0 select-none">
                <span className="text-v-muted font-sans font-normal">Outbound Number</span>
                <span className="text-v-white tracking-wider font-semibold">
                  +1 (313) 344-2416
                </span>
              </div>

              {/* LLM provider */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0 select-none">
                <span className="text-v-muted font-sans font-normal">Core LLM Provider</span>
                <span className="text-v-white font-sans font-medium">OpenAI (gpt-4o-mini)</span>
              </div>

              {/* Speech synthesis */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0 select-none">
                <span className="text-v-muted font-sans font-normal">Speech Synthesis</span>
                <span className="text-v-white font-sans font-medium">PlayHT (Jennifer)</span>
              </div>
            </div>
          </div>

          {/* Webhooks & Environment */}
          <div className="bg-v-card border border-v-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-v-border select-none">
              <h3 className="text-xs font-semibold text-v-faint uppercase tracking-[0.05em]">
                Webhooks & Environment
              </h3>
            </div>

            <div className="divide-y divide-v-border font-mono text-sm">
              {/* App Environment */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0 select-none">
                <span className="text-v-muted font-sans font-normal">Environment</span>
                <span className="text-v-white uppercase font-semibold">
                  {health?.environment || "development"}
                </span>
              </div>

              {/* App Version */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0 select-none">
                <span className="text-v-muted font-sans font-normal">App Version</span>
                <span className="text-v-white">
                  {health?.version || "1.0.0"}
                </span>
              </div>

              {/* Webhook Endpoint */}
              <div className="flex flex-col gap-1.5 px-5 py-4 border-b border-v-border last:border-0">
                <span className="text-v-muted font-sans font-normal select-none">Webhook Endpoint URL</span>
                <div className="bg-v-input border border-v-border-i rounded-md p-2.5 text-v-text break-all text-xs select-all">
                  https://your-app.railway.app/api/v1/webhooks
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {/* Voice Agent Settings */}
          <div className="bg-v-card border border-v-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-v-border select-none">
              <h3 className="text-xs font-semibold text-v-faint uppercase tracking-[0.05em]">
                Voice Agent Settings (Aria)
              </h3>
            </div>

            <div className="divide-y divide-v-border font-mono text-sm">
              {/* Agent persona */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0 select-none">
                <span className="text-v-muted font-sans font-normal">Agent Persona</span>
                <span className="text-v-white font-sans font-medium">Aria (Confirmation Specialist)</span>
              </div>

              {/* Max call duration */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0 select-none">
                <span className="text-v-muted font-sans font-normal">Max Call Duration</span>
                <span className="text-v-white">180s</span>
              </div>

              {/* Terminal Phrases */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0 select-none">
                <span className="text-v-muted font-sans font-normal">Terminal Phrases</span>
                <span className="text-v-white">goodbye, bye, exit, cancel</span>
              </div>
            </div>
          </div>

          {/* System Operational Limits */}
          <div className="bg-v-card border border-v-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-v-border select-none">
              <h3 className="text-xs font-semibold text-v-faint uppercase tracking-[0.05em]">
                Operational Limitations
              </h3>
            </div>

            <div className="divide-y divide-v-border font-mono text-sm select-none">
              {/* Concurrency channel */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0">
                <span className="text-v-muted font-sans font-normal">Channel Concurrency</span>
                <span className="text-v-white font-semibold">1 active channel (free tier)</span>
              </div>

              {/* Languages */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0">
                <span className="text-v-muted font-sans font-normal">Languages Configured</span>
                <span className="text-v-white font-sans">English (US) / Urdu (PK)</span>
              </div>

              {/* Dial budget */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0">
                <span className="text-v-muted font-sans font-normal">Roundtrip Latency Budget</span>
                <span className="text-v-white font-semibold">~1.2s (outbound dial)</span>
              </div>

              {/* Max retries */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-v-border last:border-0">
                <span className="text-v-muted font-sans font-normal">Connection Retries</span>
                <span className="text-v-white">3 attempts max</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
