import { CheckCircle2 } from "lucide-react";
import { AppMockup } from "@/components/cross-app/AppMockup";
import type { AppSource } from "@/types";

export function DoubaoMockup({ source }: { source: AppSource }) {
  return (
    <AppMockup label={source.label} subtitle={source.subtitle}>
      <div className="flex flex-1 flex-col gap-3 bg-white p-4">
        {source.messages.map((message) => {
          const fromUser = message.role === "user";
          const isSystem = message.role === "system";
          return (
            <div
              key={message.id}
              className={`rounded-xl border px-3.5 py-3 text-sm leading-6 ${
                fromUser
                  ? "ml-8 border-indigo-100 bg-indigo-50 text-indigo-950"
                  : isSystem
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : message.selected
                      ? "border-indigo-200 bg-white text-slate-900 ring-1 ring-indigo-100"
                      : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-start gap-2">
                {message.selected || message.edited ? (
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : null}
                <span>{message.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </AppMockup>
  );
}
