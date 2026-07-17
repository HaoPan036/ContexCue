"use client";

import { demoData } from "@/lib/demo-data";
import { buildDemoCognitiveFragments } from "@/lib/cognitive-loop";
import type {
  CognitiveFragment,
  FeedbackEvent,
  MemoryRecord,
  ReplyOption,
  ReplyStyle,
  UserStyleProfile
} from "@/types";

type ProvenanceFields = Pick<
  MemoryRecord,
  "origin" | "stance" | "cognitiveType" | "beliefStatus" | "revisionHistory"
>;

type PersistedMemoryRecord = Omit<MemoryRecord, keyof ProvenanceFields> &
  Partial<ProvenanceFields>;

export const STORAGE_KEYS = {
  memories: "contextcue.approvedMemories",
  cognitiveFragments: "contextcue.cognitiveFragments",
  selectedReplyOption: "contextcue.selectedReplyOption",
  feedbackEvent: "contextcue.feedbackEvent",
  styleProfile: "contextcue.userStyleProfile",
  crossAppMemoryOperations: "contextcue.crossAppMemoryOperations",
  crossAppFeedbackEvent: "contextcue.crossAppFeedbackEvent"
} as const;

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function clearDemoStorage() {
  if (typeof window === "undefined") {
    return;
  }

  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
}

export function withProvenanceDefaults(record: PersistedMemoryRecord): MemoryRecord {
  return {
    ...record,
    origin: record.origin ?? "other_person",
    stance: record.stance ?? "undecided",
    cognitiveType: record.cognitiveType ?? "fact_claim",
    beliefStatus: record.beliefStatus ?? "external_view",
    revisionHistory: record.revisionHistory ?? []
  };
}

export function loadMemoryRecords() {
  return loadJson<PersistedMemoryRecord[]>(
    STORAGE_KEYS.memories,
    demoData.memoryRecords
  ).map(withProvenanceDefaults);
}

export function saveMemoryRecords(records: MemoryRecord[]) {
  saveJson(STORAGE_KEYS.memories, records);
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isCognitiveFragment(value: unknown): value is CognitiveFragment {
  if (!value || typeof value !== "object") {
    return false;
  }

  const fragment = value as Record<string, unknown>;
  const validSources = [
    "ai_output",
    "conversation",
    "own_output",
    "external_content",
    "quick_note"
  ];
  const validStatuses = ["inbox", "reviewed", "dismissed"];
  const validOrigins = ["self", "other_person", "ai_output", "external_content"];
  const validStances = ["endorsed", "skeptical", "rejected", "undecided"];
  const validCognitiveTypes = ["fact_claim", "value_judgment", "hypothesis", "question"];

  const hasValidBaseFields =
    isNonBlankString(fragment.id) &&
    isNonBlankString(fragment.content) &&
    typeof fragment.source === "string" &&
    validSources.includes(fragment.source) &&
    (fragment.sourceContext === null || typeof fragment.sourceContext === "string") &&
    isValidTimestamp(fragment.capturedAt) &&
    typeof fragment.status === "string" &&
    validStatuses.includes(fragment.status) &&
    typeof fragment.origin === "string" &&
    validOrigins.includes(fragment.origin) &&
    typeof fragment.cognitiveType === "string" &&
    validCognitiveTypes.includes(fragment.cognitiveType);

  if (!hasValidBaseFields) {
    return false;
  }

  if (fragment.status === "reviewed") {
    return (
      typeof fragment.stance === "string" &&
      validStances.includes(fragment.stance) &&
      isValidTimestamp(fragment.reviewedAt) &&
      isNonBlankString(fragment.linkedMemoryId)
    );
  }

  return (
    fragment.stance === null &&
    fragment.reviewedAt === null &&
    fragment.linkedMemoryId === null
  );
}

export function loadCognitiveFragments(): CognitiveFragment[] {
  if (typeof window === "undefined") {
    return buildDemoCognitiveFragments();
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.cognitiveFragments);

  if (raw === null) {
    return buildDemoCognitiveFragments();
  }

  let stored: unknown;

  try {
    stored = JSON.parse(raw) as unknown;
  } catch {
    return [];
  }

  if (!Array.isArray(stored)) {
    return [];
  }

  const seenIds = new Set<string>();

  return stored.filter((value): value is CognitiveFragment => {
    if (!isCognitiveFragment(value) || seenIds.has(value.id)) {
      return false;
    }

    seenIds.add(value.id);
    return true;
  });
}

export function saveCognitiveFragments(fragments: CognitiveFragment[]) {
  saveJson(STORAGE_KEYS.cognitiveFragments, fragments);
}

export function loadSelectedReplyOption() {
  return loadJson<string | null>(STORAGE_KEYS.selectedReplyOption, null);
}

export function saveSelectedReplyOption(replyOptionId: string | null) {
  saveJson(STORAGE_KEYS.selectedReplyOption, replyOptionId);
}

export function loadFeedbackEvent() {
  return loadJson<FeedbackEvent | null>(STORAGE_KEYS.feedbackEvent, null);
}

export function saveFeedbackEvent(event: FeedbackEvent | null) {
  saveJson(STORAGE_KEYS.feedbackEvent, event);
}

export function loadStyleProfile() {
  return loadJson<UserStyleProfile>(STORAGE_KEYS.styleProfile, demoData.styleProfileSeed);
}

export function saveStyleProfile(profile: UserStyleProfile) {
  saveJson(STORAGE_KEYS.styleProfile, profile);
}

export function buildFeedbackEvent(reply: ReplyOption, editedText: string): FeedbackEvent {
  const allStyles: ReplyStyle[] = [
    "warm_supportive_low_pressure",
    "task_oriented",
    "intrusive_interrogation"
  ];
  const rejectedStyles = allStyles.filter((style) => style !== reply.style);
  const instruction =
    reply.style === "warm_supportive_low_pressure"
      ? "For Person A, prefer warm and low pressure replies unless the user overrides it."
      : `For Person A, note that the user selected ${reply.style.replaceAll("_", " ")} in this scenario.`;

  return {
    id: `feedback-${reply.id}-${Date.now()}`,
    selectedReplyOptionId: reply.id,
    editedText,
    selectedStyle: reply.style,
    rejectedStyles,
    personId: "person-a",
    createdAt: new Date().toISOString(),
    learnedPreference: instruction
  };
}

export function buildStyleProfile(reply: ReplyOption, event: FeedbackEvent): UserStyleProfile {
  return {
    id: "style-person-a",
    personId: "person-a",
    preferredStyles: [reply.style],
    rejectedStyles: event.rejectedStyles,
    notes: event.learnedPreference,
    updatedAt: event.createdAt
  };
}
