import { Check, Clock, X } from "lucide-react";
import { decisionsByCandidateId, peopleById, titleCase } from "@/lib/demo-data";
import type { MemoryCandidate } from "@/types";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { EvidencePill } from "@/components/EvidencePill";

export function MemoryCandidateCard({
  candidate,
  onApprove,
  onIgnore,
  onExpire
}: {
  candidate: MemoryCandidate;
  onApprove?: () => void;
  onIgnore?: () => void;
  onExpire?: () => void;
}) {
  const decision = decisionsByCandidateId.get(candidate.id);
  const person = peopleById.get(candidate.personId);

  return (
    <article className="card-shell flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
            {person?.displayName} / {titleCase(candidate.type)}
          </p>
          <h4 className="mt-1 text-sm font-semibold leading-5 text-slate-950">{candidate.content}</h4>
        </div>
        <PrivacyBadge value={candidate.sensitivity} label={`${titleCase(candidate.sensitivity)} sensitivity`} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
          {titleCase(candidate.suggestedAction)}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
          {candidate.suggestedTtlDays ? `${candidate.suggestedTtlDays} days` : "Long term"}
        </span>
        {candidate.sourceSnippetIds.map((sourceId) => (
          <EvidencePill key={sourceId} sourceId={sourceId} />
        ))}
      </div>

      <details className="group rounded-md border border-slate-100 bg-slate-50 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-slate-600 group-open:text-indigo-700">
          Evidence
        </summary>
        <p className="mt-2 text-xs leading-5 text-slate-600">{candidate.evidence}</p>
      </details>

      {decision ? (
        <p className="text-xs leading-5 text-slate-500">
          Gate: {titleCase(decision.decision)} / raw chat: {decision.rawChatStored ? "stored" : "not stored"}.
        </p>
      ) : null}

      {(onApprove || onIgnore || onExpire) && (
        <div className="mt-1 flex flex-wrap gap-2">
          {onApprove ? (
            <button
              type="button"
              onClick={onApprove}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Approve
            </button>
          ) : null}
          {onIgnore ? (
            <button
              type="button"
              onClick={onIgnore}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Ignore
            </button>
          ) : null}
          {onExpire ? (
            <button
              type="button"
              onClick={onExpire}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 text-sm font-medium text-amber-800 hover:bg-amber-100"
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              Expire
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}
