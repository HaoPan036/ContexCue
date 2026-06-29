"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Database, FlaskConical, MessageSquareText, Mic2, RotateCcw, ShieldCheck } from "lucide-react";
import { clearDemoStorage } from "@/lib/storage";

const navItems = [
  { href: "/", label: "Workspace", icon: MessageSquareText },
  { href: "/memory-library", label: "Library", icon: Database },
  { href: "/feedback-learning", label: "Preferences", icon: ShieldCheck },
  { href: "/voice-trigger-capture", label: "Capture", icon: Mic2 },
  { href: "/evaluation", label: "Tests", icon: FlaskConical }
];

export function Navigation() {
  const pathname = usePathname();

  function reset() {
    clearDemoStorage();
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="focus-ring flex w-fit items-center gap-2 rounded-md text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
            <BrainCircuit className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-5">ContextCue</span>
            <span className="block text-xs leading-4 text-slate-500">Local context workspace</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex flex-wrap items-center gap-1" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href === "/" && pathname === "/demo");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`focus-ring inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition ${
                    active
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={reset}
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            title="Reset saved state"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset state
          </button>
        </div>
      </div>
    </header>
  );
}
