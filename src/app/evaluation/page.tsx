import { EvaluationCaseCard } from "@/components/EvaluationCaseCard";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { demoData } from "@/lib/demo-data";

export default function EvaluationPage() {
  const passCount = demoData.evaluationCases.filter((testCase) => testCase.status === "pass").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.34fr)] lg:items-end">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <PrivacyBadge value="mock" label="Static V0.1 evaluation" />
            <PrivacyBadge value="pass" label={`${passCount}/${demoData.evaluationCases.length} passing`} />
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-slate-950">Evaluation</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            A static test suite for the demo thesis: stitching must be relevant, evidence grounded,
            scoped by person and task, privacy controlled, and shaped by user feedback.
          </p>
        </div>

        <section className="card-shell p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Metrics</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>Context relevance</li>
            <li>Memory leakage rate</li>
            <li>Wrong person contamination rate</li>
            <li>Expiration correctness</li>
            <li>Evidence coverage</li>
            <li>Reply style adaptation</li>
          </ul>
        </section>
      </div>

      <div className="grid gap-4">
        {demoData.evaluationCases.map((testCase) => (
          <EvaluationCaseCard key={testCase.id} testCase={testCase} />
        ))}
      </div>
    </main>
  );
}
