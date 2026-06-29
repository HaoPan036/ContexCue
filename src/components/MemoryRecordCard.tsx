"use client";

import { useState } from "react";
import { Check, Clock, Pencil, Save, X } from "lucide-react";
import { formatDate, peopleById, sourcesById, titleCase } from "@/lib/demo-data";
import type { MemoryRecord, MemoryStatus } from "@/types";
import { EvidencePill } from "@/components/EvidencePill";
import { PrivacyBadge } from "@/components/PrivacyBadge";

export function MemoryRecordCard({
  record,
  onStatusChange,
  onEdit
}: {
  record: MemoryRecord;
  onStatusChange: (status: MemoryStatus) => void;
  onEdit: (content: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(record.content);
  const person = peopleById.get(record.personId);
  const sourceNames = record.sourceSnippetIds
    .map((sourceId) => sourcesById.get(sourceId)?.title ?? sourceId)
    .join(", ");

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
        </div>
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
      </div>
    </article>
  );
}
