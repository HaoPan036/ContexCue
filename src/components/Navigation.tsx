"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { clearDemoStorage } from "@/lib/storage";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/memory-library", label: "Memory" },
  { href: "/feedback-learning", label: "Style" },
  { href: "/voice-trigger-capture", label: "Capture" },
  { href: "/evaluation", label: "Tests" }
];

export function Navigation() {
  const pathname = usePathname();

  function reset() {
    clearDemoStorage();
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-black/5 bg-[#f5f2ec]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="focus-ring w-fit rounded-md text-sm font-semibold tracking-normal text-[#111111]">
          ContextCue
        </Link>

        <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
          <nav className="flex w-max items-center gap-5" aria-label="Primary navigation">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href === "/" && pathname === "/demo");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`focus-ring inline-flex h-8 items-center rounded-md text-sm font-medium transition ${
                    active
                      ? "text-[#111111]"
                      : "text-[#6b675f] hover:text-[#111111]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={reset}
            className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[#6b675f] shadow-sm transition hover:bg-white hover:text-[#111111]"
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
