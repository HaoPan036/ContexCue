import rawDemoData from "@/data/demo-data.json";
import type { DemoData, MemoryCandidate, MemoryGateDecision, MemoryRecord, Person, SourceSnippet } from "@/types";

export const demoData = rawDemoData as DemoData;

export const peopleById = new Map<string, Person>(
  demoData.persons.map((person) => [person.id, person])
);

export const sourcesById = new Map<string, SourceSnippet>(
  demoData.sourceSnippets.map((source) => [source.id, source])
);

export const candidatesById = new Map<string, MemoryCandidate>(
  demoData.memoryCandidates.map((candidate) => [candidate.id, candidate])
);

export const recordsById = new Map<string, MemoryRecord>(
  demoData.memoryRecords.map((record) => [record.id, record])
);

export const decisionsByCandidateId = new Map<string, MemoryGateDecision>(
  demoData.memoryGateDecisions.map((decision) => [decision.memoryCandidateId, decision])
);

export function formatDate(value: string | null) {
  if (!value) {
    return "No expiry";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
