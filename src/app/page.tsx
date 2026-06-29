import Link from "next/link";
import { ArrowRight, BrainCircuit, DatabaseZap, ShieldCheck, Sparkles } from "lucide-react";

const previewSources = [
  "Private chat: quiet place, no spicy food",
  "Group chat: presentation pressure",
  "AI feedback: warm, low pressure style",
  "New message: tired before weekend"
];

export default function LandingPage() {
  return (
    <main className="bg-slate-50">
      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-slate-100">
        <div className="absolute inset-0 -z-10 opacity-90" aria-hidden="true">
          <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-4 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="hidden rounded-lg border border-slate-200 bg-white/70 shadow-sm lg:block" />
            <div className="rounded-lg border border-indigo-100 bg-white/85 shadow-soft" />
            <div className="hidden rounded-lg border border-slate-200 bg-white/70 shadow-sm lg:block" />
          </div>
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl content-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1 text-sm font-medium text-indigo-700 shadow-sm">
              <BrainCircuit className="h-4 w-4" aria-hidden="true" />
              ContextCue
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              ContextCue
            </h1>
            <p className="mt-4 text-xl leading-8 text-slate-800">
              Social context agent with privacy controlled memory
            </p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
              Stitch scattered conversations, AI feedback choices, and relationship signals into
              timely context for better replies.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              This needs AI because useful social context is fragmented across chats, time,
              group settings, and the reply choices a user accepted or rejected earlier.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/demo"
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Launch demo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/evaluation"
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                View evaluation
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <div className="card-shell p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
                <DatabaseZap className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-slate-950">Fragmented inputs</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {previewSources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
            </div>

            <div className="card-shell p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-slate-950">MemoryGate</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Raw chat is not stored. Sensitive memories need confirmation, person scope, task
                scope, evidence, and automatic expiry.
              </p>
            </div>

            <div className="card-shell p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-700">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-slate-950">Feedback learning</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The final user choice becomes a scoped preference signal for future reply
                suggestions, while the user remains in control.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
