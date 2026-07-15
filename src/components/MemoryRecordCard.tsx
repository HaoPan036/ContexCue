"use client";

import { useState } from "react";
import { ArrowRight, BadgeCheck, Check, Clock, Pencil, Save, X } from "lucide-react";
import { formatDate, peopleById, sourcesById, titleCase } from "@/lib/demo-data";
import type { MemoryRecord, MemoryStatus } from "@/types";
import { EvidencePill } from "@/components/EvidencePill";
import { PrivacyBadge } from "@/components/PrivacyBadge";

const timestampFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short"
});

function formatTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : timestampFormatter.format(date);
}

function producerLabel(record: MemoryRecord, personName?: string) {
  switch (record.origin) {
    case "self":
      return "You";
    case "other_person":
      return personName ?? "Other person";
    case "ai_output":
      return "AI output";
    case "external_content":
      return "External content";
    default:
      return "Not recorded";
  }
}

export function MemoryRecordCard({
  record,
  onStatusChange,
  onEdit,
  onReaffirm
}: {
  record: MemoryRecord;
  onStatusChange: (status: MemoryStatus) => void;
  onEdit: (content: string) => void;
  onReaffirm: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(record.content);
  const person = peopleById.get(record.personId);
  const sourceNames = record.sourceSnippetIds
    .map((sourceId) => sourcesById.get(sourceId)?.title ?? sourceId)
    .join(", ");
  const revisionHistory = record.revisionHistory ?? [];
  const reaffirmationRevision = [...revisionHistory]
    .reverse()
    .find((revision) => revision.to === "user_belief");
  const showInitialEndorsement =
    record.beliefStatus === "candidate_belief" && record.stance === "endorsed";

  function saveDraft() {
    onEdit(draft);
    setIsEditing(false);
  }

  return (
    <article className="card-shell p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">
            {person?.displayName} / {titleCase(record.type)}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">Structured memory</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrivacyBadge value={record.privacyLevel} />
          <PrivacyBadge value={record.status} />
          <PrivacyBadge
            value={record.origin}
            label={`Origin: ${record.origin ? titleCase(record.origin) : "Not recorded"}`}
          />
          <PrivacyBadge
            value={record.stance}
            label={`Stance: ${record.stance ? titleCase(record.stance) : "Not recorded"}`}
          />
          <PrivacyBadge
            value={record.beliefStatus}
            label={`Belief status: ${record.beliefStatus ? titleCase(record.beliefStatus) : "Not recorded"}`}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span>
          Produced by <strong className="font-semibold text-slate-800">{producerLabel(record, person?.displayName)}</strong>
        </span>
        <span>
          Captured <time dateTime={record.createdAt}>{formatTimestamp(record.createdAt)}</time>
        </span>
        {showInitialEndorsement ? (
          <span>
            Endorsed <time dateTime={record.createdAt}>{formatTimestamp(record.createdAt)}</time>
          </span>
        ) : null}
        {reaffirmationRevision ? (
          <span>
            Re-affirmed <time dateTime={reaffirmationRevision.at}>{formatTimestamp(reaffirmationRevision.at)}</time>
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Content</p>
            {isEditing ? (
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                className="focus-ring mt-1 w-full rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-800"
              />
            ) : (
              <p className="mt-1 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-800">
                {record.content}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Evidence snippet</p>
            <p className="mt-1 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {record.evidence}
            </p>
          </div>
        </div>

        <dl className="grid gap-3 text-sm text-slate-700">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Source</dt>
            <dd className="mt-1">{sourceNames}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Time to live</dt>
            <dd className="mt-1">{record.expiresAt ? `Expires ${formatDate(record.expiresAt)}` : "No automatic expiry"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Allowed domains</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {record.allowedTaskTypes.length ? (
                record.allowedTaskTypes.map((domain) => <EvidencePill key={domain} label={titleCase(domain)} />)
              ) : (
                <span>None</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">Blocked domains</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {record.blockedTaskTypes.map((domain) => (
                <EvidencePill key={domain} label={titleCase(domain)} />
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-4 border-t border-slate-100 pt-4" aria-labelledby={`revision-chain-${record.id}`}>
        <h4
          id={`revision-chain-${record.id}`}
          className="text-xs font-semibold uppercase tracking-normal text-slate-500"
        >
          Revision chain
        </h4>
        {revisionHistory.length ? (
          <ol className="mt-2 space-y-3">
            {revisionHistory.map((revision, index) => (
              <li key={`${revision.at}-${index}`} className="border-l-2 border-slate-200 pl-3 text-sm text-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                  <time dateTime={revision.at} className="text-xs text-slate-500">
                    {formatTimestamp(revision.at)}
                  </time>
                  <span className="font-medium text-slate-800">{titleCase(revision.from)}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-label="changed to" />
                  <span className="font-medium text-slate-800">{titleCase(revision.to)}</span>
                </div>
                <p className="mt-1 leading-6 text-slate-600">{revision.note}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No revisions recorded.</p>
        )}
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        {isEditing ? (
          <button
            type="button"
            onClick={saveDraft}
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save edit
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>
        )}
        <button
          type="button"
          onClick={() => onStatusChange("active")}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Approve
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("ignored")}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Ignore
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("expired")}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          <Clock className="h-4 w-4" aria-hidden="true" />
          Expire
        </button>
        {record.beliefStatus === "candidate_belief" ? (
          <button
            type="button"
            onClick={onReaffirm}
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            Re-affirm as long-term view
          </button>
        ) : null}
      </div>
    </article>
  );
}
