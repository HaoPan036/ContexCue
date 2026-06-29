import { Link2 } from "lucide-react";
import type { AgentRun } from "@/types";
import { EvidencePill } from "@/components/EvidencePill";

export function StitchedContextPanel({ agentRun }: { agentRun: AgentRun }) {
  return (
    <section className="card-shell p-4">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Stage 4 / Stitch</p>
        <h3 className="mt-1 text-base font-semibold text-slate-950">Current relationship context</h3>
      </div>

      <ul className="space-y-3">
        {agentRun.stitchedContext.map((line) => (
          <li key={line.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="flex gap-2">
              <Link2 className="mt-1 h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm leading-6 text-slate-800">{line.text}</p>
                {line.caution ? <p className="mt-1 text-xs leading-5 text-amber-800">{line.caution}</p> : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {line.evidenceSourceIds.map((sourceId) => (
                    <EvidencePill key={sourceId} sourceId={sourceId} />
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-md border border-indigo-100 bg-indigo-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Reply strategy</p>
        <p className="mt-1 text-sm leading-6 text-indigo-950">{agentRun.replyStrategy}</p>
      </div>
    </section>
  );
}
