"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Ban,
  Bot,
  CalendarClock,
  Check,
  ChevronDown,
  CircleHelp,
  Compass,
  LoaderCircle,
  MessageSquare,
  MoveRight,
  NotebookPen,
  RotateCcw,
  Send,
  X
} from "lucide-react";
import {
  demoContinuityFragments,
  isContinuitySnapshot,
  type ContinuityFragment,
  type ContinuityRequest,
  type ContinuitySnapshot
} from "@/lib/continuity-engine";

type DemoPhase = "scattered" | "trigger" | "loading" | "result" | "error";

const DEFAULT_PROMPT = "Continue building ContextCue";
const RESTORE_ERROR =
  "The thread could not be restored. Nothing was changed.";

const scatteredPositions = [
  "left-[1%] top-[3%] w-[47%] -rotate-2 sm:left-[3%] sm:top-[5%] sm:w-[27%]",
  "right-[0%] top-[15%] w-[45%] rotate-2 sm:right-[3%] sm:top-[2%] sm:w-[25%]",
  "left-[5%] top-[35%] w-[46%] rotate-1 sm:left-[36%] sm:top-[13%] sm:w-[27%] sm:-rotate-1",
  "right-[2%] top-[46%] w-[47%] -rotate-2 sm:right-[5%] sm:top-[39%] sm:w-[27%]",
  "left-[0%] top-[68%] w-[48%] rotate-2 sm:left-[7%] sm:top-[62%] sm:w-[25%] sm:-rotate-1",
  "right-[4%] top-[75%] w-[45%] -rotate-1 sm:right-[35%] sm:top-[68%] sm:w-[26%] sm:rotate-1",
  "hidden sm:block sm:right-[2%] sm:top-[72%] sm:w-[25%] sm:-rotate-2",
  "hidden sm:block sm:left-[38%] sm:top-[48%] sm:w-[23%] sm:rotate-2"
];

const fragmentPalettes = [
  "border-[#b9cbc1] bg-[#e7f0eb]",
  "border-[#cad3e2] bg-[#e9eef6]",
  "border-[#e2c9bd] bg-[#f4e7e1]",
  "border-[#d9d19e] bg-[#f3f0d8]",
  "border-[#c7c3bc] bg-[#fffdf8]"
];

const demoSourceBySignal: Record<ContinuityFragment["signal"], string> = {
  north_star: "Own note",
  settled: "AI conversation",
  rejected: "Product feedback",
  open_question: "Open question",
  next_move: "Working note"
};

const demoMomentBySignal: Record<ContinuityFragment["signal"], string> = {
  north_star: "Mon",
  settled: "Tue",
  rejected: "Wed",
  open_question: "Thu",
  next_move: "Fri"
};

const railItems = [
  {
    key: "northStar",
    label: "North star",
    icon: Compass,
    tone: "border-[#111111] text-[#111111]"
  },
  {
    key: "settled",
    label: "Settled",
    icon: Check,
    tone: "border-[#2f6b4f] text-[#2f6b4f]"
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: Ban,
    tone: "border-[#a34836] text-[#a34836]"
  },
  {
    key: "openQuestion",
    label: "Still open",
    icon: CircleHelp,
    tone: "border-[#9a6b13] text-[#79520b]"
  },
  {
    key: "nextMove",
    label: "Next move",
    icon: MoveRight,
    tone: "border-[#365f91] text-[#365f91]"
  }
] as const;

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sourceLabel(fragment: ContinuityFragment): string {
  return humanize(demoSourceBySignal[fragment.signal]);
}

function fragmentMoment(fragment: ContinuityFragment): string {
  return demoMomentBySignal[fragment.signal];
}

function snapshotLines(
  snapshot: ContinuitySnapshot,
  key: (typeof railItems)[number]["key"]
): string[] {
  const value = snapshot[key];
  return Array.isArray(value) ? value : [value];
}

function conciseAssistantResponse(snapshot: ContinuitySnapshot): string {
  const sentenceEnd = snapshot.assistantResponse.search(/[.!?](?:\s|$)/);
  return sentenceEnd >= 0
    ? snapshot.assistantResponse.slice(0, sentenceEnd + 1)
    : snapshot.assistantResponse;
}

function readErrorMessage(payload: unknown): string | null {
  if (payload === null || typeof payload !== "object") {
    return null;
  }

  const error = (payload as { error?: unknown }).error;
  return typeof error === "string" && error.trim() ? error.trim() : null;
}

