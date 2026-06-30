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
  Sparkles,
  Video
} from "lucide-react";
import { FAQDrawer } from "@/components/cross-app/FAQDrawer";
import {
  crossAppSources,
  faqItems,
  memoryOperations,
  replySuggestion
} from "@/lib/cross-app-demo";
import { STORAGE_KEYS, clearDemoStorage } from "@/lib/storage";

type MomentMode = "idle" | "manual" | "assist" | "used";

const messageTimes: Record<string, string> = {
  "wa-1": "10:31",
  "wa-3": "10:34",
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
  const cueActive = mode === "assist" || mode === "used";

  const reset = useCallback(() => {
    clearDemoStorage();
    setMode("idle");
  }, []);

  const askContextCue = useCallback(() => {
    setMode("assist");
    saveCrossAppState(false);
  }, []);

  const useReply = useCallback(() => {
    setMode("used");
    saveCrossAppState(true);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f2ec] text-[#111111]">
      <section className="relative mx-auto min-h-[calc(100vh-73px)] max-w-7xl px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-normal text-[#6b675f]">Private memory for personal AI</p>
          <h1 className="mt-4 text-6xl font-semibold leading-none text-[#111111] sm:text-7xl lg:text-8xl">
            ContextCue
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-xl leading-8 text-[#3f3b34] sm:text-2xl">
            Remember only what you mean.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={askContextCue}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,17,17,0.18)] transition hover:bg-[#252525]"
            >
              <Mic2 className="h-4 w-4" aria-hidden="true" />
              Ask ContextCue
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-[#d8d1c5] bg-white/70 px-5 text-sm font-semibold text-[#312d27] shadow-sm transition hover:bg-white"
            >
              <PenLine className="h-4 w-4" aria-hidden="true" />
              Reply myself
            </button>
            <FAQDrawer open={faqOpen} onOpen={() => setFaqOpen(true)} onClose={() => setFaqOpen(false)} items={faqItems} />
            <button
              type="button"
              onClick={reset}
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8d1c5] bg-white/70 text-[#5b554c] shadow-sm transition hover:bg-white"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Reset</span>
            </button>
          </div>
        </div>

        <div className="relative z-0 mx-auto mt-10 max-w-5xl">
          <div className="absolute inset-x-4 top-16 h-[72%] rounded-[2.5rem] bg-[#e6dfd3]" />

          <div className="relative mx-auto w-full max-w-[390px] rounded-[2.35rem] border border-black/10 bg-[#111b21] p-2 shadow-[0_30px_90px_rgba(42,36,27,0.28)] sm:max-w-[430px]">
            <div className="overflow-hidden rounded-[1.85rem] bg-[#efeae2]">
              <div className="flex items-center justify-between bg-[#075e54] px-5 pb-2 pt-3 text-xs font-medium text-white/95">
                <span>10:42</span>
                <span>5G  82%</span>
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

              <div className="relative flex min-h-[470px] flex-col justify-between overflow-hidden sm:min-h-[540px]">
                <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,#111b21_1px,transparent_0)] [background-size:18px_18px]" />

                <div className="relative space-y-2 px-3 py-4">
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

                {cueActive ? (
                  <div className="absolute inset-x-3 bottom-[74px] rounded-2xl bg-[#111b21]/95 p-4 text-white shadow-[0_18px_50px_rgba(17,27,33,0.34)] backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#25d366]" aria-hidden="true" />
                        <span className="text-sm font-semibold">ContextCue</span>
                      </div>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/75">
                        {mode === "used" ? "saved" : "ready"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/88">{replySuggestion.text}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {memoryOperations.slice(0, 3).map((operation) => (
                        <span key={operation.id} className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
                          {operation.label}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={useReply}
                      className="focus-ring mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-[#25d366] px-3 text-sm font-semibold text-[#052e1a] transition hover:bg-[#34e577]"
                    >
                      {mode === "used" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                      {mode === "used" ? "Saved" : "Use reply"}
                    </button>
                  </div>
                ) : null}

                <div className="relative p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
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
                      onClick={askContextCue}
                      className={`focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition ${
                        cueActive ? "bg-[#128c7e]" : "bg-[#25d366] hover:bg-[#1fb95a]"
                      }`}
                      title="Ask ContextCue"
                    >
                      <Mic2 className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Ask ContextCue</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-2 text-center text-xs font-semibold uppercase tracking-normal text-[#6b675f]">
          <span>Capture</span>
          <span>Gate</span>
          <span>Reply</span>
        </div>
      </section>
    </main>
  );
}
