import type { ReactNode } from "react";

export function AppMockup({
  label,
  subtitle,
  children
}: {
  label: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-[580px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">{label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}
