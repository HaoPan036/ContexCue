import { CheckCircle2, XCircle } from "lucide-react";
import type { EvaluationCase } from "@/types";
import { PrivacyBadge } from "@/components/PrivacyBadge";

export function EvaluationCaseCard({ testCase }: { testCase: EvaluationCase }) {
  const Icon = testCase.status === "pass" ? CheckCircle2 : XCircle;

  return (
    <article className="card-shell p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">{testCase.category}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{testCase.testName}</h3>
        </div>
        <PrivacyBadge value={testCase.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
        <div>
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-slate-500">
            <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Input condition
          </dt>
          <dd className="mt-1 leading-6 text-slate-700">{testCase.inputCondition}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Expected behavior</dt>
          <dd className="mt-1 leading-6 text-slate-700">{testCase.expectedBehavior}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Current result</dt>
          <dd className="mt-1 leading-6 text-slate-700">{testCase.currentResult}</dd>
        </div>
      </dl>
    </article>
  );
}
