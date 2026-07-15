"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, MessageSquareText, ShieldOff, XCircle } from "lucide-react";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { formatDate, peopleById, titleCase } from "@/lib/demo-data";
import { loadMemoryRecords } from "@/lib/storage";
import type { MemoryRecord } from "@/types";

const activePersonId = "person-a";
const incomingMessage = "上次那个话题有进展吗?";
const presetAiResponse =
  "有一点进展。我先把目前能确认的部分整理给你；如果你现在不想展开，我们也可以晚点再慢慢说。";

type RecallDecision =
  | {
      kind: "adopted";
      record: MemoryRecord;
    }
  | {
      kind: "excluded";
      record: MemoryRecord;
      reason: string;
    };

function evaluateMemoryRecord(record: MemoryRecord, now: Date): RecallDecision {
  if (record.status === "blocked") {
    return { kind: "excluded", record, reason: "被用户屏蔽" };
  }

  if (record.status === "ignored") {
    return { kind: "excluded", record, reason: "已忽略" };
  }

  if (record.expiresAt && new Date(record.expiresAt) < now) {
    return { kind: "excluded", record, reason: "已过期(TTL 到期)" };
  }

  if (record.personId !== activePersonId) {
    return { kind: "excluded", record, reason: "作用域不匹配(属于其他联系人)" };
  }

  return { kind: "adopted", record };
}

function formatTimestamp(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function personLabel(personId: string) {
  return peopleById.get(personId)?.displayName ?? personId;
}

function MemoryMeta({ record }: { record: MemoryRecord }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <PrivacyBadge value={record.privacyLevel} />
      <PrivacyBadge value={record.status} />
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
        {personLabel(record.personId)}
      </span>
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
        {record.expiresAt ? `TTL ${formatDate(record.expiresAt)}` : "No TTL"}
      </span>
    </div>
  );
}

function AdoptedMemoryCard({ record }: { record: MemoryRecord }) {
  return (
    <article className="card-shell border-l-4 border-l-emerald-500 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Adopted / {titleCase(record.type)}
          </p>
          <h3 className="mt-1 text-base font-semibold leading-6 text-slate-950">{record.content}</h3>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">Evidence snippet</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{record.evidence}</p>
      </div>

      <MemoryMeta record={record} />
    </article>
  );
}

function ExcludedMemoryCard({ record, reason }: { record: MemoryRecord; reason: string }) {
  return (
    <article className="card-shell border-l-4 border-l-rose-500 p-4">
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-rose-700">
            Excluded / {titleCase(record.type)}
          </p>
          <h3 className="mt-1 text-base font-semibold leading-6 text-slate-950">{record.content}</h3>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-rose-100 bg-rose-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-normal text-rose-700">排除理由</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-rose-900">{reason}</p>
      </div>

      <MemoryMeta record={record} />
    </article>
  );
}

export function RecallView() {
  const [records, setRecords] = useState<MemoryRecord[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const decisionTime = new Date();
    setRecords(loadMemoryRecords());
    setNow(decisionTime);
    setHasLoaded(true);
  }, []);

  const decisions = useMemo(() => {
    if (!now) {
      return [];
    }

    return records.map((record) => evaluateMemoryRecord(record, now));
  }, [records, now]);
  const adopted = decisions.filter((decision): decision is Extract<RecallDecision, { kind: "adopted" }> => decision.kind === "adopted");
  const excluded = decisions.filter((decision): decision is Extract<RecallDecision, { kind: "excluded" }> => decision.kind === "excluded");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] lg:items-end">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <PrivacyBadge value="mock" label="Recall demo" />
            <PrivacyBadge value="sensitive" label="Live TTL check" />
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-slate-950">Recall</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            The later conversation shows which memories are used, and which ones are visibly excluded.
          </p>
        </div>

        <section className="card-shell p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Decision time</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {now ? formatTimestamp(now) : "Waiting for browser state"}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="mb-6 card-shell p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
            <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">
              Incoming message / activePersonId = {activePersonId}
            </p>
            <p className="mt-2 text-lg font-semibold leading-7 text-slate-950">
              {personLabel(activePersonId)}: "{incomingMessage}"
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-slate-950">✓ 采用</h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {adopted.length} used
            </span>
          </div>

          <div className="grid gap-4">
            {hasLoaded && adopted.length ? (
              adopted.map(({ record }) => <AdoptedMemoryCard key={record.id} record={record} />)
            ) : !hasLoaded ? (
              <div className="card-shell border-l-4 border-l-emerald-500 p-4 text-sm leading-6 text-slate-600">
                Loading recall decisions...
              </div>
            ) : (
              <div className="card-shell border-l-4 border-l-emerald-500 p-4 text-sm leading-6 text-slate-600">
                No usable memory for this conversation.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-rose-600" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-slate-950">✗ 排除</h2>
            </div>
            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
              {excluded.length} blocked
            </span>
          </div>

          <div className="grid gap-4">
            {hasLoaded && excluded.length ? (
              excluded.map(({ record, reason }) => (
                <ExcludedMemoryCard key={record.id} record={record} reason={reason} />
              ))
            ) : !hasLoaded ? (
              <div className="card-shell border-l-4 border-l-rose-500 p-4 text-sm leading-6 text-slate-600">
                Loading exclusion reasons...
              </div>
            ) : (
              <div className="card-shell border-l-4 border-l-rose-500 p-4 text-sm leading-6 text-slate-600">
                No excluded memory yet.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 card-shell p-5">
        <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">AI response</p>
        <div className="mt-3 rounded-md border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-sm font-semibold leading-6 text-indigo-950">
            本回复仅基于上面 {adopted.length} 条 ✓ 记忆生成。这里没有调用 LLM, 回复文本是 demo 预设常量。
          </p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
            {adopted.length ? (
              adopted.map(({ record }) => (
                <li key={record.id} className="rounded-md border border-indigo-100 bg-white px-3 py-2">
                  {record.content}
                </li>
              ))
            ) : (
              <li className="rounded-md border border-indigo-100 bg-white px-3 py-2">No cited memory.</li>
            )}
          </ul>
        </div>

        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-base leading-7 text-slate-800">
          {presetAiResponse}
        </p>
      </section>
    </main>
  );
}
