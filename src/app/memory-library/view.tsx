"use client";

import { Database, ShieldCheck } from "lucide-react";
import { MemoryRecordCard } from "@/components/MemoryRecordCard";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { useDemoState } from "@/hooks/useDemoState";

export function MemoryLibrary() {
  const { memoryRecords, updateMemoryStatus, editMemoryContent } = useDemoState();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] lg:items-end">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <PrivacyBadge value="mock" label="Local JSON demo data" />
            <PrivacyBadge value="sensitive" label="User confirmation controls" />
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-slate-950">Memory Library</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Structured memories after extraction and confirmation. Each card keeps person scope,
            evidence, privacy level, TTL, status, allowed domains, and blocked domains visible.
          </p>
        </div>

        <section className="card-shell p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">V0.1 storage</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                localStorage only saves memory records, selected reply, feedback event, and style
                profile. It does not persist raw source snippets.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Database className="h-5 w-5 text-indigo-600" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-slate-950">{memoryRecords.length} memory records</h2>
      </div>

      <div className="grid gap-4">
        {memoryRecords.map((record) => (
          <MemoryRecordCard
            key={record.id}
            record={record}
            onStatusChange={(status) => updateMemoryStatus(record.id, status)}
            onEdit={(content) => editMemoryContent(record.id, content)}
          />
        ))}
      </div>
    </main>
  );
}
