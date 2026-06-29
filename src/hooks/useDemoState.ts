"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { demoData } from "@/lib/demo-data";
import {
  buildFeedbackEvent,
  buildStyleProfile,
  clearDemoStorage,
  loadFeedbackEvent,
  loadMemoryRecords,
  loadSelectedReplyOption,
  loadStyleProfile,
  saveFeedbackEvent,
  saveMemoryRecords,
  saveSelectedReplyOption,
  saveStyleProfile
} from "@/lib/storage";
import type { FeedbackEvent, MemoryRecord, MemoryStatus, ReplyOption, UserStyleProfile } from "@/types";

export function useDemoState() {
  const [memoryRecords, setMemoryRecords] = useState<MemoryRecord[]>(demoData.memoryRecords);
  const [selectedReplyOptionId, setSelectedReplyOptionId] = useState<string | null>(null);
  const [feedbackEvent, setFeedbackEvent] = useState<FeedbackEvent | null>(null);
  const [styleProfile, setStyleProfile] = useState<UserStyleProfile>(demoData.styleProfileSeed);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setMemoryRecords(loadMemoryRecords());
    setSelectedReplyOptionId(loadSelectedReplyOption());
    setFeedbackEvent(loadFeedbackEvent());
    setStyleProfile(loadStyleProfile());
    setHasLoaded(true);
  }, []);

  const updateMemoryStatus = useCallback((memoryId: string, status: MemoryStatus) => {
    setMemoryRecords((current) => {
      const next = current.map((record) =>
        record.id === memoryId ? { ...record, status } : record
      );
      saveMemoryRecords(next);
      return next;
    });
  }, []);

  const editMemoryContent = useCallback((memoryId: string, content: string) => {
    setMemoryRecords((current) => {
      const next = current.map((record) =>
        record.id === memoryId ? { ...record, content, status: "active" as const } : record
      );
      saveMemoryRecords(next);
      return next;
    });
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
    setMemoryRecords(demoData.memoryRecords);
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
    selectedReplyOptionId,
    selectedReplyOption,
    feedbackEvent,
    styleProfile,
    updateMemoryStatus,
    editMemoryContent,
    selectReplyOption,
    resetDemo
  };
}
