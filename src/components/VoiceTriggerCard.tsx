import { CheckCircle2, FileText, MicOff, ShieldCheck } from "lucide-react";
import { titleCase } from "@/lib/demo-data";
import type { VoiceTriggerExample } from "@/types";
import { PrivacyBadge } from "@/components/PrivacyBadge";

function StorageRow({ label, stored }: { label: string; stored: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
          stored
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        {stored ? "Stored" : "Not stored"}
      </span>
    </div>
  );
}

export function VoiceTriggerCard({ trigger, index }: { trigger: VoiceTriggerExample; index: number }) {
  return (
    <article className="card-shell p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">
            Simulated trigger {index + 1}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">
            {titleCase(trigger.parsedIntent)}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrivacyBadge value={trigger.sensitivity} label={`${titleCase(trigger.sensitivity)} sensitivity`} />
          <PrivacyBadge
            value={trigger.confirmationRequired ? "pending_confirmation" : "active"}
            label={trigger.confirmationRequired ? "Confirmation required" : "No confirmation"}
          />
        </div>
      </div>

      <div className="mt-4 rounded-md border border-indigo-100 bg-indigo-50 p-3">
        <div className="flex items-start gap-2">
          <FileText className="mt-1 h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Transcript</p>
            <p className="mt-1 text-sm font-medium leading-6 text-indigo-950">{trigger.transcript}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.44fr)]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Parsed intent</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">{titleCase(trigger.parsedIntent)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Extracted memory candidate</p>
            <p className="mt-1 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-800">
              {trigger.extractedMemoryCandidate}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Next reply change</p>
            <p className="mt-1 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-800">
              {trigger.nextReplyChange}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-md border border-slate-100 bg-white p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">MemoryGate decision</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-950">{titleCase(trigger.memoryGateDecision)}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              TTL: {trigger.ttlDays ? `${trigger.ttlDays} days` : "No automatic expiry"}
            </p>
          </div>

          <StorageRow label="Raw audio" stored={trigger.rawAudioStored} />
          <StorageRow label="Transcript" stored={trigger.transcriptStored} />

          <details className="group rounded-md border border-slate-100 bg-slate-50 p-3">
            <summary className="cursor-pointer text-xs font-semibold text-slate-600 group-open:text-indigo-700">
              Privacy reason
            </summary>
            <p className="mt-2 text-xs leading-5 text-slate-600">{trigger.privacyReason}</p>
          </details>

          <details className="group rounded-md border border-amber-100 bg-amber-50 p-3">
            <summary className="cursor-pointer text-xs font-semibold text-amber-900">
              Tone safety
            </summary>
            <div className="flex items-start gap-2">
              <MicOff className="mt-1 h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
              <p className="text-xs leading-5 text-amber-900">{trigger.toneMetadataNote}</p>
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}
