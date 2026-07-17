import { promotionGate } from "@/lib/promotion-gate";
import type { PromotionDecision } from "@/lib/promotion-gate";
import type {
  CognitiveFragment,
  CognitiveType,
  FragmentOrigin,
  FragmentSource,
  MemoryRecord,
  UserStance
} from "@/types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const FRAGMENT_SOURCE_LABELS: Record<FragmentSource, string> = {
  ai_output: "AI output",
  conversation: "Conversation",
  own_output: "My own output",
  external_content: "External content",
  quick_note: "Quick note"
};

export const DEFAULT_ORIGIN_BY_SOURCE: Record<FragmentSource, FragmentOrigin> = {
  ai_output: "ai_output",
  conversation: "other_person",
  own_output: "self",
  external_content: "external_content",
  quick_note: "self"
};

export type CognitiveMemoryType = "user_principle" | "world_judgment";

export type CognitiveMemoryRecord = MemoryRecord & {
  type: CognitiveMemoryType;
};

export interface AddCognitiveFragmentInput {
  content: string;
  source: FragmentSource;
  sourceContext?: string | null;
  cognitiveType?: CognitiveType;
}

export interface CognitiveReviewInput {
  origin: FragmentOrigin;
  stance: UserStance;
  cognitiveType: CognitiveType;
}

export interface CognitiveFragmentReviewResult {
  reviewedFragment: CognitiveFragment;
  memoryRecord: CognitiveMemoryRecord;
  decision: PromotionDecision;
}

export interface CognitiveRecordBuckets {
  userBeliefs: CognitiveMemoryRecord[];
  candidates: CognitiveMemoryRecord[];
  externalReferences: CognitiveMemoryRecord[];
  rejected: CognitiveMemoryRecord[];
}

export interface ReaffirmedCognitiveRecord {
  record: CognitiveMemoryRecord;
  revisions: CognitiveMemoryRecord["revisionHistory"];
}

export interface WeeklyCognitiveReport {
  windowStart: string;
  windowEnd: string;
  capturedFragments: CognitiveFragment[];
  reviewedFragments: CognitiveFragment[];
  newRecords: CognitiveMemoryRecord[];
  reviewedRecords: CognitiveMemoryRecord[];
  reaffirmedRecords: ReaffirmedCognitiveRecord[];
  buckets: CognitiveRecordBuckets;
}

function isoHoursAgo(nowMs: number, hours: number) {
  return new Date(nowMs - hours * 60 * 60 * 1000).toISOString();
}

function emptyBuckets(): CognitiveRecordBuckets {
  return {
    userBeliefs: [],
    candidates: [],
    externalReferences: [],
    rejected: []
  };
}

function isTimestampInWindow(timestamp: string | null, startMs: number, endMs: number) {
  if (!timestamp) {
    return false;
  }

  const timestampMs = Date.parse(timestamp);
  return Number.isFinite(timestampMs) && timestampMs >= startMs && timestampMs <= endMs;
}

function isExpiredOrInvalidTtl(record: MemoryRecord, nowMs: number) {
  if (!record.expiresAt) {
    return false;
  }

  const expiresAtMs = Date.parse(record.expiresAt);
  return !Number.isFinite(expiresAtMs) || expiresAtMs < nowMs;
}

function latestValidActivityMs(record: CognitiveMemoryRecord) {
  const timestamps = [record.createdAt, ...record.revisionHistory.map((revision) => revision.at)];

  return timestamps.reduce((latest, timestamp) => {
    const timestampMs = Date.parse(timestamp);
    return Number.isFinite(timestampMs) && timestampMs > latest ? timestampMs : latest;
  }, Number.NEGATIVE_INFINITY);
}

function compareNewestActivity(
  left: CognitiveMemoryRecord,
  right: CognitiveMemoryRecord
) {
  const leftActivityMs = latestValidActivityMs(left);
  const rightActivityMs = latestValidActivityMs(right);

  if (leftActivityMs !== rightActivityMs) {
    return rightActivityMs > leftActivityMs ? 1 : -1;
  }

  if (left.id === right.id) {
    return 0;
  }

  return left.id < right.id ? -1 : 1;
}

function sortByNewestActivity(records: CognitiveMemoryRecord[]) {
  return [...records].sort(compareNewestActivity);
}

function formatEvidence(fragment: CognitiveFragment) {
  const context = fragment.sourceContext
    ? ` | Context: ${fragment.sourceContext}`
    : "";

  return `Source: ${FRAGMENT_SOURCE_LABELS[fragment.source]}${context} | Captured fragment: ${fragment.content}`;
}

function formatContextRecord(record: CognitiveMemoryRecord) {
  return [
    `- ${record.content}`,
    `  origin: ${record.origin}; stance: ${record.stance}; cognitiveType: ${record.cognitiveType}; beliefStatus: ${record.beliefStatus}`,
    `  evidence: ${record.evidence}`
  ].join("\n");
}

function formatContextSection(title: string, records: CognitiveMemoryRecord[]) {
  return [title, records.length > 0 ? records.map(formatContextRecord).join("\n") : "(none)"].join(
    "\n"
  );
}

