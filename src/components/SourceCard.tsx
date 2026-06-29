import { CalendarDays, LockKeyhole, MessageSquareText } from "lucide-react";
import { formatDate, peopleById, titleCase } from "@/lib/demo-data";
import type { SourceSnippet } from "@/types";

export function SourceCard({ source }: { source: SourceSnippet }) {
  const people = source.personIds
    .map((personId) => peopleById.get(personId)?.displayName)
    .filter(Boolean)
    .join(", ");

  return (
    <article className="card-shell flex h-full flex-col gap-4 p-4">
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

      <p className="whitespace-pre-line break-words rounded-md border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
        {source.content}
      </p>

      <div className="mt-auto flex items-center gap-2 text-xs font-medium text-slate-500">
        <LockKeyhole className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
        Source only. Raw chat is not stored as memory.
      </div>
    </article>
  );
}
