"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { ContextCueStatus } from "@/components/cross-app/ContextCueStatus";
import { DemoStepper } from "@/components/cross-app/DemoStepper";
import { DoubaoMockup } from "@/components/cross-app/DoubaoMockup";
import { FAQDrawer } from "@/components/cross-app/FAQDrawer";
import { MemoryGatePanel } from "@/components/cross-app/MemoryGatePanel";
import { ParsedIntentCard } from "@/components/cross-app/ParsedIntentCard";
import { ReplySuggestionCard } from "@/components/cross-app/ReplySuggestionCard";
import { VoiceTriggerBar } from "@/components/cross-app/VoiceTriggerBar";
import { WeChatMockup } from "@/components/cross-app/WeChatMockup";
import {
  crossAppGateDecisions,
  crossAppSources,
  faqItems,
  memoryOperations,
  parsedIntents,
  replySuggestion,
  voiceCommand
} from "@/lib/cross-app-demo";
import { STORAGE_KEYS, clearDemoStorage } from "@/lib/storage";

const MAX_STAGE = 5;

function saveCrossAppState(feedbackUsed: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.crossAppMemoryOperations, JSON.stringify(memoryOperations));

  if (feedbackUsed) {
    window.localStorage.setItem(
      STORAGE_KEYS.crossAppFeedbackEvent,
      JSON.stringify({
        id: `cross-app-feedback-${Date.now()}`,
        selectedStyle: "warm_low_pressure",
        savedPreference: "For Person A, future replies should avoid sounding pushy.",
        createdAt: new Date().toISOString()
      })
    );
  }
}

export function CrossAppDemo() {
  const [stage, setStage] = useState(0);
  const [feedbackUsed, setFeedbackUsed] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const weChatSource = useMemo(() => crossAppSources.find((source) => source.kind === "wechat_style_chat"), []);
  const doubaoSource = useMemo(() => crossAppSources.find((source) => source.kind === "doubao_style_ai"), []);

  useEffect(() => {
    if (stage <= 0 || stage >= MAX_STAGE) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStage((current) => Math.min(current + 1, MAX_STAGE));
    }, 650);

    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage >= 4) {
      saveCrossAppState(false);
    }
  }, [stage]);

  const runDemo = useCallback(() => {
    setFeedbackUsed(false);
    setStage(1);
  }, []);

  const reset = useCallback(() => {
    clearDemoStorage();
    setStage(0);
    setFeedbackUsed(false);
  }, []);

  const useReply = useCallback(() => {
    setFeedbackUsed(true);
    saveCrossAppState(true);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-700">ContextCue</p>
            <h1 className="mt-1 text-4xl font-semibold leading-tight text-slate-950">ContextCue</h1>
            <p className="mt-2 text-lg text-slate-700">A background memory layer for personal AI agents.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Use voice to tell the agent what to remember, forget, or apply next time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runDemo}
              className="focus-ring inline-flex h-11 items-center rounded-md bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Run demo
            </button>
            <FAQDrawer open={faqOpen} onOpen={() => setFaqOpen(true)} onClose={() => setFaqOpen(false)} items={faqItems} />
            <button
              type="button"
              onClick={reset}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mb-5">
          <DemoStepper stage={stage} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              {weChatSource ? <WeChatMockup source={weChatSource} /> : null}
              {doubaoSource ? <DoubaoMockup source={doubaoSource} /> : null}
            </div>

            <VoiceTriggerBar command={voiceCommand} transcriptVisible={stage >= 1} onRun={runDemo} />

            <ParsedIntentCard
              command={voiceCommand}
              intents={parsedIntents}
              operations={memoryOperations}
              showTranscript={stage >= 1}
              showParsed={stage >= 2}
            />

            <ReplySuggestionCard
              suggestion={replySuggestion}
              visible={stage >= 5}
              used={feedbackUsed}
              onUse={useReply}
            />

            {feedbackUsed ? (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">Feedback event</p>
                <div className="mt-2 grid gap-2 text-sm text-emerald-950 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold">Selected style:</span> warm_low_pressure
                  </p>
                  <p>
                    <span className="font-semibold">Saved preference:</span> avoid sounding pushy for Person A
                  </p>
                </div>
              </section>
            ) : null}
          </div>

          <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <ContextCueStatus stage={stage} />
            <MemoryGatePanel decisions={crossAppGateDecisions} visible={stage >= 3} />
          </div>
        </div>
      </section>
    </main>
  );
}
