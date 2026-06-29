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

      <p className="mt-3 text-sm leading-6 text-slate-600">{decision.reason}</p>

      <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
        <span>TTL: {decision.ttlDays ? `${decision.ttlDays} days` : "None"}</span>
        <span>Confirmation: {decision.requiresConfirmation ? "required" : "not required"}</span>
        <span>Raw chat stored: {decision.rawChatStored ? "yes" : "no"}</span>
      </div>
    </article>
  );
}
