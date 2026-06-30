"use client";

import { useEffect, useState } from "react";
import { KeyRound, LockKeyhole, RefreshCw, Route, SlidersHorizontal } from "lucide-react";
import type { ApiProviderReservation } from "@/types";

const fallbackSettings: ApiProviderReservation = {
  provider: "openai",
  apiSurface: "responses",
  status: "reserved",
  secretHandling: "server_only"
};

export function ApiSettings() {
  const [settings, setSettings] = useState<ApiProviderReservation>(fallbackSettings);
  const [loading, setLoading] = useState(true);

  async function loadSettings() {
    setLoading(true);
    try {
      const response = await fetch("/api/settings/openai", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load API reservation.");
      }
      setSettings((await response.json()) as ApiProviderReservation);
    } catch {
      setSettings(fallbackSettings);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  const rows = [
    { label: "Provider", value: "OpenAI" },
    { label: "API surface", value: "Responses API" },
    { label: "Status", value: "Reserved for server-side integration" },
    { label: "Secrets", value: "Server only" }
  ];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f2ec] px-4 py-8 text-[#111111] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-normal text-[#746f65]">Runtime boundary</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#111111]">API Settings</h1>
          <p className="mt-3 text-base leading-7 text-[#514b43]">
            ContextCue reserves OpenAI as the model provider, while keeping credentials and runtime state off the client.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.46fr)]">
          <section className="rounded-2xl border border-[#ded6ca] bg-white/75 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[#111111]">OpenAI provider reserved</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6b675f]">
                    This page intentionally does not expose key status, model names, environment variable names, or secret values.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#e7f8ee] px-2.5 py-1 text-xs font-semibold text-[#128c7e]">
                Reserved
              </span>
            </div>

            <dl className="mt-6 grid gap-3">
              {rows.map((row) => (
                <div key={row.label} className="grid gap-1 rounded-xl border border-[#eee7dc] bg-[#faf8f4] p-3 sm:grid-cols-[150px_1fr] sm:items-center">
                  <dt className="text-xs font-semibold uppercase tracking-normal text-[#746f65]">{row.label}</dt>
                  <dd className="text-sm font-semibold text-[#26231f]">{row.value}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => void loadSettings()}
              className="focus-ring mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#d8d1c5] bg-white px-4 text-sm font-semibold text-[#312d27] shadow-sm transition hover:bg-[#faf8f4]"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh reservation
            </button>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-[#ded6ca] bg-white/75 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-[#128c7e]" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-[#111111]">Secret boundary</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6b675f]">
                Future OpenAI calls should run through server routes. The browser should never receive API keys or sensitive runtime configuration.
              </p>
            </section>

            <section className="rounded-2xl border border-[#ded6ca] bg-white/75 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#128c7e]" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-[#111111]">Reserved AI jobs</h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#6b675f]">
                <li>Extract signal from scattered life context.</li>
                <li>Compress evidence into controlled memory candidates.</li>
                <li>Suggest MemoryGate actions before anything is saved.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-[#ded6ca] bg-white/75 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-[#128c7e]" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-[#111111]">Integration route</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6b675f]">
                Add server-only OpenAI calls behind dedicated API routes when extraction, compression, or MemoryGate assistance is implemented.
              </p>
              <p className="mt-3 font-mono text-xs text-[#514b43]">
                {settings.provider} · {settings.apiSurface} · {settings.secretHandling}
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
