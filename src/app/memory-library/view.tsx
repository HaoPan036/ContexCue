"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Brain,
  Check,
  ClipboardCopy,
  Clock,
  Database,
  FileText,
  Inbox,
  Plus,
  Search,
  ShieldCheck,
  X
} from "lucide-react";
import { MemoryRecordCard } from "@/components/MemoryRecordCard";
import { useDemoState } from "@/hooks/useDemoState";
import {
  FRAGMENT_SOURCE_LABELS,
  buildContextPacket,
  buildWeeklyCognitiveReport,
  retrieveCognitiveRecords
} from "@/lib/cognitive-loop";
import type {
  CognitiveMemoryRecord,
  WeeklyCognitiveReport
} from "@/lib/cognitive-loop";
import { promotionGate } from "@/lib/promotion-gate";
import type {
  CognitiveFragment,
  CognitiveType,
  FragmentOrigin,
  FragmentSource,
  MemoryRecord,
  UserStance
} from "@/types";

type WorkspaceTab = "inbox" | "weekly" | "recall";
type Feedback = { kind: "error" | "success"; message: string } | null;
type CopyState = "idle" | "copied" | "failed";

const WORKSPACE_TABS = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "weekly", label: "7-day review", icon: BarChart3 },
  { id: "recall", label: "Topic recall", icon: Search }
] as const;

const FRAGMENT_SOURCES: FragmentSource[] = [
  "ai_output",
  "conversation",
  "own_output",
  "external_content",
  "quick_note"
];

const ORIGIN_OPTIONS: Array<{ value: FragmentOrigin; label: string }> = [
  { value: "self", label: "Mine" },
  { value: "ai_output", label: "An AI's" },
  { value: "other_person", label: "Someone else's" },
  { value: "external_content", label: "Read/watched content" }
];

const STANCE_OPTIONS: Array<{ value: UserStance; label: string }> = [
  { value: "endorsed", label: "Endorse" },
  { value: "undecided", label: "Not sure" },
  { value: "skeptical", label: "Skeptical" },
  { value: "rejected", label: "Reject" }
];

const COGNITIVE_TYPE_OPTIONS: Array<{ value: CognitiveType; label: string }> = [
  { value: "fact_claim", label: "Fact claim" },
  { value: "value_judgment", label: "Value judgment" },
  { value: "hypothesis", label: "Hypothesis" },
  { value: "question", label: "Question" }
];

const ORIGIN_LABELS: Record<FragmentOrigin, string> = {
  self: "Mine",
  ai_output: "AI output",
  other_person: "Other person",
  external_content: "External content"
};

const STANCE_LABELS: Record<UserStance, string> = {
  endorsed: "Endorsed",
  undecided: "Not sure",
  skeptical: "Skeptical",
  rejected: "Rejected"
};

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

function timestampValue(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function sortRecordsNewestFirst(records: MemoryRecord[]) {
  return [...records].sort((left, right) => {
    const timestampDifference =
      timestampValue(right.createdAt) - timestampValue(left.createdAt);

    return timestampDifference || left.id.localeCompare(right.id);
  });
}

function sortInboxNewestFirst(fragments: CognitiveFragment[]) {
  return fragments
    .filter((fragment) => fragment.status === "inbox")
    .sort(
      (left, right) =>
        timestampValue(right.capturedAt) - timestampValue(left.capturedAt)
    );
}

function tabButtonId(tab: WorkspaceTab) {
  return `cognitive-memory-tab-${tab}`;
}

function tabPanelId(tab: WorkspaceTab) {
  return `cognitive-memory-panel-${tab}`;
}

function CognitiveMemoryHeader() {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700">
            <Brain className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="text-3xl font-semibold leading-tight text-slate-950">
            Cognitive Memory
          </h1>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Captured fragments and reviewed records stay in this browser&apos;s localStorage;
          there is no server sync.
        </p>
      </div>
      <div className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Local only
      </div>
    </header>
  );
}

