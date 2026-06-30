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
  Send,
  Smile,
  Sparkles,
  Video
} from "lucide-react";
import {
  crossAppSources,
  memoryOperations,
  replySuggestion
} from "@/lib/cross-app-demo";
import { STORAGE_KEYS } from "@/lib/storage";

type MomentMode = "manual" | "assist" | "used";

const messageTimes: Record<string, string> = {
  "wa-1": "10:31",
  "wa-3": "10:34",
  "wu-1": "10:39",
  "wa-5": "10:42"
};

const cueSignals = [
  "A: cautious about photo access",
  "Tone: practical, no hype",
  "Gate: confirm before saving"
];

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
  const [mode, setMode] = useState<MomentMode>("assist");
  const whatsAppSource = crossAppSources.find((source) => source.kind === "whatsapp_chat");
  const cueActive = mode === "assist" || mode === "used";

  const askContextCue = useCallback(() => {
    setMode("assist");
    saveCrossAppState(false);
  }, []);

  const useReply = useCallback(() => {
    setMode("used");
    saveCrossAppState(true);
  }, []);

  return (
    <main className="h-[calc(100vh-64px)] overflow-hidden bg-[#f5f2ec] text-[#111111]">
      <section className="relative mx-auto grid h-full max-w-7xl grid-cols-[minmax(320px,0.88fr)_minmax(360px,0.72fr)] items-center gap-8 px-5 py-5 sm:px-6 lg:px-10">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-normal text-[#746f65]">
            From scattered context to controlled memory
          </p>
          <h1 className="mt-5 text-6xl font-semibold leading-none text-[#111111] sm:text-7xl lg:text-[6.7rem]">
            ContextCue
          </h1>
          <p className="mt-6 max-w-md text-2xl leading-9 text-[#312d27]">
            Before you reply, see what context actually matters.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
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
          </div>

          <div className="mt-10 flex max-w-md flex-wrap gap-2 text-xs font-semibold text-[#6b675f]">
            {["No raw chat", "Scoped memory", "Evidence shown"].map((item) => (
              <span key={item} className="rounded-full border border-[#d8d1c5] bg-white/50 px-3 py-1">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-0 flex h-full min-h-0 items-center justify-center">
          <div className="absolute inset-y-9 left-6 right-10 rounded-[3rem] bg-[#e5ddd1]" />

          <div className="relative h-[min(calc(100vh-96px),720px)] aspect-[719/1500] rounded-[3rem] border border-[#d8d1c5] bg-[#d9d4cb] p-[7px] shadow-[0_34px_100px_rgba(42,36,27,0.31)]">
            <div className="absolute -left-1 top-28 h-14 w-1 rounded-l-full bg-[#c7c1b8]" />
            <div className="absolute -right-1 top-40 h-20 w-1 rounded-r-full bg-[#c7c1b8]" />
            <div className="h-full overflow-hidden rounded-[2.62rem] bg-[#efeae2] ring-4 ring-[#111820]">
              <div className="relative flex items-center justify-between bg-[#075e54] px-5 pb-2 pt-5 text-xs font-medium text-white/95">
                <div className="absolute left-1/2 top-4 h-8 w-[7.35rem] -translate-x-1/2 rounded-full bg-[#071014] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                  <span className="absolute right-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#17262c]" />
                </div>
                <span>10:42</span>
                <span>5G  82%</span>
              </div>

              <header className="flex items-center justify-between bg-[#075e54] px-3 py-1.5 text-white shadow-sm">
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

              <div className="relative flex h-[calc(100%_-_88px)] flex-col overflow-hidden">
                <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,#111b21_1px,transparent_0)] [background-size:18px_18px]" />

                <div className="relative min-h-0 flex-1 space-y-2 overflow-hidden px-3 py-3">
                  <div className="mx-auto mb-2 w-fit rounded-md bg-[#fff3bf] px-3 py-1 text-[11px] font-medium text-[#6b5f3c] shadow-sm">
                    Today
                  </div>

                  {whatsAppSource?.messages.map((message) => {
                    const fromUser = message.role === "user";
                    const latest = message.id === "wa-5";

                    return (
                      <div key={message.id} className={`flex ${fromUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[82%] ${latest ? "relative" : ""}`}>
                          <div
                            className={`relative rounded-lg px-3 py-2 text-[14.5px] leading-5 shadow-sm ${
                              fromUser
                                ? "rounded-tr-none bg-[#dcf8c6] text-[#111b21]"
                                : latest
                                  ? "rounded-tl-none bg-white text-[#111b21] ring-2 ring-[#25d366]/40"
                                  : "rounded-tl-none bg-white text-[#111b21]"
                            }`}
                          >
                            <span
                              className={`absolute top-0 h-0 w-0 border-b-[8px] border-b-transparent ${
                                fromUser
                                  ? "-right-2 border-l-[8px] border-l-[#dcf8c6]"
                                  : "-left-2 border-r-[8px] border-r-white"
                              }`}
                            />
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
                  <div className="relative mx-2 mb-2 rounded-[1.15rem] border border-[#d5d7d8] bg-white p-3 text-[#111b21] shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#128c7e]" aria-hidden="true" />
                        <span className="text-sm font-semibold">ContextCue</span>
                      </div>
                      <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-xs font-semibold text-[#128c7e]">
                        {mode === "used" ? "saved" : "ready"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-[#54656f]">
                      {cueSignals.map((signal) => (
                        <span key={signal} className="rounded-full bg-[#f0f2f5] px-2 py-1">
                          {signal}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-[13px] leading-5 text-[#1f2c33]">{replySuggestion.text}</p>
                    <button
                      type="button"
                      onClick={useReply}
                      className="focus-ring mt-2 inline-flex h-8 items-center gap-2 rounded-full bg-[#25d366] px-3 text-sm font-semibold text-[#052e1a] transition hover:bg-[#34e577]"
                    >
                      {mode === "used" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                      {mode === "used" ? "Saved" : "Use reply"}
                    </button>
                  </div>
                ) : null}

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
      </section>
    </main>
  );
}
