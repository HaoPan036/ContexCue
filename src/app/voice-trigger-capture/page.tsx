import { Mic2 } from "lucide-react";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { VoiceTriggerCard } from "@/components/VoiceTriggerCard";
import { demoData } from "@/lib/demo-data";

const privacyRules = [
  "Raw audio is never stored in V0.1.",
  "Transcript is used only for extraction.",
  "Sensitive or health related information requires confirmation and short TTL.",
  "Tone or prosody can only be used as low confidence metadata.",
  "Tone must not be used for psychological diagnosis or strong emotional claims."
];

export default function VoiceTriggerCapturePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] lg:items-end">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <PrivacyBadge value="mock" label="Transcript fixtures" />
            <PrivacyBadge value="private" label="No microphone input" />
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-slate-950">Capture Inbox</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            "Hi Jarvis" marks intentional capture, not a voice assistant session.
          </p>
        </div>

        <section className="card-shell p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
              <Mic2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Input boundary</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Fixed transcripts. No mic. No raw audio.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Privacy rules</p>
        <ul className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          {privacyRules.map((rule) => (
            <li key={rule} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4">
        {demoData.voiceTriggerExamples.map((trigger, index) => (
          <VoiceTriggerCard key={trigger.id} trigger={trigger} index={index} />
        ))}
      </div>
    </main>
  );
}
