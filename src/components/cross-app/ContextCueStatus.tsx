import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const statuses = [
  "Listening for trigger",
  "Extracting instruction",
  "Checking MemoryGate",
  "Updating memory",
  "Ready for next reply"
];

export function ContextCueStatus({ stage }: { stage: number }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">ContextCue running</p>
        {stage >= 4 ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Memory updated
          </span>
        ) : null}
      </div>
      <div className="mt-3 space-y-2">
        {statuses.map((status, index) => {
          const step = index + 1;
          const active = stage === step || (stage === 0 && step === 1);
          const complete = stage > step;
          const Icon = complete ? CheckCircle2 : active && stage > 0 ? Loader2 : Circle;

          return (
            <div key={status} className="flex items-center gap-2 text-sm">
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  complete ? "text-emerald-600" : active ? "text-indigo-600" : "text-slate-300"
                } ${active && stage > 0 ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span className={complete || active ? "font-medium text-slate-800" : "text-slate-500"}>
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
