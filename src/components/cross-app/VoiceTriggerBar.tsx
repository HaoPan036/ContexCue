"use client";

import { Mic2, Play } from "lucide-react";
import type { VoiceCommand } from "@/types";

export function VoiceTriggerBar({
  command,
  transcriptVisible,
  onRun
}: {
  command: VoiceCommand;
  transcriptVisible: boolean;
  onRun: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
            <Mic2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">{command.label}</p>
            <p className="mt-1 truncate text-sm font-medium text-slate-950">
              {transcriptVisible ? command.transcript : "Hi Jarvis..."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {command.sampleCommands.map((sample) => (
                <span key={sample} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                  {sample}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRun}
          className="focus-ring inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Run voice trigger
        </button>
      </div>
    </section>
  );
}
