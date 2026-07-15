"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock, ExternalLink, Mic2, RefreshCw, ShieldCheck, Trash2, X } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { promotionGate, type PromotionDecision } from "@/lib/promotion-gate";
import { extractFromTranscript, type VoiceExtractionResult } from "@/lib/voice-extraction";
import { loadMemoryRecords, saveMemoryRecords } from "@/lib/storage";
import type { FragmentOrigin, MemoryRecord, PrivacyLevel, UserStance } from "@/types";
import { PrivacyBadge } from "@/components/PrivacyBadge";

type Stage = "idle" | "listening" | "extracted" | "confirming" | "saved" | "discarded";

const CONFIRM_WORDS = ["confirm", "yes"];
const DISCARD_WORDS = ["discard", "no", "cancel"];
const ORIGIN_OPTIONS: Array<{ label: string; value: FragmentOrigin }> = [
  { label: "Mine", value: "self" },
  { label: "An AI's", value: "ai_output" },
  { label: "Someone else's", value: "other_person" },
  { label: "From content I read or watched", value: "external_content" }
];
const STANCE_OPTIONS: Array<{ label: string; value: UserStance }> = [
  { label: "Endorse", value: "endorsed" },
  { label: "Not sure", value: "undecided" },
  { label: "Skeptical", value: "skeptical" },
  { label: "Reject", value: "rejected" }
];

function stageLabel(stage: Stage) {
  switch (stage) {
    case "idle":
      return "Ready";
    case "listening":
      return "Listening";
    case "extracted":
      return "Extracted";
    case "confirming":
      return "Confirming";
    case "saved":
      return "Saved";
    case "discarded":
      return "Discarded";
  }
}

function sensitivityLabel(result: VoiceExtractionResult) {
  if (result.sensitivity === "high") {
    return "High sensitivity";
  }

  if (result.sensitivity === "medium") {
    return "Medium sensitivity";
  }

  return "Low sensitivity";
}

function privacyLevelForSensitivity(sensitivity: VoiceExtractionResult["sensitivity"]): PrivacyLevel {
  if (sensitivity === "high") {
    return "private";
  }

  if (sensitivity === "medium") {
    return "sensitive";
  }

  return "normal";
}

function buildMemoryRecord(
  result: VoiceExtractionResult,
  transcript: string,
  origin: FragmentOrigin,
  stance: UserStance,
  decision: PromotionDecision
): MemoryRecord {
  const createdAt = new Date().toISOString();

  return {
    id: `memory-voice-${Date.now()}`,
    personId: origin === "other_person" ? "person-a" : "self",
    type: result.sensitivity === "high" ? "temporary_health_context" : "preference",
    content: result.extractedContent,
    origin,
    stance,
    cognitiveType: "fact_claim",
    beliefStatus: decision.beliefStatus,
    revisionHistory: [
      {
        at: createdAt,
        from: decision.beliefStatus,
        to: decision.beliefStatus,
        note: `Initial capture: ${decision.ruleFired}`
      }
    ],
    evidence: transcript,
    sourceSnippetIds: [],
    createdAt,
    expiresAt: result.suggestedTtlDays
      ? new Date(Date.now() + result.suggestedTtlDays * 86400000).toISOString()
      : null,
    privacyLevel: privacyLevelForSensitivity(result.sensitivity),
    status: "active",
    allowedTaskTypes: [],
    blockedTaskTypes: []
  };
}

function containsAnyWord(value: string, words: string[]) {
  const tokens = new Set(value.toLowerCase().match(/[a-z]+/g) ?? []);
  return words.some((word) => tokens.has(word));
}

