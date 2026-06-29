import { CheckCircle2, Circle, CircleDot } from "lucide-react";

export interface DemoStage {
  id: number;
  label: string;
}

export function DemoProgressStepper({ stages, currentStage }: { stages: DemoStage[]; currentStage: number }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-5">
      {stages.map((stage) => {
        const isComplete = currentStage > stage.id;
        const isActive = currentStage === stage.id;
        const Icon = isComplete ? CheckCircle2 : isActive ? CircleDot : Circle;

        return (
          <li
            key={stage.id}
            className={`rounded-lg border p-3 text-sm ${
              isActive
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : isComplete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <span className="flex items-center gap-2 font-semibold">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
