import { sourcesById } from "@/lib/demo-data";

export function EvidencePill({ sourceId, label }: { sourceId?: string; label?: string }) {
  const source = sourceId ? sourcesById.get(sourceId) : null;
  const text = label ?? source?.title ?? sourceId ?? "Evidence";

  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
      <span className="truncate">{text}</span>
    </span>
  );
}
