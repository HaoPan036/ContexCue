import type { MemoryStatus, PrivacyLevel, Sensitivity } from "@/types";
import { titleCase } from "@/lib/demo-data";

type BadgeKind = PrivacyLevel | Sensitivity | MemoryStatus | "pass" | "fail" | "mock";

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
  pass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  fail: "border-rose-200 bg-rose-50 text-rose-700",
  mock: "border-indigo-200 bg-indigo-50 text-indigo-700"
};

export function PrivacyBadge({ value, label }: { value: BadgeKind; label?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classNames[value]}`}>
      {label ?? titleCase(value)}
    </span>
  );
}
