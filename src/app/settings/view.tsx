"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, LockKeyhole, RefreshCw, Server, SlidersHorizontal } from "lucide-react";
import type { ApiRuntimeSettings } from "@/types";

const fallbackSettings: ApiRuntimeSettings = {
  provider: "openai",
  apiSurface: "responses",
  model: null,
  hasApiKey: false,
  keySource: "OPENAI_API_KEY",
  modelSource: "OPENAI_MODEL"
};

export function ApiSettings() {
  const [settings, setSettings] = useState<ApiRuntimeSettings>(fallbackSettings);
  const [loading, setLoading] = useState(true);

  async function loadSettings() {
    setLoading(true);
    try {
      const response = await fetch("/api/settings/openai", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load API settings.");
      }
      setSettings((await response.json()) as ApiRuntimeSettings);
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
    { label: "Model", value: settings.model ?? "Set OPENAI_MODEL on the server" },
    { label: "Key source", value: settings.keySource }
  ];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f2ec] px-4 py-8 text-[#111111] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-normal text-[#746f65]">Runtime setup</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#111111]">API Settings</h1>
          <p className="mt-3 text-base leading-7 text-[#514b43]">
            ContextCue is prepared for OpenAI API development. Secrets stay on the server; the browser only sees whether runtime configuration is ready.
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
                  <h2 className="text-lg font-semibold text-[#111111]">OpenAI runtime</h2>
                  <p className="mt-1 text-sm leading-6 text-[#6b675f]">
                    Use environment variables for credentials and model selection. Do not store API keys in localStorage.
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  settings.hasApiKey ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                }`}
              >
                {settings.hasApiKey ? "Ready" : "Missing key"}
              </span>
            </div>

            <dl className="mt-6 grid gap-3">
              {rows.map((row) => (
                <div key={row.label} className="grid gap-1 rounded-xl border border-[#eee7dc] bg-[#faf8f4] p-3 sm:grid-cols-[150px_1fr] sm:items-center">
                  <dt className="text-xs font-semibold uppercase tracking-normal text-[#746f65]">{row.label}</dt>
                  <dd className="font-mono text-sm text-[#26231f]">{row.value}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => void loadSettings()}
              className="focus-ring mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#d8d1c5] bg-white px-4 text-sm font-semibold text-[#312d27] shadow-sm transition hover:bg-[#faf8f4]"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh status
            </button>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-[#ded6ca] bg-white/75 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-[#128c7e]" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-[#111111]">Secret boundary</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6b675f]">
                The settings UI never asks for or displays an API key. Future OpenAI calls should go through server routes only.
              </p>
            </section>

            <section className="rounded-2xl border border-[#ded6ca] bg-white/75 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#128c7e]" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-[#111111]">Reserved AI jobs</h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#6b675f]">
                <li>Extract memory candidates from messy context.</li>
                <li>Compress evidence into structured fields.</li>
                <li>Suggest MemoryGate actions with user confirmation.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-[#ded6ca] bg-white/75 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                {settings.hasApiKey ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                ) : (
                  <Server className="h-4 w-4 text-amber-700" aria-hidden="true" />
                )}
                <h2 className="text-sm font-semibold text-[#111111]">Local env</h2>
              </div>
              <p className="mt-2 font-mono text-xs leading-6 text-[#514b43]">
                OPENAI_API_KEY={settings.hasApiKey ? "configured" : "not configured"}
                <br />
                OPENAI_MODEL={settings.model ?? "not configured"}
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
