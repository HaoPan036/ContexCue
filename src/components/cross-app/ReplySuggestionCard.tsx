"use client";

import { Check, Send } from "lucide-react";
import type { ReplySuggestion } from "@/types";

export function ReplySuggestionCard({
  suggestion,
  visible,
  used,
  onUse
}: {
  suggestion: ReplySuggestion;
  visible: boolean;
  used: boolean;
  onUse: () => void;
}) {
  if (!visible) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Suggested reply</p>
      <p className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm leading-6 text-indigo-950">
        {suggestion.text}
      </p>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Used context</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestion.usedContext.map((context) => (
            <span key={context} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              {context}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onUse}
        className={`focus-ring mt-4 inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition ${
          used
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {used ? <Check className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        {used ? "Reply selected" : "Use this reply"}
      </button>
    </section>
  );
}
