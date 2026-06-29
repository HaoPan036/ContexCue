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
            <PrivacyBadge value="mock" label="Static checks" />
            <PrivacyBadge value="pass" label={`${passCount}/${demoData.evaluationCases.length} passing`} />
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-slate-950">System Tests</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Checks for relevance, privacy boundaries, expiry, evidence, and person separation.
          </p>
        </div>

        <section className="card-shell p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Metrics</p>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            {[
              "Context relevance",
              "Memory leakage",
              "Wrong person",
              "Expiration",
              "Evidence",
              "Style adaptation"
            ].map((metric) => (
              <li key={metric} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                {metric}
              </li>
            ))}
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
