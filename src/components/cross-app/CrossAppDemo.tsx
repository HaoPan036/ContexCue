"use client";

import { useCallback, useState } from "react";
import { Check, Mic2, PenLine, RotateCcw, Send, ShieldCheck, Sparkles } from "lucide-react";
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
  const cueActive = mode === "assist" || mode === "used";

  const reset = useCallback(() => {
    clearDemoStorage();
    setMode("idle");
  }, []);

  const useReply = useCallback(() => {
    setMode("used");
    saveCrossAppState(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Private context capture</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">ContextCue</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              A lightweight layer for the moment before you reply.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FAQDrawer open={faqOpen} onOpen={() => setFaqOpen(true)} onClose={() => setFaqOpen(false)} items={faqItems} />
            <button
              type="button"
              onClick={reset}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(420px,0.98fr)_minmax(340px,0.68fr)] lg:items-center">
          <section className="mx-auto w-full max-w-[520px]">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-2 shadow-[0_22px_70px_rgba(15,23,42,0.18)]">
              <div className="overflow-hidden rounded-[1.55rem] bg-[#eef1f5]">
                <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      A
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Person A</p>
                      <p className="text-xs text-slate-500">Weekend plan</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">Today</span>
                </header>

                <div className="flex min-h-[600px] flex-col justify-between px-4 py-5">
                  <div className="space-y-3">
                    {weChatSource?.messages.map((message) => {
                      const fromUser = message.role === "user";
                      const latest = message.id === "wa-5";

                      return (
                        <div key={message.id} className={`flex ${fromUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[82%] ${latest ? "relative" : ""}`}>
                            {message.timestamp ? (
                              <p className="mb-2 text-center text-[11px] font-medium text-slate-400">{message.timestamp}</p>
                            ) : null}
                            <div
                              className={`rounded-2xl px-3.5 py-2.5 text-[15px] leading-6 shadow-sm ${
                                fromUser
                                  ? "rounded-tr-md bg-[#2563eb] text-white"
                                  : latest
                                    ? "rounded-tl-md border border-sky-200 bg-white text-slate-950 shadow-[0_12px_30px_rgba(14,116,144,0.13)]"
                                    : "rounded-tl-md border border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              {message.text}
                            </div>
                            {latest ? (
                              <span className="absolute -right-2 -top-2 h-3 w-3 rounded-full border-2 border-white bg-cyan-500" />
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMode("manual")}
                        className={`focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
                          mode === "manual"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <PenLine className="h-4 w-4" aria-hidden="true" />
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("assist");
                          saveCrossAppState(false);
                        }}
                        className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
                      >
                        <Mic2 className="h-4 w-4" aria-hidden="true" />
                        Ask
                      </button>
                    </div>

                    {mode === "manual" ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          className="focus-ring h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm text-slate-800"
                          placeholder="Type your reply..."
                        />
                        <button className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                          <Send className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="w-full space-y-4 lg:max-w-[430px]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">ContextCue</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Quiet until you ask.</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    cueActive ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cueActive ? "Listening" : "Idle"}
                </span>
              </div>

              {mode === "idle" ? (
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-950">A reply that needs context.</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      You can answer yourself, or ask ContextCue to remember the right details first.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    No raw chat or audio is stored.
                  </div>
                </div>
              ) : null}

              {mode === "manual" ? (
                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-950">Manual reply</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">No memory update. No AI action.</p>
                </div>
              ) : null}

              {cueActive ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                    <div className="flex items-center gap-2">
                      <Mic2 className="h-4 w-4 text-cyan-700" aria-hidden="true" />
                      <p className="text-xs font-semibold uppercase tracking-normal text-cyan-700">Voice capture</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-cyan-950">{voiceCommand.transcript}</p>
                  </div>

                  <div className="grid gap-2">
                    {memoryOperations.map((operation) => (
                      <div key={operation.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                        <span className="min-w-0 text-sm font-medium text-slate-800">{operation.content}</span>
                        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                          {operation.requiresConfirmation ? "confirm" : operation.ttlDays ? `${operation.ttlDays}d` : "save"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-700" aria-hidden="true" />
                      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Next reply</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-900">{replySuggestion.text}</p>
                    <button
                      type="button"
                      onClick={useReply}
                      className={`focus-ring mt-3 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                        mode === "used"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {mode === "used" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                      {mode === "used" ? "Saved" : "Use reply"}
                    </button>
                  </div>

                  <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-normal text-slate-500">
                      Feedback signal
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

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {["No raw audio", "Transcript used for extraction", "Health context needs confirmation", "User controls reply"].map((rule) => (
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
