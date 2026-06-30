"use client";

import { useCallback, useState } from "react";
import {
  Camera,
  Check,
  CheckCheck,
  ChevronLeft,
  Mic2,
  MoreVertical,
  Paperclip,
  PenLine,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Video
} from "lucide-react";
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

const messageTimes: Record<string, string> = {
  "wa-1": "10:31",
  "wa-2": "10:32",
  "wa-3": "10:34",
  "wa-4": "10:35",
  "wu-1": "10:39",
  "wa-5": "10:42"
};

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
        savedPreference: "For Person A, AI news replies should be practical, sourced, and low-hype.",
        createdAt: new Date().toISOString()
      })
    );
  }
}

export function CrossAppDemo() {
  const [mode, setMode] = useState<MomentMode>("idle");
  const [faqOpen, setFaqOpen] = useState(false);
  const whatsAppSource = crossAppSources.find((source) => source.kind === "whatsapp_chat");
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
            <div className="rounded-[2rem] border border-slate-200 bg-[#111b21] p-2 shadow-[0_22px_70px_rgba(15,23,42,0.22)]">
              <div className="overflow-hidden rounded-[1.55rem] bg-[#efeae2]">
                <div className="flex items-center justify-between bg-[#075e54] px-5 pb-2 pt-3 text-xs font-medium text-white/95">
                  <span>10:42</span>
                  <span className="tracking-normal">5G  82%</span>
                </div>

                <header className="flex items-center justify-between bg-[#075e54] px-3 py-2 text-white shadow-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8f3dc] text-sm font-semibold text-[#075e54]">
                      A
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">A</p>
                      <p className="truncate text-xs text-white/75">online</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-white/90">
                    <Video className="h-5 w-5" aria-hidden="true" />
                    <Phone className="h-5 w-5" aria-hidden="true" />
                    <MoreVertical className="h-5 w-5" aria-hidden="true" />
                  </div>
                </header>

                <div className="relative flex min-h-[600px] flex-col justify-between overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,#111b21_1px,transparent_0)] [background-size:18px_18px]" />

                  <div className="relative space-y-2 px-3 py-4">
                    <div className="mx-auto w-fit max-w-[86%] rounded-md bg-[#fdf4c5] px-3 py-1.5 text-center text-[11px] leading-4 text-[#5f5134] shadow-sm">
                      Messages are end-to-end encrypted. ContextCue only extracts what you approve.
                    </div>

                    {whatsAppSource?.messages.map((message) => {
                      const fromUser = message.role === "user";
                      const latest = message.id === "wa-5";

                      return (
                        <div key={message.id} className={`flex ${fromUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[82%] ${latest ? "relative" : ""}`}>
                            <div
                              className={`rounded-lg px-3 py-2 text-[14.5px] leading-5 shadow-sm ${
                                fromUser
                                  ? "rounded-tr-none bg-[#dcf8c6] text-[#111b21]"
                                  : latest
                                    ? "rounded-tl-none bg-white text-[#111b21] ring-2 ring-[#25d366]/40"
                                    : "rounded-tl-none bg-white text-[#111b21]"
                              }`}
                            >
                              {message.text}
                              <span className="ml-2 inline-flex translate-y-1 items-center gap-1 text-[10px] text-[#667781]">
                                {messageTimes[message.id] ?? message.timestamp}
                                {fromUser ? <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" aria-hidden="true" /> : null}
                              </span>
                            </div>
                            {latest ? (
                              <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-[#efeae2] bg-[#25d366]" />
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative p-2">
                    <div className="flex items-center gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                        <Smile className="h-5 w-5 shrink-0 text-[#667781]" aria-hidden="true" />
                        <input
                          className="focus-ring min-w-0 flex-1 border-0 bg-transparent text-sm text-[#111b21] outline-none"
                          placeholder={mode === "manual" ? "Message" : "Type a message"}
                          readOnly={mode !== "manual"}
                        />
                        <Paperclip className="h-5 w-5 shrink-0 text-[#667781]" aria-hidden="true" />
                        <Camera className="h-5 w-5 shrink-0 text-[#667781]" aria-hidden="true" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("assist");
                          saveCrossAppState(false);
                        }}
                        className={`focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition ${
                          cueActive ? "bg-[#128c7e]" : "bg-[#25d366] hover:bg-[#1fb95a]"
                        }`}
                        title="Ask ContextCue"
                      >
                        <Mic2 className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Ask ContextCue</span>
                      </button>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMode("manual")}
                        className={`focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-full px-3 text-xs font-semibold transition ${
                          mode === "manual"
                            ? "bg-[#111b21] text-white"
                            : "bg-white/85 text-[#3b4a54] hover:bg-white"
                        }`}
                      >
                        <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                        Reply myself
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("assist");
                          saveCrossAppState(false);
                        }}
                        className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-full bg-white/85 px-3 text-xs font-semibold text-[#075e54] transition hover:bg-white"
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        ContextCue
                      </button>
                    </div>
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
                    cueActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cueActive ? "Listening" : "Idle"}
                </span>
              </div>

              {mode === "idle" ? (
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-950">A reply that needs current context.</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      The chat is about a fast-moving AI feature, but A cares more about privacy and practical tradeoffs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    Raw WhatsApp messages and audio are not stored.
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
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2">
                      <Mic2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                      <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">Voice capture</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-emerald-950">{voiceCommand.transcript}</p>
                  </div>

                  <div className="grid gap-2">
                    {memoryOperations.map((operation) => (
                      <div key={operation.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                        <span className="min-w-0 text-sm font-medium text-slate-800">{operation.content}</span>
                        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                          {operation.requiresConfirmation
                            ? operation.ttlDays
                              ? `confirm · ${operation.ttlDays}d`
                              : "confirm"
                            : operation.ttlDays
                              ? `${operation.ttlDays}d`
                              : "save"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Next reply</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-900">{replySuggestion.text}</p>
                    <button
                      type="button"
                      onClick={useReply}
                      className={`focus-ring mt-3 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                        mode === "used"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "bg-[#075e54] text-white hover:bg-[#064d45]"
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
                {["No raw audio", "Transcript used for extraction", "No raw WhatsApp history", "Sensitive context needs confirmation"].map((rule) => (
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
