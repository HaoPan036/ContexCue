"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildDemoCognitiveFragments,
  createMemoryRecordFromFragment,
  DEFAULT_ORIGIN_BY_SOURCE,
  getDefaultCognitiveType
} from "@/lib/cognitive-loop";
import type {
  AddCognitiveFragmentInput,
  CognitiveReviewInput
} from "@/lib/cognitive-loop";
import { demoData } from "@/lib/demo-data";
import { promotionGate } from "@/lib/promotion-gate";
import {
  buildFeedbackEvent,
  buildStyleProfile,
  clearDemoStorage,
  loadCognitiveFragments,
  loadFeedbackEvent,
  loadMemoryRecords,
  loadSelectedReplyOption,
  loadStyleProfile,
  saveCognitiveFragments,
  saveFeedbackEvent,
  saveMemoryRecords,
  saveSelectedReplyOption,
  saveStyleProfile
} from "@/lib/storage";
import type {
  CognitiveFragment,
  FeedbackEvent,
  MemoryRecord,
  MemoryStatus,
  ReplyOption,
  UserStyleProfile
} from "@/types";

interface CognitiveState {
  memoryRecords: MemoryRecord[];
  cognitiveFragments: CognitiveFragment[];
}

export function useDemoState() {
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>({
    memoryRecords: demoData.memoryRecords,
    cognitiveFragments: []
  });
  const [selectedReplyOptionId, setSelectedReplyOptionId] = useState<string | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<FeedbackEvent | null>(null);
  const [styleProfile, setStyleProfile] = useState<UserStyleProfile>(demoData.styleProfileSeed);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { cognitiveFragments, memoryRecords } = cognitiveState;

  useEffect(() => {
    setCognitiveState({
      memoryRecords: loadMemoryRecords(),
      cognitiveFragments: loadCognitiveFragments()
    });
    setSelectedReplyOptionId(loadSelectedReplyOption());
    setFeedbackEvent(loadFeedbackEvent());
    setStyleProfile(loadStyleProfile());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    saveMemoryRecords(memoryRecords);
    saveCognitiveFragments(cognitiveFragments);
  }, [cognitiveFragments, hasLoaded, memoryRecords]);

  const updateMemoryStatus = useCallback((memoryId: string, status: MemoryStatus) => {
    setCognitiveState((current) => ({
      ...current,
      memoryRecords: current.memoryRecords.map((record) =>
        record.id === memoryId ? { ...record, status } : record
      )
    }));
  }, []);

  const editMemoryContent = useCallback((memoryId: string, content: string) => {
    setCognitiveState((current) => ({
      ...current,
      memoryRecords: current.memoryRecords.map((record) =>
        record.id === memoryId
          ? { ...record, content, status: "active" as const }
          : record
      )
    }));
  }, []);

  const reaffirmMemory = useCallback((memoryId: string) => {
    setCognitiveState((current) => {
      let didReaffirm = false;
      const memoryRecords = current.memoryRecords.map((record) => {
        if (record.id !== memoryId || record.beliefStatus !== "candidate_belief") {
          return record;
        }

        const decision = promotionGate({
          origin: record.origin,
          stance: "endorsed",
          isReaffirmation: true
        });
        const at = new Date().toISOString();
        didReaffirm = true;

        return {
          ...record,
          stance: "endorsed" as const,
          beliefStatus: decision.beliefStatus,
          revisionHistory: [
            ...record.revisionHistory,
            {
              at,
              from: record.beliefStatus,
              to: decision.beliefStatus,
              note: decision.ruleFired
            }
          ]
        };
      });

      return didReaffirm ? { ...current, memoryRecords } : current;
    });
  }, []);

  const addCognitiveFragment = useCallback((input: AddCognitiveFragmentInput) => {
    const content = input.content.trim();

    if (!content) {
      return false;
    }

    const now = new Date();
    const fragment: CognitiveFragment = {
      id: `fragment-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      content,
      source: input.source,
      sourceContext: input.sourceContext?.trim() || null,
      capturedAt: now.toISOString(),
      status: "inbox",
      origin: DEFAULT_ORIGIN_BY_SOURCE[input.source],
      stance: null,
      cognitiveType: input.cognitiveType ?? getDefaultCognitiveType(content),
      reviewedAt: null,
      linkedMemoryId: null
    };

    setCognitiveState((current) => ({
      ...current,
      cognitiveFragments: [fragment, ...current.cognitiveFragments]
    }));

    return true;
  }, []);

  const reviewCognitiveFragment = useCallback(
    (fragmentId: string, reviewInput: CognitiveReviewInput) => {
      const now = new Date();

      setCognitiveState((current) => {
        const fragment = current.cognitiveFragments.find(
          (candidate) => candidate.id === fragmentId && candidate.status === "inbox"
        );

        if (!fragment) {
          return current;
        }

        const { reviewedFragment, memoryRecord } = createMemoryRecordFromFragment(
          fragment,
          reviewInput,
          now
        );

        return {
          memoryRecords: [...current.memoryRecords, memoryRecord],
          cognitiveFragments: current.cognitiveFragments.map((candidate) =>
            candidate.id === fragmentId ? reviewedFragment : candidate
          )
        };
      });
    },
    []
  );

  const dismissCognitiveFragment = useCallback((fragmentId: string) => {
    setCognitiveState((current) => ({
      ...current,
      cognitiveFragments: current.cognitiveFragments.map((fragment) =>
        fragment.id === fragmentId && fragment.status === "inbox"
          ? { ...fragment, status: "dismissed" as const }
          : fragment
      )
    }));
  }, []);

  const selectReplyOption = useCallback((reply: ReplyOption, editedText?: string) => {
    const finalText = editedText?.trim() ? editedText.trim() : reply.text;
    const event = buildFeedbackEvent(reply, finalText);
    const profile = buildStyleProfile(reply, event);

    setSelectedReplyOptionId(reply.id);
    setFeedbackEvent(event);
    setStyleProfile(profile);
    saveSelectedReplyOption(reply.id);
    saveFeedbackEvent(event);
    saveStyleProfile(profile);
  }, []);

  const resetDemo = useCallback(() => {
    clearDemoStorage();
    setCognitiveState({
      memoryRecords: demoData.memoryRecords,
      cognitiveFragments: buildDemoCognitiveFragments()
    });
    setSelectedReplyOptionId(null);
    setFeedbackEvent(null);
    setStyleProfile(demoData.styleProfileSeed);
  }, []);

  const selectedReplyOption = useMemo(
    () => demoData.replyOptions.find((reply) => reply.id === selectedReplyOptionId) ?? null,
    [selectedReplyOptionId]
  );

  return {
    hasLoaded,
    memoryRecords,
    cognitiveFragments,
    selectedReplyOptionId,
    selectedReplyOption,
    feedbackEvent,
    styleProfile,
    updateMemoryStatus,
    editMemoryContent,
    reaffirmMemory,
    addCognitiveFragment,
    reviewCognitiveFragment,
    dismissCognitiveFragment,
    selectReplyOption,
    resetDemo
  };
}