function sourceGlyph(fragment: ContinuityFragment) {
  const iconClass = "h-4 w-4";

  switch (fragment.signal) {
    case "settled":
      return <Bot className={iconClass} aria-hidden="true" />;
    case "rejected":
      return <MessageSquare className={iconClass} aria-hidden="true" />;
    case "open_question":
      return <CircleHelp className={iconClass} aria-hidden="true" />;
    default:
      return <NotebookPen className={iconClass} aria-hidden="true" />;
  }
}

function delay(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function FragmentSlip({
  fragment,
  index,
  collecting
}: {
  fragment: ContinuityFragment;
  index: number;
  collecting: boolean;
}) {
  const position = collecting
    ? "left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-1/2 sm:w-[29%]"
    : scatteredPositions[index % scatteredPositions.length];

  return (
    <article
      className={`absolute ${position} min-w-0 rounded-md border p-3 shadow-[0_14px_32px_rgba(35,32,27,0.11)] transition-all duration-700 sm:p-4 ${
        fragmentPalettes[index % fragmentPalettes.length]
      } ${collecting ? "scale-90 opacity-75" : "opacity-100"}`}
      style={{ transitionDelay: `${collecting ? index * 55 : 0}ms` }}
    >
      <div className="flex min-w-0 items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-normal text-[#625f58] sm:text-xs">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0">{sourceGlyph(fragment)}</span>
          <span className="truncate">{sourceLabel(fragment)}</span>
        </span>
        <span className="shrink-0">{fragmentMoment(fragment)}</span>
      </div>
      <p className="mt-2 max-h-[4.8rem] overflow-hidden break-words text-sm font-medium leading-5 text-[#1b1b18] sm:text-base sm:leading-6">
        {fragment.content}
      </p>
    </article>
  );
}

function EvidenceMark({
  fragment,
  excluded
}: {
  fragment: ContinuityFragment;
  excluded?: boolean;
}) {
  return (
    <li
      className={`flex min-w-0 items-center gap-2 border-l-2 px-2.5 py-1.5 ${
        excluded
          ? "border-[#a34836] bg-[#f5e6e2] text-[#7a382c]"
          : "border-[#2f6b4f] text-[#285b44]"
      }`}
    >
      {excluded ? (
        <X className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span className="shrink-0">{sourceGlyph(fragment)}</span>
      <span
        className={`truncate text-xs font-semibold ${
          excluded ? "line-through decoration-2" : ""
        }`}
      >
        {sourceLabel(fragment)}
      </span>
    </li>
  );
}

export function ContinuityDemo() {
  const fragments = useMemo<ContinuityFragment[]>(
    () => [...demoContinuityFragments],
    []
  );
  const [phase, setPhase] = useState<DemoPhase>("scattered");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [snapshot, setSnapshot] = useState<ContinuitySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (phase === "result" && snapshot) {
      resultHeadingRef.current?.focus();
    }
  }, [phase, snapshot]);

  async function requestContinuity(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setError("Write what you want to continue.");
      setPhase("error");
      return;
    }

    setError(null);
    setPhase("loading");

    const request: ContinuityRequest = {
      prompt: cleanPrompt,
      fragments
    };

    try {
      const minimumSceneTime = delay(950);
      const response = await fetch("/api/continuity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(readErrorMessage(payload) ?? RESTORE_ERROR);
      }

      if (!isContinuitySnapshot(payload)) {
        throw new Error(RESTORE_ERROR);
      }

      await minimumSceneTime;
      setSnapshot(payload);
      setPhase("result");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : RESTORE_ERROR
      );
      setPhase("error");
    }
  }

  function replay() {
    setPrompt(DEFAULT_PROMPT);
    setSnapshot(null);
    setError(null);
    setPhase("scattered");
  }

  if (phase === "result" && snapshot) {
    const usedIds = new Set(snapshot.usedFragmentIds);
    const excludedIds = new Set(snapshot.excludedFragmentIds);
    const usedFragments = fragments.filter((fragment) =>
      usedIds.has(fragment.id)
    );
    const excludedFragments = fragments.filter((fragment) =>
      excludedIds.has(fragment.id)
    );
    const assistantResponse = conciseAssistantResponse(snapshot);

    return (
      <main className="min-h-[calc(100svh-4rem)] overflow-x-hidden bg-[#f4f1ea] text-[#171714]">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-[#6b675f]">
              ContextCue / one week later
            </p>
            <h1
              ref={resultHeadingRef}
              tabIndex={-1}
              className="mt-1 truncate text-lg font-semibold outline-none sm:text-xl"
            >
              The thread is intact.
            </h1>
          </div>
          <button
            type="button"
            onClick={replay}
            className="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-[#cfc9be] bg-white px-3 text-sm font-semibold text-[#312d27] transition hover:bg-[#fbfaf7]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Replay
          </button>
        </header>

        <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <section
            className="border-t border-[#cec8bd] py-6 sm:py-7"
            aria-labelledby="continuity-heading"
          >
            <p
              id="continuity-heading"
              className="text-xs font-semibold uppercase tracking-normal text-[#6b675f]"
            >
              Recovered continuity
            </p>

            <ol className="mt-5 grid min-w-0 gap-5 sm:grid-cols-5 sm:gap-0">
              {railItems.map((item) => {
                const Icon = item.icon;
                const lines = snapshotLines(snapshot, item.key);

                return (
                  <li
                    key={item.key}
                    className={`relative min-w-0 border-l-2 py-1 pl-5 sm:border-l-0 sm:border-t-2 sm:px-3 sm:pb-0 sm:pt-6 ${item.tone}`}
                  >
                    <span className="absolute -left-[9px] top-0 flex h-4 w-4 items-center justify-center bg-[#f4f1ea] sm:-top-[9px] sm:left-3">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-normal">
                      {item.label}
                    </p>
                    <div className="mt-2 space-y-2 text-[#26241f]">
                      {lines.map((line, index) => (
                        <p
                          key={`${item.key}-${index}`}
                          className="break-words text-sm font-medium leading-5 sm:text-[15px] sm:leading-6"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="border-y border-[#171714] py-5 sm:py-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-[#6b675f]">
              <MoveRight className="h-4 w-4" aria-hidden="true" />
              Assistant response
            </div>
            <p className="mt-3 max-w-3xl break-words text-xl font-medium leading-7 text-[#171714] sm:text-2xl sm:leading-8">
              {assistantResponse}
            </p>
          </section>

          <section
            className="grid min-w-0 gap-3 border-b border-[#cec8bd] py-3.5 md:grid-cols-2 md:gap-5"
            aria-label="Evidence used and excluded"
          >
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <p className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#2f6b4f]">
                <Check className="h-4 w-4" aria-hidden="true" />
                Used
              </p>
              {usedFragments.length > 0 ? (
                <ul className="flex min-w-0 flex-wrap gap-1.5">
                  {usedFragments.map((fragment) => (
                    <EvidenceMark key={fragment.id} fragment={fragment} />
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#6b675f]">No evidence returned</p>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-2 border-t border-[#d8bbb4] pt-3 sm:flex-row sm:items-center md:border-l md:border-t-0 md:pl-5 md:pt-0">
              <p className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#a34836]">
                <X className="h-4 w-4" aria-hidden="true" />
                Excluded
              </p>
              {excludedFragments.length > 0 ? (
                <ul className="flex min-w-0 flex-wrap gap-1.5">
                  {excludedFragments.map((fragment) => (
                    <EvidenceMark
                      key={fragment.id}
                      fragment={fragment}
                      excluded
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#6b675f]">Nothing excluded</p>
              )}
            </div>
          </section>

          <details className="group border-b border-[#cec8bd] py-5">
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-sm font-semibold text-[#312d27]">
              Why this continuation?
              <ChevronDown
                className="h-4 w-4 shrink-0 transition group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="mt-5 grid min-w-0 gap-6 text-sm leading-6 text-[#514d45] sm:grid-cols-2">
              <section className="min-w-0">
                <h2 className="flex items-center gap-2 font-semibold text-[#2f6b4f]">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Used evidence
                </h2>
                <ul className="mt-3 space-y-3">
                  {usedFragments.map((fragment) => (
                    <li
                      key={fragment.id}
                      className="min-w-0 border-l-2 border-[#a9c4b5] pl-3"
                    >
                      <p className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-normal text-[#2f6b4f]">
                        <span className="shrink-0">
                          {sourceGlyph(fragment)}
                        </span>
                        <span className="truncate">
                          {sourceLabel(fragment)}
                        </span>
                      </p>
                      <p className="mt-1 break-words">{fragment.content}</p>
                    </li>
                  ))}
                  {usedFragments.length === 0 ? (
                    <li>No supporting evidence was returned.</li>
                  ) : null}
                </ul>
              </section>

              <section className="min-w-0">
                <h2 className="flex items-center gap-2 font-semibold text-[#a34836]">
                  <X className="h-4 w-4" aria-hidden="true" />
                  Excluded evidence
                </h2>
                <ul className="mt-3 space-y-3">
                  {excludedFragments.map((fragment) => (
                    <li
                      key={fragment.id}
                      className="min-w-0 border-l-2 border-[#d4a99f] pl-3"
                    >
                      <p className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-normal text-[#a34836]">
                        <span className="shrink-0">
                          {sourceGlyph(fragment)}
                        </span>
                        <span className="truncate">
                          {sourceLabel(fragment)}
                        </span>
                      </p>
                      <p className="mt-1 break-words">{fragment.content}</p>
                      <p className="mt-1 text-xs font-semibold text-[#a34836]">
                        Reason: {snapshot.exclusionReasons[fragment.id]}
                      </p>
                    </li>
                  ))}
                  {excludedFragments.length === 0 ? (
                    <li>No evidence was explicitly excluded.</li>
                  ) : null}
                </ul>
              </section>
            </div>
          </details>
        </div>
      </main>
    );
  }

  const collecting = phase === "loading";
  const panelVisible = phase === "trigger" || phase === "error";

  return (
    <main className="relative h-[calc(100svh-4rem)] min-h-[620px] overflow-hidden bg-[#f4f1ea] text-[#171714]">
      <header className="relative z-20 flex items-start justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-[#6b675f]">
            ContextCue / five interrupted days
          </p>
          <h1 className="mt-1 max-w-xl text-xl font-semibold leading-7 sm:text-2xl">
            One project, left where the work happened.
          </h1>
        </div>
        <div className="hidden shrink-0 items-center gap-2 text-sm text-[#6b675f] sm:flex">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Last active Friday, 6:14 PM
        </div>
      </header>

      <div
        className={`absolute inset-x-3 bottom-20 top-24 transition-opacity duration-500 sm:inset-x-8 sm:bottom-24 sm:top-24 ${
          panelVisible ? "opacity-25" : "opacity-100"
        }`}
        aria-hidden={panelVisible}
      >
        {fragments.slice(0, 8).map((fragment, index) => (
          <FragmentSlip
            key={fragment.id}
            fragment={fragment}
            index={index}
            collecting={collecting}
          />
        ))}
      </div>

      {phase === "scattered" ? (
        <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center px-4 sm:bottom-7">
          <button
            type="button"
            onClick={() => setPhase("trigger")}
            className="focus-ring inline-flex h-12 items-center gap-3 rounded-md bg-[#171714] px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(23,23,20,0.24)] transition hover:bg-[#2b2a26]"
          >
            Return one week later
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {panelVisible ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
          <section className="w-full max-w-xl rounded-md border border-[#bdb7ac] bg-[#fffdf8] p-5 shadow-[0_24px_70px_rgba(35,31,25,0.2)] sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-normal text-[#6b675f]">
              One week later
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Where were we?
            </h2>

            <form className="mt-6" onSubmit={requestContinuity}>
              <label htmlFor="continuity-prompt" className="sr-only">
                What do you want to continue?
              </label>
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <input
                  id="continuity-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  autoFocus
                  className="focus-ring h-12 min-w-0 flex-1 rounded-md border border-[#bdb7ac] bg-white px-4 text-base text-[#171714] outline-none placeholder:text-[#8a857c]"
                />
                <button
                  type="submit"
                  className="focus-ring inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#171714] px-5 text-sm font-semibold text-white transition hover:bg-[#2b2a26]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Continue
                </button>
              </div>
            </form>

            {phase === "error" ? (
              <div
                className="mt-4 flex items-start justify-between gap-4 border-t border-[#d4a99f] pt-4 text-sm text-[#813d30]"
                role="alert"
              >
                <p className="min-w-0 break-words">{error}</p>
                <button
                  type="button"
                  onClick={() => void requestContinuity()}
                  className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-md font-semibold underline decoration-1 underline-offset-4"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Retry
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {phase === "loading" ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-[23%] z-30 flex flex-col items-center px-4 text-center"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            className="h-5 w-5 animate-spin text-[#365f91]"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-semibold text-[#312d27]">
            Recovering the last coherent state...
          </p>
        </div>
      ) : null}
    </main>
  );
}