export function isCognitiveMemoryRecord(
  record: MemoryRecord
): record is CognitiveMemoryRecord {
  return record.type === "user_principle" || record.type === "world_judgment";
}

export function getDefaultCognitiveType(content: string): CognitiveType {
  return content.trim().endsWith("?") ? "question" : "hypothesis";
}

export function buildDemoCognitiveFragments(now = new Date()): CognitiveFragment[] {
  const nowMs = now.getTime();

  return [
    {
      id: "fragment-demo-ai-output",
      content: "Agent frameworks may become interchangeable while trusted context stays differentiated.",
      source: "ai_output",
      sourceContext: "An AI answer about durable product advantages",
      capturedAt: isoHoursAgo(nowMs, 1),
      status: "inbox",
      origin: DEFAULT_ORIGIN_BY_SOURCE.ai_output,
      stance: null,
      cognitiveType: "hypothesis",
      reviewedAt: null,
      linkedMemoryId: null
    },
    {
      id: "fragment-demo-conversation",
      content: "Speed matters more than user control during early product design.",
      source: "conversation",
      sourceContext: "A product discussion with a colleague",
      capturedAt: isoHoursAgo(nowMs, 3),
      status: "inbox",
      origin: DEFAULT_ORIGIN_BY_SOURCE.conversation,
      stance: null,
      cognitiveType: "value_judgment",
      reviewedAt: null,
      linkedMemoryId: null
    },
    {
      id: "fragment-demo-own-output",
      content: "Memory systems should expose why a belief was retrieved.",
      source: "own_output",
      sourceContext: "A paragraph from my product notes",
      capturedAt: isoHoursAgo(nowMs, 7),
      status: "inbox",
      origin: DEFAULT_ORIGIN_BY_SOURCE.own_output,
      stance: null,
      cognitiveType: "value_judgment",
      reviewedAt: null,
      linkedMemoryId: null
    },
    {
      id: "fragment-demo-external-content",
      content: "Reflection may create more durable learning than passive capture.",
      source: "external_content",
      sourceContext: "A claim from a video about personal knowledge systems",
      capturedAt: isoHoursAgo(nowMs, 20),
      status: "inbox",
      origin: DEFAULT_ORIGIN_BY_SOURCE.external_content,
      stance: null,
      cognitiveType: "hypothesis",
      reviewedAt: null,
      linkedMemoryId: null
    },
    {
      id: "fragment-demo-quick-note",
      content: "What evidence would make a new idea worth keeping for years?",
      source: "quick_note",
      sourceContext: null,
      capturedAt: isoHoursAgo(nowMs, 36),
      status: "inbox",
      origin: DEFAULT_ORIGIN_BY_SOURCE.quick_note,
      stance: null,
      cognitiveType: "question",
      reviewedAt: null,
      linkedMemoryId: null
    }
  ];
}

export function createMemoryRecordFromFragment(
  fragment: CognitiveFragment,
  reviewInput: CognitiveReviewInput,
  now = new Date()
): CognitiveFragmentReviewResult {
  const decision = promotionGate({
    origin: reviewInput.origin,
    stance: reviewInput.stance,
    isReaffirmation: false
  });
  const reviewedAt = now.toISOString();
  const memoryId = `memory-${fragment.id}-${now.getTime()}`;
  const memoryType: CognitiveMemoryType =
    reviewInput.cognitiveType === "value_judgment"
      ? "user_principle"
      : "world_judgment";

  const reviewedFragment: CognitiveFragment = {
    ...fragment,
    status: "reviewed",
    origin: reviewInput.origin,
    stance: reviewInput.stance,
    cognitiveType: reviewInput.cognitiveType,
    reviewedAt,
    linkedMemoryId: memoryId
  };

  const memoryRecord: CognitiveMemoryRecord = {
    id: memoryId,
    personId: "self",
    type: memoryType,
    content: fragment.content,
    origin: reviewInput.origin,
    stance: reviewInput.stance,
    cognitiveType: reviewInput.cognitiveType,
    beliefStatus: decision.beliefStatus,
    revisionHistory: [
      {
        at: reviewedAt,
        from: decision.beliefStatus,
        to: decision.beliefStatus,
        note: `Initial review: ${decision.ruleFired}`
      }
    ],
    evidence: formatEvidence(fragment),
    sourceSnippetIds: [],
    createdAt: fragment.capturedAt,
    expiresAt: null,
    privacyLevel: "normal",
    status: "active",
    allowedTaskTypes: [],
    blockedTaskTypes: []
  };

  return { reviewedFragment, memoryRecord, decision };
}

