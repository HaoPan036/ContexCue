"use client";

import { useCallback, useState } from "react";
import { Check, Mic2, PenLine, RotateCcw, Send } from "lucide-react";
import { FAQDrawer } from "@/components/cross-app/FAQDrawer";
import {
  crossAppSources,
  faqItems,
  memoryOperations,
  replySuggestion,
  voiceCommand
} from "@/lib/cross-app-demo";
import { STORAGE_KEYS, clearDemoStorage } from "@/lib/storage";

type MomentMode = "idle" | "manual" | "assist" | "used";

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
  const [mode, setMode] = useState<MomentMode>("idle");
  const [faqOpen, setFaqOpen] = useState(false);
  const weChatSource = crossAppSources.find((source) => source.kind === "wechat_style_chat");
  const doubaoSource = crossAppSources.find((source) => source.kind === "doubao_style_ai");

  const reset = useCallback(() => {
    clearDemoStorage();
    setMode("idle");
  }, []);

  const useReply = useCallback(() => {
    setMode("used");
    saveCrossAppState(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-700">ContextCue</p>
            <h1 className="mt-1 text-4xl font-semibold leading-tight text-slate-950">ContextCue</h1>
            <p className="mt-2 text-lg text-slate-700">A background memory layer for personal AI agents.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Use voice to tell the agent what to remember, forget, or apply next time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FAQDrawer open={faqOpen} onOpen={() => setFaqOpen(true)} onClose={() => setFaqOpen(false)} items={faqItems} />
            <button
              type="button"
              onClick={reset}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">WeChat style chat</p>
                <p className="mt-0.5 text-xs text-slate-500">A message that may need memory</p>
              </div>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                Now
              </span>
            </header>

            <div className="space-y-3 bg-[#f4f5f7] p-5">
              {weChatSource?.messages.map((message) => {
                const fromUser = message.role === "user";
                const latest = message.id === "wa-5";

                return (
                  <div key={message.id} className={`flex ${fromUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] ${latest ? "rounded-2xl ring-2 ring-indigo-200" : ""}`}>
                      {message.timestamp ? (
                        <p className="mb-1 text-center text-[11px] font-medium text-slate-400">{message.timestamp}</p>
                      ) : null}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
                          fromUser
                            ? "rounded-tr-md bg-indigo-600 text-white"
                            : "rounded-tl-md border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={`focus-ring inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                      mode === "manual"
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <PenLine className="h-4 w-4" aria-hidden="true" />
                    Continue myself
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("assist");
                      saveCrossAppState(false);
                    }}
                    className="focus-ring inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Mic2 className="h-4 w-4" aria-hidden="true" />
                    Voice: ask AI to handle
                  </button>
                </div>

                {mode === "manual" ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      className="focus-ring h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm text-slate-800"
                      placeholder="Type your reply..."
                    />
                    <button className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Send
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">ContextCue</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Quiet until you ask it to remember, forget, or help.
              </p>

              {mode === "idle" ? (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  A new message arrived. You can reply yourself or ask ContextCue to handle the context.
                </div>
              ) : null}

              {mode === "manual" ? (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  ContextCue stays in the background. No memory is updated unless you ask.
                </div>
              ) : null}

              {(mode === "assist" || mode === "used") ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Voice instruction</p>
                    <p className="mt-1 text-sm leading-6 text-indigo-950">{voiceCommand.transcript}</p>
                  </div>

                  <div className="grid gap-2">
                    {memoryOperations.map((operation) => (
                      <div key={operation.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-slate-800">{operation.content}</span>
                          <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                            {operation.ttlDays ? `${operation.ttlDays}d` : "saved"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Suggested reply</p>
                    <p className="mt-2 text-sm leading-6 text-slate-900">{replySuggestion.text}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {replySuggestion.usedContext.map((item) => (
                        <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
                          {item}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={useReply}
                      className={`focus-ring mt-3 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                        mode === "used"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {mode === "used" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                      {mode === "used" ? "Preference saved" : "Use this reply"}
                    </button>
                  </div>

                  <details className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-normal text-slate-500">
                      Source context
                    </summary>
                    <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                      {doubaoSource?.messages.slice(-2).map((message) => (
                        <p key={message.id}>{message.text}</p>
                      ))}
                    </div>
                  </details>
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">MemoryGate</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Raw audio not stored", "Raw chat not stored", "Spicy food expires", "User controls reply"].map((rule) => (
                  <span key={rule} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                    {rule}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
