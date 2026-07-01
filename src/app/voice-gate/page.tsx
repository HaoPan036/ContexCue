import { Mic2 } from "lucide-react";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { VoiceGateCard } from "@/components/voice/VoiceGateCard";

const privacyRules = [
  "Speech-to-text runs through your browser's built-in engine, which sends audio to the browser vendor's cloud service for transcription — this is outside ContextCue's control. ContextCue itself never receives, stores, or uploads raw audio; only the resulting transcript text is used for extraction."
];

export default function VoiceGatePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] lg:items-end">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <PrivacyBadge value="private" label="Live microphone" />
            <PrivacyBadge value="sensitive" label="Browser transcription" />
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-slate-950">Voice Gate</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Intentional voice capture for one structured memory at a time.
          </p>
        </div>

        <section className="card-shell p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
              <Mic2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Input boundary</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Audio stays out of ContextCue storage.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Privacy rules</p>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
          {privacyRules.map((rule) => (
            <li key={rule} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <VoiceGateCard />
    </main>
  );
}
