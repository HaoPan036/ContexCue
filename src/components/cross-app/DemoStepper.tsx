const stepLabels = ["Trigger", "Parse", "Gate", "Update", "Reply"];

export function DemoStepper({ stage }: { stage: number }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-5">
      {stepLabels.map((label, index) => {
        const step = index + 1;
        const active = stage === step;
        const complete = stage > step;

        return (
          <li
            key={label}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              active
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : complete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            {label}
          </li>
        );
      })}
    </ol>
  );
}