function RecordGroup({
  title,
  records,
  emptyMessage,
  note,
  showBeliefStatus = false,
  tone = "slate"
}: {
  title: string;
  records: CognitiveMemoryRecord[];
  emptyMessage: string;
  note?: string;
  showBeliefStatus?: boolean;
  tone?: "emerald" | "amber" | "sky" | "rose" | "slate";
}) {
  const toneClasses = {
    emerald: "border-t-emerald-500",
    amber: "border-t-amber-500",
    sky: "border-t-sky-500",
    rose: "border-t-rose-500",
    slate: "border-t-slate-500"
  }[tone];

  return (
    <section
      className={`flex min-h-56 min-w-0 flex-col rounded-md border border-slate-200 border-t-4 bg-white p-4 ${toneClasses}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        <span className="shrink-0 text-xs font-semibold text-slate-500">
          {records.length}
        </span>
      </div>
      {note ? <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p> : null}

      {records.length > 0 ? (
        <ul className="mt-3 divide-y divide-slate-100">
          {records.map((record) => (
            <li key={record.id} className="py-3 first:pt-0 last:pb-0">
              <p className="break-words text-sm leading-6 text-slate-800">
                {record.content}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>Origin: {ORIGIN_LABELS[record.origin]}</span>
                <span>Stance: {STANCE_LABELS[record.stance]}</span>
                {showBeliefStatus ? (
                  <span>Belief status: {record.beliefStatus}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">{emptyMessage}</p>
      )}
    </section>
  );
}

function WeeklyReviewPanel({ report }: { report: WeeklyCognitiveReport }) {
  const reaffirmedChanges = report.reaffirmedRecords.flatMap(({ record, revisions }) =>
    revisions.map((revision, index) => ({
      id: `${record.id}-${revision.at}-${index}`,
      record,
      revision
    }))
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-950">7-day review</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(report.windowStart)} to {formatDate(report.windowEnd)}
          </p>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-slate-200 rounded-md border border-slate-200 bg-slate-50">
          <div className="min-w-0 px-3 py-2 text-center sm:px-5">
            <dt className="text-xs text-slate-500">Captured</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-950">
              {report.capturedFragments.length}
            </dd>
          </div>
          <div className="min-w-0 px-3 py-2 text-center sm:px-5">
            <dt className="text-xs text-slate-500">Reviewed</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-950">
              {report.reviewedFragments.length}
            </dd>
          </div>
          <div className="min-w-0 px-3 py-2 text-center sm:px-5">
            <dt className="text-xs text-slate-500">Reaffirmed</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-950">
              {reaffirmedChanges.length}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RecordGroup
          title="Your beliefs"
          records={report.buckets.userBeliefs}
          emptyMessage="No belief activity in this period."
          tone="emerald"
        />
        <RecordGroup
          title="Candidates"
          records={report.buckets.candidates}
          emptyMessage="No candidate activity in this period."
          tone="amber"
        />
        <RecordGroup
          title="External references"
          records={report.buckets.externalReferences}
          emptyMessage="No external-reference activity in this period."
          tone="sky"
        />
        <RecordGroup
          title="Rejected / challenged"
          records={report.buckets.rejected}
          emptyMessage="No rejected or challenged activity in this period."
          tone="rose"
        />
      </div>

      {reaffirmedChanges.length > 0 ? (
        <section className="mt-6 border-t border-slate-200 pt-5" aria-labelledby="reaffirmations-title">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <h3 id="reaffirmations-title" className="text-sm font-semibold text-slate-950">
              Reaffirmations
            </h3>
          </div>
          <ul className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
            {reaffirmedChanges.map(({ id, record, revision }) => (
              <li key={id} className="py-3">
                <p className="break-words text-sm leading-6 text-slate-800 [overflow-wrap:anywhere]">
                  {record.content}
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-slate-500 [overflow-wrap:anywhere]">
                  <time dateTime={revision.at}>{formatDateTime(revision.at)}</time>
                  {" / "}
                  {revision.from} to {revision.to}
                  {" / "}
                  {revision.note}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function MemoryLibrary() {
  const {
    hasLoaded,
    persistenceError,
    memoryRecords,
    cognitiveFragments,
    updateMemoryStatus,
    editMemoryContent,
    reaffirmMemory,
    addCognitiveFragment,
    reviewCognitiveFragment,
    dismissCognitiveFragment
  } = useDemoState();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("inbox");
  const [captureContent, setCaptureContent] = useState("");
  const [sourceContext, setSourceContext] = useState("");
  const [fragmentSource, setFragmentSource] = useState<FragmentSource>("quick_note");
  const [captureFeedback, setCaptureFeedback] = useState<Feedback>(null);
  const [selectNewestAfterCapture, setSelectNewestAfterCapture] = useState(false);
  const [selectedFragmentId, setSelectedFragmentId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<FragmentOrigin>("self");
  const [stance, setStance] = useState<UserStance | null>(null);
  const [cognitiveType, setCognitiveType] = useState<CognitiveType>("hypothesis");
  const [reviewFeedback, setReviewFeedback] = useState<Feedback>(null);
  const [recallQuery, setRecallQuery] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [clipboardFallback, setClipboardFallback] = useState("");
  const [evaluationNow, setEvaluationNow] = useState(() => new Date());
  const copyRequestRef = useRef(0);
  const shouldFocusReviewRef = useRef(false);
  const dailyReviewHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const selectedReviewHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const refreshEvaluationNow = useCallback(() => setEvaluationNow(new Date()), []);

  const inboxFragments = useMemo(
    () => sortInboxNewestFirst(cognitiveFragments),
    [cognitiveFragments]
  );
  const selectedFragment = inboxFragments.find(
    (fragment) => fragment.id === selectedFragmentId
  );
  const weeklyReport = useMemo(
    () => buildWeeklyCognitiveReport(memoryRecords, cognitiveFragments, evaluationNow),
    [cognitiveFragments, evaluationNow, memoryRecords]
  );
  const recalledBuckets = useMemo(
    () => retrieveCognitiveRecords(memoryRecords, recallQuery, evaluationNow),
    [evaluationNow, memoryRecords, recallQuery]
  );
  const contextPacket = useMemo(
    () => buildContextPacket(recallQuery, recalledBuckets),
    [recallQuery, recalledBuckets]
  );
  const newestMemoryRecords = useMemo(
    () => sortRecordsNewestFirst(memoryRecords),
    [memoryRecords]
  );
  const promotionPreview = stance
    ? promotionGate({ origin, stance, isReaffirmation: false })
    : null;
  const hasRecallQuery = recallQuery.trim().length > 0;
  const recallResultCount =
    recalledBuckets.userBeliefs.length +
    recalledBuckets.candidates.length +
    recalledBuckets.externalReferences.length +
    recalledBuckets.rejected.length;
  const stanceError = reviewFeedback?.kind === "error" ? reviewFeedback.message : null;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshEvaluationNow();
      }
    };

    refreshEvaluationNow();
    window.addEventListener("focus", refreshEvaluationNow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = window.setInterval(refreshEvaluationNow, 60_000);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshEvaluationNow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasLoaded, refreshEvaluationNow]);

  useEffect(() => {
    copyRequestRef.current += 1;
    setCopyState("idle");
    setClipboardFallback("");
  }, [contextPacket]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    if (selectNewestAfterCapture) {
      shouldFocusReviewRef.current = true;
      setSelectedFragmentId(inboxFragments[0]?.id ?? null);
      setSelectNewestAfterCapture(false);
      return;
    }

    const selectionStillExists = inboxFragments.some(
      (fragment) => fragment.id === selectedFragmentId
    );

    if (!selectionStillExists) {
      setSelectedFragmentId(inboxFragments[0]?.id ?? null);
    }
  }, [hasLoaded, inboxFragments, selectNewestAfterCapture, selectedFragmentId]);

  useEffect(() => {
    if (!hasLoaded || !shouldFocusReviewRef.current) {
      return;
    }

    const target = selectedFragment
      ? selectedReviewHeadingRef.current
      : inboxFragments.length === 0
        ? dailyReviewHeadingRef.current
        : null;

    if (!target) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      target.focus();
      shouldFocusReviewRef.current = false;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [hasLoaded, inboxFragments.length, selectedFragment]);

  useEffect(() => {
    if (!selectedFragment) {
      return;
    }

    setOrigin(selectedFragment.origin);
    setStance(null);
    setCognitiveType(selectedFragment.cognitiveType);
  }, [selectedFragment]);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, tab: WorkspaceTab) {
    const currentIndex = WORKSPACE_TABS.findIndex((option) => option.id === tab);
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % WORKSPACE_TABS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + WORKSPACE_TABS.length) % WORKSPACE_TABS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = WORKSPACE_TABS.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    const nextTab = WORKSPACE_TABS[nextIndex].id;
    setActiveTab(nextTab);
    document.getElementById(tabButtonId(nextTab))?.focus();
  }

  function handleCapture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!captureContent.trim()) {
      setCaptureFeedback({
        kind: "error",
        message: "Enter a fragment before adding it."
      });
      return;
    }

    const added = addCognitiveFragment({
      content: captureContent,
      source: fragmentSource,
      sourceContext
    });

    if (!added) {
      setCaptureFeedback({
        kind: "error",
        message: "The fragment could not be added. Check the text and try again."
      });
      return;
    }

    refreshEvaluationNow();
    setCaptureContent("");
    setSourceContext("");
    setFragmentSource("quick_note");
    setSelectNewestAfterCapture(true);
    setReviewFeedback(null);
    setCaptureFeedback({ kind: "success", message: "Fragment added to the inbox." });
  }

  function nextFragmentId(currentId: string) {
    const currentIndex = inboxFragments.findIndex((fragment) => fragment.id === currentId);

    if (currentIndex < 0) {
      return inboxFragments[0]?.id ?? null;
    }

    return (
      inboxFragments[currentIndex + 1]?.id ??
      inboxFragments[currentIndex - 1]?.id ??
      null
    );
  }

  function saveReview() {
    if (!selectedFragment) {
      return;
    }

    if (!stance) {
      setReviewFeedback({
        kind: "error",
        message: "Choose a stance before recording the review."
      });
      return;
    }

    const nextId = nextFragmentId(selectedFragment.id);
    shouldFocusReviewRef.current = true;
    reviewCognitiveFragment(selectedFragment.id, { origin, stance, cognitiveType });
    refreshEvaluationNow();
    setSelectedFragmentId(nextId);
    setReviewFeedback({
      kind: "success",
      message: nextId
        ? "Review recorded. The next item is selected."
        : "Review recorded. Inbox complete."
    });
  }

  function dismissReview() {
    if (!selectedFragment) {
      return;
    }

    const nextId = nextFragmentId(selectedFragment.id);
    shouldFocusReviewRef.current = true;
    dismissCognitiveFragment(selectedFragment.id);
    refreshEvaluationNow();
    setSelectedFragmentId(nextId);
    setReviewFeedback({
      kind: "success",
      message: nextId ? "Fragment dismissed. The next item is selected." : "Fragment dismissed. Inbox complete."
    });
  }

  async function copyContextPacket() {
    if (!hasRecallQuery) {
      return;
    }

    const requestId = ++copyRequestRef.current;
    const packet = contextPacket;
    setCopyState("idle");
    setClipboardFallback("");

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(packet);

      if (requestId !== copyRequestRef.current) {
        return;
      }

      setCopyState("copied");
      setClipboardFallback("");
    } catch {
      if (requestId !== copyRequestRef.current) {
        return;
      }

      setCopyState("failed");
      setClipboardFallback(packet);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <CognitiveMemoryHeader />

      {persistenceError ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Local persistence is unavailable.</p>
            <p>{persistenceError}</p>
          </div>
        </div>
      ) : null}

      {!hasLoaded ? (
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-48 items-center justify-center gap-3 border-y border-slate-200 bg-white px-4 text-sm text-slate-600"
        >
          <Clock className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          Loading local cognitive memory...
        </div>
      ) : (
        <>
          <section aria-label="Cognitive memory workspace" className="border-y border-slate-200 bg-white">
            <div
              role="tablist"
              aria-label="Cognitive memory views"
              className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2"
            >
              {WORKSPACE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    id={tabButtonId(tab.id)}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={tabPanelId(tab.id)}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                    className={`focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-indigo-200 bg-white text-indigo-700 shadow-sm"
                        : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{tab.label}</span>
                    {tab.id === "inbox" ? (
                      <span className="min-w-5 rounded-full bg-slate-200 px-1.5 py-0.5 text-center text-xs font-semibold text-slate-700">
                        {inboxFragments.length}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {activeTab === "inbox" ? (
              <div
                id={tabPanelId("inbox")}
                role="tabpanel"
                aria-labelledby={tabButtonId("inbox")}
                tabIndex={0}
                className="focus-ring"
              >
                <section className="border-b border-slate-200 p-4 sm:p-6" aria-labelledby="capture-fragment-title">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                    <h2 id="capture-fragment-title" className="text-lg font-semibold text-slate-950">
                      Capture a fragment
                    </h2>
                  </div>

                  <form onSubmit={handleCapture} className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="lg:col-span-2">
                      <label htmlFor="fragment-content" className="text-sm font-medium text-slate-800">
                        Exact fragment
                      </label>
                      <textarea
                        id="fragment-content"
                        value={captureContent}
                        onChange={(event) => {
                          setCaptureContent(event.target.value);
                          if (captureFeedback?.kind === "error") {
                            setCaptureFeedback(null);
                          }
                        }}
                        rows={3}
                        aria-invalid={captureFeedback?.kind === "error"}
                        aria-describedby="capture-feedback"
                        placeholder="Paste or type the exact thought, claim, or question."
                        className="focus-ring mt-1 w-full rounded-md border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="fragment-context" className="text-sm font-medium text-slate-800">
                        Source context <span className="font-normal text-slate-500">(optional)</span>
                      </label>
                      <input
                        id="fragment-context"
                        type="text"
                        value={sourceContext}
                        onChange={(event) => setSourceContext(event.target.value)}
                        placeholder="Where this came from"
                        className="focus-ring mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="fragment-source" className="text-sm font-medium text-slate-800">
                        Source
                      </label>
                      <select
                        id="fragment-source"
                        value={fragmentSource}
                        onChange={(event) => setFragmentSource(event.target.value as FragmentSource)}
                        className="focus-ring mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
                      >
                        {FRAGMENT_SOURCES.map((source) => (
                          <option key={source} value={source}>
                            {FRAGMENT_SOURCE_LABELS[source]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
                      <button
                        type="submit"
                        className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-indigo-600 bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add to inbox
                      </button>
                      <p
                        id="capture-feedback"
                        role="status"
                        aria-live="polite"
                        className={`text-sm ${
                          captureFeedback?.kind === "error" ? "text-rose-700" : "text-emerald-700"
                        }`}
                      >
                        {captureFeedback?.message ?? ""}
                      </p>
                    </div>
                  </form>
                </section>

                <section aria-labelledby="daily-review-title">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                        <h2
                          ref={dailyReviewHeadingRef}
                          id="daily-review-title"
                          tabIndex={-1}
                          className="focus-ring rounded-sm text-lg font-semibold text-slate-950"
                        >
                          Daily 3-minute review
                        </h2>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {inboxFragments.length} {inboxFragments.length === 1 ? "item" : "items"} remaining
                      </p>
                    </div>
                    <p
                      role="status"
                      aria-live="polite"
                      className="text-sm text-emerald-700"
                    >
                      {reviewFeedback?.kind === "success" ? reviewFeedback.message : ""}
                    </p>
                  </div>

                  <div className="grid min-w-0 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)]">
                    <div className="min-w-0 border-b border-slate-200 lg:border-b-0 lg:border-r">
                      <h3 className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase text-slate-500 sm:px-6">
                        Inbox items
                      </h3>
                      {inboxFragments.length > 0 ? (
                        <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto lg:max-h-[42rem]">
                          {inboxFragments.map((fragment) => {
                            const isSelected = fragment.id === selectedFragmentId;

                            return (
                              <li key={fragment.id}>
                                <button
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() => {
                                    if (isSelected) {
                                      window.requestAnimationFrame(() =>
                                        selectedReviewHeadingRef.current?.focus()
                                      );
                                      return;
                                    }

                                    shouldFocusReviewRef.current = true;
                                    setSelectedFragmentId(fragment.id);
                                    setReviewFeedback(null);
                                  }}
                                  className={`focus-ring w-full px-4 py-4 text-left sm:px-6 ${
                                    isSelected
                                      ? "bg-indigo-50 text-slate-950"
                                      : "bg-white text-slate-800 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <span className="font-semibold text-indigo-700">
                                      {FRAGMENT_SOURCE_LABELS[fragment.source]}
                                    </span>
                                    <time dateTime={fragment.capturedAt} className="text-slate-500">
                                      {formatDateTime(fragment.capturedAt)}
                                    </time>
                                  </span>
                                  <span className="mt-2 block break-words text-sm leading-6 [overflow-wrap:anywhere]">
                                    {fragment.content}
                                  </span>
                                  <span className="mt-2 block break-words text-xs leading-5 text-slate-500 [overflow-wrap:anywhere]">
                                    {fragment.sourceContext || "No source context"}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="px-4 py-8 text-sm leading-6 text-slate-500 sm:px-6">
                          Inbox clear. Add a fragment when something is worth reviewing.
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 p-4 sm:p-6">
                      {selectedFragment ? (
                        <div>
                          <div className="border-l-4 border-indigo-300 pl-4">
                            <h3
                              ref={selectedReviewHeadingRef}
                              tabIndex={-1}
                              className="focus-ring break-words rounded-sm text-base font-medium leading-7 text-slate-950 [overflow-wrap:anywhere]"
                            >
                              {selectedFragment.content}
                            </h3>
                            <p className="mt-1 break-words text-xs leading-5 text-slate-500 [overflow-wrap:anywhere]">
                              {FRAGMENT_SOURCE_LABELS[selectedFragment.source]}
                              {selectedFragment.sourceContext
                                ? ` / ${selectedFragment.sourceContext}`
                                : ""}
                            </p>
                          </div>

                          <div className="mt-6 grid gap-5">
                            <fieldset>
                              <legend className="text-sm font-medium text-slate-800">
                                Origin <span className="text-rose-700">(required)</span>
                              </legend>
                              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                {ORIGIN_OPTIONS.map((option) => {
                                  const isSelected = origin === option.value;
                                  const inputId = `review-origin-${selectedFragment.id}-${option.value}`;

                                  return (
                                    <label
                                      key={option.value}
                                      htmlFor={inputId}
                                      className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-left text-sm font-medium focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 ${
                                        isSelected
                                          ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                      }`}
                                    >
                                      <input
                                        id={inputId}
                                        type="radio"
                                        name={`review-origin-${selectedFragment.id}`}
                                        value={option.value}
                                        checked={isSelected}
                                        required
                                        onChange={() => setOrigin(option.value)}
                                        className="h-4 w-4 shrink-0 accent-indigo-600"
                                      />
                                      <span>{option.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </fieldset>

                            <fieldset aria-describedby={stanceError ? "stance-error" : "stance-requirement"}>
                              <legend className="text-sm font-medium text-slate-800">
                                Stance <span className="text-rose-700">(required)</span>
                              </legend>
                              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {STANCE_OPTIONS.map((option) => {
                                  const isSelected = stance === option.value;
                                  const inputId = `review-stance-${selectedFragment.id}-${option.value}`;

                                  return (
                                    <label
                                      key={option.value}
                                      htmlFor={inputId}
                                      className={`flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 ${
                                        isSelected
                                          ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                      }`}
                                    >
                                      <input
                                        id={inputId}
                                        type="radio"
                                        name={`review-stance-${selectedFragment.id}`}
                                        value={option.value}
                                        checked={isSelected}
                                        required
                                        aria-invalid={Boolean(stanceError)}
                                        aria-describedby={stanceError ? "stance-error" : "stance-requirement"}
                                        onChange={() => {
                                          setStance(option.value);
                                          if (reviewFeedback?.kind === "error") {
                                            setReviewFeedback(null);
                                          }
                                        }}
                                        className="h-4 w-4 shrink-0 accent-indigo-600"
                                      />
                                      <span>{option.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              <p id="stance-requirement" className="sr-only">
                                Select one stance before recording the review.
                              </p>
                              {stanceError ? (
                                <p id="stance-error" role="alert" className="mt-2 text-sm text-rose-700">
                                  {stanceError}
                                </p>
                              ) : null}
                            </fieldset>

                            <div>
                              <label htmlFor="cognitive-type" className="text-sm font-medium text-slate-800">
                                Cognitive type
                              </label>
                              <select
                                id="cognitive-type"
                                value={cognitiveType}
                                onChange={(event) => setCognitiveType(event.target.value as CognitiveType)}
                                className="focus-ring mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 sm:max-w-sm"
                              >
                                {COGNITIVE_TYPE_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <section className="rounded-md border border-slate-200 bg-slate-50 p-4" aria-labelledby="promotion-preview-title">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                                <h3 id="promotion-preview-title" className="text-sm font-semibold text-slate-950">
                                  Promotion preview
                                </h3>
                              </div>
                              <p className="mt-2 text-sm font-medium text-slate-700">
                                A first review never creates a long-term belief.
                              </p>
                              {promotionPreview ? (
                                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                                  <div>
                                    <dt className="text-xs font-semibold uppercase text-slate-500">
                                      Belief status
                                    </dt>
                                    <dd className="mt-1 break-words font-mono text-slate-900">
                                      {promotionPreview.beliefStatus}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-xs font-semibold uppercase text-slate-500">
                                      Rule fired
                                    </dt>
                                    <dd className="mt-1 break-words leading-6 text-slate-900">
                                      {promotionPreview.ruleFired}
                                    </dd>
                                  </div>
                                </dl>
                              ) : (
                                <p className="mt-3 text-sm text-slate-500">
                                  Choose a stance to preview the decision.
                                </p>
                              )}
                            </section>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={saveReview}
                                className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                              >
                                <Check className="h-4 w-4" aria-hidden="true" />
                                Record review
                              </button>
                              <button
                                type="button"
                                onClick={dismissReview}
                                className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <X className="h-4 w-4" aria-hidden="true" />
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex min-h-56 items-center justify-center text-center text-sm leading-6 text-slate-500">
                          {inboxFragments.length > 0
                            ? "Selecting the next inbox item..."
                            : "No fragment is waiting for review."}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            ) : null}

            {activeTab === "weekly" ? (
              <div
                id={tabPanelId("weekly")}
                role="tabpanel"
                aria-labelledby={tabButtonId("weekly")}
                tabIndex={0}
                className="focus-ring"
              >
                <WeeklyReviewPanel report={weeklyReport} />
              </div>
            ) : null}

            {activeTab === "recall" ? (
              <div
                id={tabPanelId("recall")}
                role="tabpanel"
                aria-labelledby={tabButtonId("recall")}
                tabIndex={0}
                className="focus-ring p-4 sm:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="w-full max-w-2xl">
                    <label htmlFor="topic-recall-query" className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <Search className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                      Topic query
                    </label>
                    <input
                      id="topic-recall-query"
                      type="search"
                      value={recallQuery}
                      onChange={(event) => {
                        copyRequestRef.current += 1;
                        setRecallQuery(event.target.value);
                        setCopyState("idle");
                        setClipboardFallback("");
                      }}
                      placeholder="Search a topic"
                      className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400"
                    />
                    <p
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                      className="mt-2 text-xs text-slate-500"
                    >
                      Local keyword match only. {hasRecallQuery ? `${recallResultCount} results.` : "Enter a topic to begin."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={copyContextPacket}
                      disabled={!hasRecallQuery}
                      className="focus-ring inline-flex min-h-10 min-w-48 items-center justify-center gap-2 rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {copyState === "copied" ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
                      )}
                      Copy context for AI
                    </button>
                    <p
                      role="status"
                      aria-live="polite"
                      className={copyState === "failed" ? "text-sm text-rose-700" : "text-sm text-emerald-700"}
                    >
                      {copyState === "copied"
                        ? "Context copied."
                        : copyState === "failed"
                          ? "Clipboard unavailable. Use the packet below."
                          : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <RecordGroup
                    title="Your beliefs"
                    records={recalledBuckets.userBeliefs}
                    emptyMessage={hasRecallQuery ? "No matching beliefs." : "No topic entered."}
                    showBeliefStatus
                    tone="emerald"
                  />
                  <RecordGroup
                    title="Candidates"
                    records={recalledBuckets.candidates}
                    emptyMessage={hasRecallQuery ? "No matching candidates." : "No topic entered."}
                    showBeliefStatus
                    tone="amber"
                  />
                  <RecordGroup
                    title="External references"
                    records={recalledBuckets.externalReferences}
                    emptyMessage={hasRecallQuery ? "No matching external references." : "No topic entered."}
                    note="Not your view."
                    showBeliefStatus
                    tone="sky"
                  />
                  <RecordGroup
                    title="Rejected / challenged"
                    records={recalledBuckets.rejected}
                    emptyMessage={hasRecallQuery ? "No matching rejected or challenged items." : "No topic entered."}
                    note="Do not use as belief."
                    showBeliefStatus
                    tone="rose"
                  />
                </div>

                {copyState === "failed" ? (
                  <div className="mt-6">
                    <label htmlFor="context-packet-fallback" className="text-sm font-medium text-slate-800">
                      Context packet
                    </label>
                    <textarea
                      id="context-packet-fallback"
                      readOnly
                      value={clipboardFallback}
                      rows={14}
                      className="focus-ring mt-2 w-full rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-800"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="mt-10" aria-labelledby="memory-records-title">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                <h2 id="memory-records-title" className="text-lg font-semibold text-slate-950">
                  Memory records
                </h2>
              </div>
              <span className="text-sm text-slate-500">
                {newestMemoryRecords.length} {newestMemoryRecords.length === 1 ? "record" : "records"}, newest first
              </span>
            </div>

            {newestMemoryRecords.length > 0 ? (
              <div className="grid gap-4">
                {newestMemoryRecords.map((record) => (
                  <MemoryRecordCard
                    key={record.id}
                    record={record}
                    onStatusChange={(status) => {
                      updateMemoryStatus(record.id, status);
                      refreshEvaluationNow();
                    }}
                    onEdit={(content) => {
                      editMemoryContent(record.id, content);
                      refreshEvaluationNow();
                    }}
                    onReaffirm={() => {
                      reaffirmMemory(record.id);
                      refreshEvaluationNow();
                    }}
                    now={evaluationNow}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No reviewed memory records yet.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
