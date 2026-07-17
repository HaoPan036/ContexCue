import type {
  BeliefStatus,
  FragmentOrigin,
  MemoryStatus,
  PrivacyLevel,
  Sensitivity,
  UserStance
} from "@/types";
import { titleCase } from "@/lib/demo-data";

type BadgeKind =
  | PrivacyLevel
  | Sensitivity
  | MemoryStatus
  | FragmentOrigin
  | UserStance
  | BeliefStatus
  | "pass"
  | "fail"
  | "mock";

const classNames: Record<BadgeKind, string> = {
  normal: "border-emerald-200 bg-emerald-50 text-emerald-700",
  sensitive: "border-amber-200 bg-amber-50 text-amber-800",
  private: "border-rose-200 bg-rose-50 text-rose-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-rose-200 bg-rose-50 text-rose-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  expired: "border-slate-200 bg-slate-100 text-slate-600",
  ignored: "border-slate-200 bg-slate-100 text-slate-600",
  blocked: "border-rose-200 bg-rose-50 text-rose-700",
  pending_confirmation: "border-amber-200 bg-amber-50 text-amber-800",
  self: "border-indigo-200 bg-indigo-50 text-indigo-700",
  other_person: "border-sky-200 bg-sky-50 text-sky-700",
  ai_output: "border-violet-200 bg-violet-50 text-violet-700",
  external_content: "border-cyan-200 bg-cyan-50 text-cyan-800",
  endorsed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  skeptical: "border-amber-200 bg-amber-50 text-amber-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  undecided: "border-slate-200 bg-slate-100 text-slate-600",
  external_view: "border-sky-200 bg-sky-50 text-sky-700",
  candidate_belief: "border-amber-200 bg-amber-50 text-amber-800",
  user_belief: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  fail: "border-rose-200 bg-rose-50 text-rose-700",
  mock: "border-indigo-200 bg-indigo-50 text-indigo-700"
};

const unknownClassName = "border-slate-200 bg-slate-100 text-slate-600";

export function PrivacyBadge({ value, label }: { value?: BadgeKind; label?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        value ? classNames[value] : unknownClassName
      }`}
    >
      {label ?? (value ? titleCase(value) : "Not recorded")}
    </span>
  );
}
