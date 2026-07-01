import type { Sensitivity } from "@/types";

export interface VoiceExtractionResult {
  triggerMatched: boolean;
  extractedContent: string;
  sensitivity: Sensitivity;
  suggestedTtlDays: number | null;
  requiresConfirmation: boolean;
  matchedKeywords: string[];
}

const HIGH_SENSITIVITY_KEYWORDS = [
  "health",
  "medical",
  "diagnosis",
  "therapy",
  "depress",
  "anxious",
  "medication",
  "pregnan"
];

const MEDIUM_SENSITIVITY_KEYWORDS = [
  "privacy",
  "sensitive",
  "personal photo",
  "cautious",
  "worried",
  "uncomfortable",
  "private"
];

function getMatchedKeywords(value: string, keywords: string[]) {
  return keywords.filter((keyword) => value.includes(keyword));
}

function normalizeExtractedContent(transcript: string, triggerIndex: number) {
  return transcript
    .slice(triggerIndex + "remember".length)
    .replace(/^[\s,.:;!?-]+/, "")
    .replace(/^that\b[\s,.:;!?-]*/i, "")
    .trim();
}

export function extractFromTranscript(transcript: string): VoiceExtractionResult {
  const lowerTranscript = transcript.toLowerCase();
  const triggerIndex = lowerTranscript.indexOf("remember");

  if (triggerIndex === -1) {
    return {
      triggerMatched: false,
      extractedContent: "",
      sensitivity: "low",
      suggestedTtlDays: null,
      requiresConfirmation: false,
      matchedKeywords: []
    };
  }

  const extractedContent = normalizeExtractedContent(transcript, triggerIndex);
  const lowerContent = extractedContent.toLowerCase();
  const highMatches = getMatchedKeywords(lowerContent, HIGH_SENSITIVITY_KEYWORDS);
  const mediumMatches = getMatchedKeywords(lowerContent, MEDIUM_SENSITIVITY_KEYWORDS);
  const matchedKeywords = [...highMatches, ...mediumMatches];

  if (highMatches.length > 0) {
    return {
      triggerMatched: true,
      extractedContent,
      sensitivity: "high",
      suggestedTtlDays: 7,
      requiresConfirmation: true,
      matchedKeywords
    };
  }

  if (mediumMatches.length > 0) {
    return {
      triggerMatched: true,
      extractedContent,
      sensitivity: "medium",
      suggestedTtlDays: 30,
      requiresConfirmation: true,
      matchedKeywords
    };
  }

  return {
    triggerMatched: true,
    extractedContent,
    sensitivity: "low",
    suggestedTtlDays: null,
    requiresConfirmation: false,
    matchedKeywords
  };
}