export function categorizeCognitiveRecords(
  records: MemoryRecord[],
  now = new Date()
): CognitiveRecordBuckets {
  const buckets = emptyBuckets();
  const nowMs = now.getTime();

  records.filter(isCognitiveMemoryRecord).forEach((record) => {
    const rejectedOrInactive =
      record.stance === "rejected" ||
      record.stance === "skeptical" ||
      record.status === "blocked" ||
      record.status === "ignored" ||
      record.status === "expired" ||
      record.status === "pending_confirmation" ||
      isExpiredOrInvalidTtl(record, nowMs);

    if (rejectedOrInactive) {
      buckets.rejected.push(record);
      return;
    }

    switch (record.beliefStatus) {
      case "user_belief":
        buckets.userBeliefs.push(record);
        break;
      case "candidate_belief":
        buckets.candidates.push(record);
        break;
      case "external_view":
        buckets.externalReferences.push(record);
        break;
    }
  });

  return {
    userBeliefs: sortByNewestActivity(buckets.userBeliefs),
    candidates: sortByNewestActivity(buckets.candidates),
    externalReferences: sortByNewestActivity(buckets.externalReferences),
    rejected: sortByNewestActivity(buckets.rejected)
  };
}

export function buildWeeklyCognitiveReport(
  records: MemoryRecord[],
  fragments: CognitiveFragment[],
  now = new Date()
): WeeklyCognitiveReport {
  const nowMs = now.getTime();
  const windowStartMs = nowMs - WEEK_MS;
  const cognitiveRecords = records.filter(isCognitiveMemoryRecord);
  const capturedFragments = fragments.filter((fragment) =>
    isTimestampInWindow(fragment.capturedAt, windowStartMs, nowMs)
  );
  const reviewedFragments = fragments.filter((fragment) =>
    isTimestampInWindow(fragment.reviewedAt, windowStartMs, nowMs)
  );
  const newRecords = sortByNewestActivity(
    cognitiveRecords.filter((record) =>
      isTimestampInWindow(record.createdAt, windowStartMs, nowMs)
    )
  );
  const reviewedMemoryIds = new Set(
    reviewedFragments.flatMap((fragment) =>
      fragment.linkedMemoryId ? [fragment.linkedMemoryId] : []
    )
  );
  const reviewedRecords = sortByNewestActivity(
    cognitiveRecords.filter((record) => reviewedMemoryIds.has(record.id))
  );
  const reaffirmedRecords = cognitiveRecords
    .flatMap((record) => {
      const revisions = record.revisionHistory.filter(
        (revision) =>
          revision.from !== "user_belief" &&
          revision.to === "user_belief" &&
          isTimestampInWindow(revision.at, windowStartMs, nowMs)
      );

      return revisions.length > 0 ? [{ record, revisions }] : [];
    })
    .sort((left, right) => compareNewestActivity(left.record, right.record));
  const activityIds = new Set([
    ...newRecords.map((record) => record.id),
    ...reviewedRecords.map((record) => record.id),
    ...reaffirmedRecords.map(({ record }) => record.id)
  ]);
  const activityRecords = cognitiveRecords.filter((record) => activityIds.has(record.id));

  return {
    windowStart: new Date(windowStartMs).toISOString(),
    windowEnd: now.toISOString(),
    capturedFragments,
    reviewedFragments,
    newRecords,
    reviewedRecords,
    reaffirmedRecords,
    buckets: categorizeCognitiveRecords(activityRecords, now)
  };
}

export function retrieveCognitiveRecords(
  records: MemoryRecord[],
  query: string,
  now = new Date()
): CognitiveRecordBuckets {
  const normalizedQuery = query.trim().toLowerCase();
  const terms = normalizedQuery.match(/[\p{L}\p{N}]+/gu) ?? [];

  if (!normalizedQuery || terms.length === 0) {
    return emptyBuckets();
  }

  const matches = records.filter(isCognitiveMemoryRecord).filter((record) => {
    const searchableText = `${record.content}\n${record.evidence}`.toLowerCase();
    return (
      searchableText.includes(normalizedQuery) ||
      terms.every((term) => searchableText.includes(term))
    );
  });

  return categorizeCognitiveRecords(matches, now);
}

export function buildContextPacket(query: string, buckets: CognitiveRecordBuckets) {
  const cognitiveBuckets: CognitiveRecordBuckets = {
    userBeliefs: sortByNewestActivity(buckets.userBeliefs.filter(isCognitiveMemoryRecord)),
    candidates: sortByNewestActivity(buckets.candidates.filter(isCognitiveMemoryRecord)),
    externalReferences: sortByNewestActivity(
      buckets.externalReferences.filter(isCognitiveMemoryRecord)
    ),
    rejected: sortByNewestActivity(buckets.rejected.filter(isCognitiveMemoryRecord))
  };

  return [
    "ContextCue cognitive context",
    `Topic: ${query.trim() || "(no topic provided)"}`,
    "Only user principles and world judgments are included.",
    "External references are source material, not the user's views.",
    "Rejected or challenged items must not be treated as the user's beliefs.",
    "",
    formatContextSection("YOUR BELIEFS", cognitiveBuckets.userBeliefs),
    "",
    formatContextSection("CANDIDATE BELIEFS", cognitiveBuckets.candidates),
    "",
    formatContextSection("EXTERNAL REFERENCES - NOT YOUR VIEW", cognitiveBuckets.externalReferences),
    "",
    formatContextSection("REJECTED OR CHALLENGED - DO NOT TREAT AS BELIEF", cognitiveBuckets.rejected)
  ].join("\n");
}
