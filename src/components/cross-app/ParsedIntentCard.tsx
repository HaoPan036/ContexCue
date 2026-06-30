import type { MemoryOperation, ParsedIntent, VoiceCommand } from "@/types";

export function ParsedIntentCard({
  command,
  intents,
  operations,
  showTranscript,
  showParsed
}: {
  command: VoiceCommand;
  intents: ParsedIntent[];
  operations: MemoryOperation[];
  showTranscript: boolean;
  showParsed: boolean;
}) {
  if (!showTranscript && !showParsed) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {showTranscript ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Transcript</p>
          <p className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm leading-6 text-indigo-950">
            {command.transcript}
          </p>
        </div>
      ) : null}

      {showParsed ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Parsed intent</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {intents.map((intent) => (
                <span key={intent.id} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {intent.label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Memory operations</p>
            <ul className="mt-2 space-y-2">
              {operations.map((operation) => (
                <li key={operation.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                  {operation.content}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
