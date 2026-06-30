"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Database, FlaskConical, MessageSquareText, Mic2, RotateCcw, ShieldCheck } from "lucide-react";
import { clearDemoStorage } from "@/lib/storage";

const navItems = [
  { href: "/", label: "Scene", icon: MessageSquareText },
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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f6f7f9]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:min-h-[73px] lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="focus-ring flex w-fit items-center gap-2 rounded-md text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm">
            <BrainCircuit className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-5">ContextCue</span>
            <span className="block text-xs leading-4 text-slate-500">Private memory layer</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 overflow-x-auto">
          <nav className="flex w-max items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href === "/" && pathname === "/demo");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`focus-ring inline-flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
            className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            title="Reset saved state"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Reset state</span>
          </button>
        </div>
      </div>
    </header>
  );
}
