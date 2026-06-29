"use client";

import { demoData } from "@/lib/demo-data";
import type { FeedbackEvent, MemoryRecord, ReplyOption, ReplyStyle, UserStyleProfile } from "@/types";

export const STORAGE_KEYS = {
  memories: "contextcue.approvedMemories",
  selectedReplyOption: "contextcue.selectedReplyOption",
  feedbackEvent: "contextcue.feedbackEvent",
  styleProfile: "contextcue.userStyleProfile"
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

export function loadMemoryRecords() {
  return loadJson<MemoryRecord[]>(STORAGE_KEYS.memories, demoData.memoryRecords);
}

export function saveMemoryRecords(records: MemoryRecord[]) {
  saveJson(STORAGE_KEYS.memories, records);
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
