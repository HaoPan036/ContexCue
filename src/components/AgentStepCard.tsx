import type { ReactNode } from "react";
import { CheckCircle2, CircleDot } from "lucide-react";

export function AgentStepCard({
  title,
  eyebrow,
  active,
  complete,
  children
}: {
  title: string;
  eyebrow: string;
  active?: boolean;
  complete?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`card-shell p-4 ${
        active ? "border-indigo-200 ring-1 ring-indigo-100" : complete ? "border-emerald-200" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">{eyebrow}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{title}</h3>
        </div>
        {complete ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
        ) : active ? (
          <CircleDot className="h-5 w-5 text-indigo-600" aria-hidden="true" />
        ) : null}
      </div>
      <div className="text-sm leading-6 text-slate-600">{children}</div>
    </section>
  );
}
