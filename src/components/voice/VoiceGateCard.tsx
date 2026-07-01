"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock, ExternalLink, Mic2, RefreshCw, ShieldCheck, Trash2, X } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { extractFromTranscript, type VoiceExtractionResult } from "@/lib/voice-extraction";
import { loadMemoryRecords, saveMemoryRecords } from "@/lib/storage";
import type { MemoryRecord, PrivacyLevel } from "@/types";
import { PrivacyBadge } from "@/components/PrivacyBadge";

type Stage = "idle" | "listening" | "extracted" | "confirming" | "saved" | "discarded";

const CONFIRM_WORDS = ["confirm", "yes"];
const DISCARD_WORDS = ["discard", "no", "cancel"];

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

function buildMemoryRecord(result: VoiceExtractionResult, transcript: string): MemoryRecord {
  const createdAt = new Date().toISOString();

  return {
    id: `memory-voice-${Date.now()}`,
    personId: "person-a",
    type: result.sensitivity === "high" ? "temporary_health_context" : "preference",
    content: result.extractedContent,
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

function containsAnyPhrase(value: string, phrases: string[]) {
  const lowerValue = value.toLowerCase();
  return phrases.some((phrase) => lowerValue.includes(phrase));
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
  const confirmationStartedRef = useRef(false);
  const savedRecordRef = useRef<MemoryRecord | null>(null);
  const startTimerRef = useRef<number | null>(null);

  const liveTranscript = useMemo(
    () => [transcript, interimTranscript].filter(Boolean).join(" ").trim(),
    [interimTranscript, transcript]
  );

  const confirmationTranscript = stage === "confirming" ? liveTranscript : "";
  const transcriptPanelText = stage === "confirming" ? liveTranscript : capturedTranscript || liveTranscript;

  const resetFlow = useCallback(() => {
    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }

    resetSpeech();
    confirmationStartedRef.current = false;
    savedRecordRef.current = null;
    setStage("idle");
    setExtractionResult(null);
    setCapturedTranscript("");
    setSavedRecord(null);
    setLocalMessage(null);
  }, [resetSpeech]);

  const startListening = useCallback(() => {
    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
    }

    savedRecordRef.current = null;
    confirmationStartedRef.current = false;
    setStage("listening");
    setExtractionResult(null);
    setCapturedTranscript("");
    setSavedRecord(null);
    setLocalMessage(null);
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
    if (!extractionResult) {
      return;
    }

    if (savedRecordRef.current) {
      setStage("saved");
      return;
    }

    const record = buildMemoryRecord(extractionResult, capturedTranscript);
    saveMemoryRecords([...loadMemoryRecords(), record]);
    savedRecordRef.current = record;
    setSavedRecord(record);
    stopSpeech();
    setStage("saved");
  }, [capturedTranscript, extractionResult, stopSpeech]);

  const discardExtraction = useCallback(() => {
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
    if (stage !== "extracted" || !extractionResult) {
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
  }, [extractionResult, saveExtraction, stage]);

  useEffect(() => {
    if (stage !== "confirming") {
      confirmationStartedRef.current = false;
      return;
    }

    if (confirmationStartedRef.current) {
      return;
    }

    confirmationStartedRef.current = true;
    resetSpeech();

    const timer = window.setTimeout(() => {
      startSpeech();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [resetSpeech, stage, startSpeech]);

  useEffect(() => {
    if (stage !== "confirming" || !confirmationTranscript) {
      return;
    }

    if (containsAnyPhrase(confirmationTranscript, CONFIRM_WORDS)) {
      saveExtraction();
      return;
    }

    if (containsAnyPhrase(confirmationTranscript, DISCARD_WORDS)) {
      discardExtraction();
    }
  }, [confirmationTranscript, discardExtraction, saveExtraction, stage]);

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
                Saved as {savedRecord.type.replaceAll("_", " ")} for Person A. The transcript text is stored as evidence.
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
