import { ShieldCheck } from "lucide-react";
import { candidatesById, titleCase } from "@/lib/demo-data";
import type { MemoryGateDecision } from "@/types";

export function MemoryGateDecisionCard({ decision }: { decision: MemoryGateDecision }) {
  const candidate = candidatesById.get(decision.memoryCandidateId);

  return (
    <article className="card-shell p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">
            {titleCase(decision.decision)}
          </p>
          <h4 className="mt-1 text-sm font-semibold leading-5 text-slate-950">
            {candidate?.content ?? decision.memoryCandidateId}
          </h4>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
          TTL {decision.ttlDays ? `${decision.ttlDays}d` : "none"}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
          {decision.requiresConfirmation ? "Confirm" : "No confirm"}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
          Raw chat {decision.rawChatStored ? "stored" : "not stored"}
        </span>
      </div>

      <details className="group mt-3 rounded-md border border-slate-100 bg-slate-50 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-slate-600 group-open:text-indigo-700">
          Reason
        </summary>
        <p className="mt-2 text-xs leading-5 text-slate-600">{decision.reason}</p>
      </details>
    </article>
  );
}
