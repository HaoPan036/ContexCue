"use client";

import { Check, MessageCircle, Sparkles } from "lucide-react";
import { titleCase } from "@/lib/demo-data";
import type { ReplyOption } from "@/types";

export function ReplyOptionCard({
  reply,
  selected,
  recommended,
  onSelect
}: {
  reply: ReplyOption;
  selected?: boolean;
  recommended?: boolean;
  onSelect?: () => void;
}) {
  return (
    <article
      className={`card-shell flex h-full flex-col gap-3 p-4 ${
        selected ? "border-indigo-300 ring-1 ring-indigo-200" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">{reply.label}</p>
            {recommended ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Suggested
              </span>
            ) : null}
          </div>
          <h4 className="mt-1 text-sm font-semibold text-slate-950">{titleCase(reply.style)}</h4>
        </div>
        <MessageCircle className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>

      <p className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-800">
        {reply.text}
      </p>
      <details className="group text-xs text-slate-500">
        <summary className="cursor-pointer font-semibold group-open:text-indigo-700">Rationale</summary>
        <p className="mt-1 leading-5">{reply.rationale}</p>
      </details>

      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          className={`focus-ring mt-auto inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition ${
            selected
              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {selected ? "Selected" : "Select"}
        </button>
      ) : null}
    </article>
  );
}
