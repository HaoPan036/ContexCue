"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { FeedbackEventCard } from "@/components/FeedbackEventCard";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { ReplyOptionCard } from "@/components/ReplyOptionCard";
import { demoData } from "@/lib/demo-data";
import { useDemoState } from "@/hooks/useDemoState";

export function FeedbackLearning() {
  const { selectedReplyOptionId, feedbackEvent, styleProfile, selectReplyOption } = useDemoState();
  const [activeReplyId, setActiveReplyId] = useState("reply-a");
  const activeReply = useMemo(
    () => demoData.replyOptions.find((reply) => reply.id === activeReplyId) ?? demoData.replyOptions[0],
    [activeReplyId]
  );
  const [draft, setDraft] = useState(activeReply.text);

  useEffect(() => {
    if (selectedReplyOptionId) {
      setActiveReplyId(selectedReplyOptionId);
    }
  }, [selectedReplyOptionId]);

  useEffect(() => {
    setDraft(activeReply.text);
  }, [activeReply]);

  function saveChoice() {
    selectReplyOption(activeReply, draft);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <PrivacyBadge value="normal" label="Scoped to Person A" />
          <PrivacyBadge value="mock" label="Browser localStorage" />
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-slate-950">Reply Preferences</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          The selected reply updates a scoped style profile.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {demoData.replyOptions.map((reply) => (
              <ReplyOptionCard
                key={reply.id}
                reply={reply}
                recommended={reply.id === "reply-a"}
                selected={activeReplyId === reply.id}
                onSelect={() => setActiveReplyId(reply.id)}
              />
            ))}
          </div>

          <section className="card-shell p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Edit before saving</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Final reply text</h2>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={5}
              className="focus-ring mt-4 w-full rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-800"
            />
            <button
              type="button"
              onClick={saveChoice}
              className="focus-ring mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save choice
            </button>
          </section>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <FeedbackEventCard event={feedbackEvent} profile={styleProfile} />
          <section className="card-shell p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Saved fields</p>
            <pre className="mt-3 overflow-auto rounded-md border border-slate-100 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
{`selected_style
rejected_styles
relationship_scope: Person A
future_instruction`}
            </pre>
          </section>
        </aside>
      </div>
    </main>
  );
}
