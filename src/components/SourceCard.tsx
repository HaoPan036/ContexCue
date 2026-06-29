import { CalendarDays, LockKeyhole, MessageSquareText } from "lucide-react";
import { formatDate, peopleById, titleCase } from "@/lib/demo-data";
import type { SourceSnippet } from "@/types";

const sourceSummaries: Record<string, string> = {
  "source-private-july-1": "Stress + quiet place + no spicy food",
  "source-group-july-2": "Presentation pressure signal",
  "source-feedback-july-2": "Warm, low pressure style preference",
  "source-new-message-july-4": "New reply task: tired before weekend",
  "source-person-b-heldout": "Person B campus preference"
};

export function SourceCard({ source }: { source: SourceSnippet }) {
  const people = source.personIds
    .map((personId) => peopleById.get(personId)?.displayName)
    .filter(Boolean)
    .join(", ");
  const summary = sourceSummaries[source.id] ?? source.content.split("\n")[0];

  return (
    <article className="card-shell flex h-full flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">
            {titleCase(source.sourceType)}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{source.title}</h3>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(source.timestamp)}
        </span>
        <span>{people}</span>
      </div>

      <p className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-800">
        {summary}
      </p>

      <details className="group rounded-md border border-slate-100 bg-white p-3">
        <summary className="cursor-pointer text-xs font-semibold text-slate-600 group-open:text-indigo-700">
          Source text
        </summary>
        <p className="mt-2 whitespace-pre-line break-words text-xs leading-5 text-slate-600">
          {source.content}
        </p>
      </details>

      <div className="mt-auto flex items-center gap-2 text-xs font-medium text-slate-500">
        <LockKeyhole className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
        Raw chat not stored.
      </div>
    </article>
  );
}
