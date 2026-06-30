"use client";

import { HelpCircle, X } from "lucide-react";

export function FAQDrawer({
  open,
  onOpen,
  onClose,
  items
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        Open FAQ
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/20" role="dialog" aria-modal="true">
          <aside className="ml-auto flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">FAQ</p>
                <h2 className="text-lg font-semibold text-slate-950">ContextCue notes</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                aria-label="Close FAQ"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-3">
                {items.map((item) => (
                  <details key={item.question} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
