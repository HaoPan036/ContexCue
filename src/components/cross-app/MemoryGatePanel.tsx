import { titleCase } from "@/lib/demo-data";
import type { MemoryGateDecision } from "@/types";

export function MemoryGatePanel({ decisions, visible }: { decisions: MemoryGateDecision[]; visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-950">MemoryGate</p>
      <div className="mt-3 grid gap-2">
        {decisions.map((decision) => (
          <div key={decision.memoryCandidateId} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-800">{decision.label ?? decision.memoryCandidateId}</span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                {titleCase(decision.decision)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
              {decision.scope ? <span>{decision.scope}</span> : null}
              {decision.ttlDays ? <span>{decision.ttlDays} days</span> : null}
              {decision.requiresConfirmation ? <span>Requires confirmation</span> : null}
              {decision.rawAudioStored === false ? <span>Raw audio not stored</span> : null}
              {decision.transcriptStored === false ? <span>Transcript extraction only</span> : null}
              {decision.rawChatStored === false ? <span>Raw chat not stored</span> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
