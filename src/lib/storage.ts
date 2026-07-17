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

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

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

const MEMORY_TYPES = [
  "preference",
  "temporary_health_context",
  "emotional_context",
  "commitment",
  "relationship_signal",
  "user_reply_style",
  "user_principle",
  "world_judgment"
];
const PRIVACY_LEVELS = ["normal", "sensitive", "private"];
const MEMORY_STATUSES = [
  "active",
  "expired",
  "ignored",
  "blocked",
  "pending_confirmation"
];
const FRAGMENT_ORIGINS = ["self", "other_person", "ai_output", "external_content"];
const USER_STANCES = ["endorsed", "skeptical", "rejected", "undecided"];
const COGNITIVE_TYPES = ["fact_claim", "value_judgment", "hypothesis", "question"];
const BELIEF_STATUSES = ["external_view", "candidate_belief", "user_belief"];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRevisionHistory(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every((revision) => {
      if (!revision || typeof revision !== "object") {
        return false;
      }

      const item = revision as Record<string, unknown>;
      return (
        typeof item.at === "string" &&
        typeof item.from === "string" &&
        BELIEF_STATUSES.includes(item.from) &&
        typeof item.to === "string" &&
        BELIEF_STATUSES.includes(item.to) &&
        typeof item.note === "string"
      );
    })
  );
}

function isPersistedMemoryRecord(value: unknown): value is PersistedMemoryRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  const hasRequiredFields =
    isNonBlankString(record.id) &&
    isNonBlankString(record.personId) &&
    typeof record.type === "string" &&
    MEMORY_TYPES.includes(record.type) &&
    typeof record.content === "string" &&
    typeof record.evidence === "string" &&
    isStringArray(record.sourceSnippetIds) &&
    typeof record.createdAt === "string" &&
    (record.expiresAt === null || typeof record.expiresAt === "string") &&
    typeof record.privacyLevel === "string" &&
    PRIVACY_LEVELS.includes(record.privacyLevel) &&
    typeof record.status === "string" &&
    MEMORY_STATUSES.includes(record.status) &&
    isStringArray(record.allowedTaskTypes) &&
    isStringArray(record.blockedTaskTypes);

  if (!hasRequiredFields) {
    return false;
  }

  return (
    (record.origin === undefined ||
      (typeof record.origin === "string" && FRAGMENT_ORIGINS.includes(record.origin))) &&
    (record.stance === undefined ||
      (typeof record.stance === "string" && USER_STANCES.includes(record.stance))) &&
    (record.cognitiveType === undefined ||
      (typeof record.cognitiveType === "string" && COGNITIVE_TYPES.includes(record.cognitiveType))) &&
    (record.beliefStatus === undefined ||
      (typeof record.beliefStatus === "string" && BELIEF_STATUSES.includes(record.beliefStatus))) &&
    (record.revisionHistory === undefined || isRevisionHistory(record.revisionHistory))
  );
}

export function loadMemoryRecords() {
  const stored = loadJson<unknown>(STORAGE_KEYS.memories, demoData.memoryRecords);
  const records = Array.isArray(stored)
    ? stored.filter(isPersistedMemoryRecord)
    : demoData.memoryRecords;

  return records.map(withProvenanceDefaults);
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

  let raw: string | null;

  try {
    raw = window.localStorage.getItem(STORAGE_KEYS.cognitiveFragments);
  } catch {
    return [];
  }

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