export function VoiceGateCard() {
  const {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start: startSpeech,
    stop: stopSpeech,
    reset: resetSpeech
  } = useSpeechRecognition();
  const [stage, setStage] = useState<Stage>("idle");
  const [extractionResult, setExtractionResult] = useState<VoiceExtractionResult | null>(null);
  const [capturedTranscript, setCapturedTranscript] = useState("");
  const [savedRecord, setSavedRecord] = useState<MemoryRecord | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [origin, setOrigin] = useState<FragmentOrigin | null>(null);
  const [stance, setStance] = useState<UserStance | null>(null);
  const [confirmationReady, setConfirmationReady] = useState(false);
  const confirmationStartedRef = useRef(false);
  const savedRecordRef = useRef<MemoryRecord | null>(null);
  const startTimerRef = useRef<number | null>(null);

  const liveTranscript = useMemo(
    () => [transcript, interimTranscript].filter(Boolean).join(" ").trim(),
    [interimTranscript, transcript]
  );
  const promotionDecision = useMemo(
    () => (origin && stance ? promotionGate({ origin, stance, isReaffirmation: false }) : null),
    [origin, stance]
  );

  const confirmationTranscript = stage === "confirming" && confirmationReady ? liveTranscript : "";
  const transcriptPanelText = stage === "confirming" ? liveTranscript : capturedTranscript || liveTranscript;

  const resetFlow = useCallback(() => {
    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }

    setConfirmationReady(false);
    resetSpeech();
    confirmationStartedRef.current = false;
    savedRecordRef.current = null;
    setStage("idle");
    setExtractionResult(null);
    setCapturedTranscript("");
    setSavedRecord(null);
    setLocalMessage(null);
    setOrigin(null);
    setStance(null);
  }, [resetSpeech]);

  const startListening = useCallback(() => {
    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
    }

    savedRecordRef.current = null;
    confirmationStartedRef.current = false;
    setConfirmationReady(false);
    setStage("listening");
    setExtractionResult(null);
    setCapturedTranscript("");
    setSavedRecord(null);
    setLocalMessage(null);
    setOrigin(null);
    setStance(null);
    resetSpeech();

    startTimerRef.current = window.setTimeout(() => {
      startTimerRef.current = null;
      startSpeech();
    }, 100);
  }, [resetSpeech, startSpeech]);

  const finishExtraction = useCallback(
    (transcript: string) => {
      const result = extractFromTranscript(transcript);

      if (!result.triggerMatched || !result.extractedContent) {
        setLocalMessage("I heard speech, but not a complete 'remember ...' instruction yet.");
        return;
      }

      stopSpeech();
      setCapturedTranscript(transcript);
      setExtractionResult(result);
      setStage("extracted");
      setLocalMessage(null);
    },
    [stopSpeech]
  );

  const saveExtraction = useCallback(() => {
    if (!extractionResult || !origin || !stance || !promotionDecision) {
      return;
    }

    if (savedRecordRef.current) {
      setStage("saved");
      return;
    }

    const record = buildMemoryRecord(extractionResult, capturedTranscript, origin, stance, promotionDecision);
    saveMemoryRecords([...loadMemoryRecords(), record]);
    savedRecordRef.current = record;
    setSavedRecord(record);
    setConfirmationReady(false);
    stopSpeech();
    setStage("saved");
  }, [capturedTranscript, extractionResult, origin, promotionDecision, stance, stopSpeech]);

  const discardExtraction = useCallback(() => {
    setConfirmationReady(false);
    stopSpeech();
    setStage("discarded");
  }, [stopSpeech]);

  useEffect(() => {
    if (stage === "listening" && error) {
      setStage("idle");
    }
  }, [error, stage]);

  useEffect(() => {
    return () => {
      if (startTimerRef.current !== null) {
        window.clearTimeout(startTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (stage !== "listening") {
      return;
    }

    const result = extractFromTranscript(liveTranscript);

    if (!result.triggerMatched || !result.extractedContent) {
      return;
    }

    const timer = window.setTimeout(() => {
      finishExtraction(liveTranscript);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [finishExtraction, liveTranscript, stage]);

  useEffect(() => {
    if (stage !== "extracted" || !extractionResult || !origin || !stance || !promotionDecision) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (extractionResult.requiresConfirmation) {
        setStage("confirming");
        return;
      }

      saveExtraction();
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [extractionResult, origin, promotionDecision, saveExtraction, stage, stance]);

  useEffect(() => {
    if (stage !== "confirming") {
      confirmationStartedRef.current = false;
      setConfirmationReady(false);
      return;
    }

    if (confirmationStartedRef.current) {
      return;
    }

    confirmationStartedRef.current = true;
    setConfirmationReady(false);
    resetSpeech();

    const timer = window.setTimeout(() => {
      setConfirmationReady(true);
      startSpeech();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [resetSpeech, stage, startSpeech]);

  useEffect(() => {
    if (stage !== "confirming" || !confirmationReady || !confirmationTranscript) {
      return;
    }

    if (containsAnyWord(confirmationTranscript, CONFIRM_WORDS)) {
      saveExtraction();
      return;
    }

    if (containsAnyWord(confirmationTranscript, DISCARD_WORDS)) {
      discardExtraction();
    }
  }, [confirmationReady, confirmationTranscript, discardExtraction, saveExtraction, stage]);

  if (!supported) {
    return (
      <section className="card-shell p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
            <Mic2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-950">请用 Chrome 打开</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              This page needs the browser SpeechRecognition API. Firefox and some Safari builds do not expose it.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.36fr)]">
      <div className="card-shell p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Voice MemoryGate</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Say "Hi Jarvis, remember..." to start</h2>
          </div>
          <PrivacyBadge value={stage === "saved" ? "active" : "mock"} label={stageLabel(stage)} />
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            {error}
          </div>
        ) : null}

        {localMessage ? (
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            {localMessage}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {stage === "idle" ? (
            <button
              type="button"
              onClick={startListening}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-4 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
            >
              <Mic2 className="h-4 w-4" aria-hidden="true" />
              Start microphone
            </button>
          ) : null}

          {stage === "listening" ? (
            <>
              <button
                type="button"
                onClick={() => finishExtraction(liveTranscript)}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Done
              </button>
              <button
                type="button"
                onClick={resetFlow}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </button>
            </>
          ) : null}

          {stage === "extracted" ? (
            <button
              type="button"
              onClick={discardExtraction}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Discard
            </button>
          ) : null}

          {stage === "confirming" ? (
            <>
              <button
                type="button"
                onClick={saveExtraction}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Confirm
              </button>
              <button
                type="button"
                onClick={discardExtraction}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Discard
              </button>
            </>
          ) : null}

          {stage === "saved" ? (
            <>
              <Link
                href="/memory-library"
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-4 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                View in Memory Library
              </Link>
              <button
                type="button"
                onClick={resetFlow}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
            </>
          ) : null}

          {stage === "discarded" ? (
            <button
              type="button"
              onClick={resetFlow}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-4 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          ) : null}
        </div>

        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              {stage === "listening" || stage === "confirming" ? "Live transcript" : "Captured transcript"}
            </p>
            {listening ? (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Listening
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500">Not listening</span>
            )}
          </div>
          <div className="mt-3 min-h-28 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-800">
            {transcriptPanelText ? (
              stage === "listening" || stage === "confirming" ? (
                <>
                  <span>{transcript}</span>
                  {interimTranscript ? <span className="text-slate-400"> {interimTranscript}</span> : null}
                </>
              ) : (
                <span>{transcriptPanelText}</span>
              )
            ) : (
              <span className="text-slate-400">Waiting for speech...</span>
            )}
          </div>
        </div>

        {stage === "discarded" ? (
          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            Not saved.
          </div>
        ) : null}
      </div>

      <aside className="grid gap-4">
        <section className="card-shell p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">State</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{stageLabel(stage)}</p>
            </div>
          </div>
        </section>

        {extractionResult ? (
          <section className="card-shell p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Gate result</p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">{sensitivityLabel(extractionResult)}</h3>
              </div>
              <PrivacyBadge value={privacyLevelForSensitivity(extractionResult.sensitivity)} />
            </div>

            <dl className="mt-4 grid gap-3 text-sm text-slate-700">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Content</dt>
                <dd className="mt-1 rounded-md border border-slate-100 bg-slate-50 p-3 leading-6">
                  {extractionResult.extractedContent}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Whose view is this?</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {ORIGIN_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={origin === option.value}
                      disabled={stage !== "extracted"}
                      onClick={() => setOrigin(option.value)}
                      className={`focus-ring min-h-9 rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors disabled:cursor-default disabled:opacity-70 ${
                        origin === option.value
                          ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Your stance right now?</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {STANCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={stance === option.value}
                      disabled={stage !== "extracted"}
                      onClick={() => setStance(option.value)}
                      className={`focus-ring min-h-9 rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors disabled:cursor-default disabled:opacity-70 ${
                        stance === option.value
                          ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </dd>
              </div>
              {promotionDecision ? (
                <>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Belief status</dt>
                    <dd className="mt-1 font-mono text-xs font-semibold text-indigo-800">
                      {promotionDecision.beliefStatus}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Rule fired</dt>
                    <dd className="mt-1 leading-6 text-slate-800">{promotionDecision.ruleFired}</dd>
                  </div>
                </>
              ) : (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Promotion decision</dt>
                  <dd className="mt-1 leading-6 text-slate-500">Select an origin and stance to continue.</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">TTL</dt>
                <dd className="mt-1">
                  {extractionResult.suggestedTtlDays ? `${extractionResult.suggestedTtlDays} days` : "No automatic expiry"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Confirmation</dt>
                <dd className="mt-1">{extractionResult.requiresConfirmation ? "Required" : "Not required"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Matched keywords</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {extractionResult.matchedKeywords.length ? (
                    extractionResult.matchedKeywords.map((keyword) => (
                      <span key={keyword} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span>None</span>
                  )}
                </dd>
              </div>
            </dl>

            {stage === "confirming" ? (
              <div className="mt-4 rounded-md border border-indigo-100 bg-indigo-50 p-3 text-sm leading-6 text-indigo-900">
                Say "confirm" or "discard", or use the buttons.
              </div>
            ) : null}

            {stage === "saved" && savedRecord ? (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
                Saved as {savedRecord.type.replaceAll("_", " ")} for {savedRecord.personId === "person-a" ? "Person A" : "you"}.
                The transcript text is stored as evidence.
              </div>
            ) : null}
          </section>
        ) : (
          <section className="card-shell p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Gate result</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Waiting for a completed remember instruction.</p>
              </div>
            </div>
          </section>
        )}
      </aside>
    </section>
  );
}
