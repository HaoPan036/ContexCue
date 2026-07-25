export type ContinuitySignal =
  | "north_star"
  | "settled"
  | "rejected"
  | "open_question"
  | "next_move";

export interface ContinuityFragment {
  id: string;
  content: string;
  signal: ContinuitySignal;
  category: string;
}

export interface ContinuityRequest {
  prompt: string;
  fragments: ContinuityFragment[];
}

export interface ContinuitySnapshot {
  northStar: string;
  settled: string[];
  rejected: string[];
  openQuestion: string;
  nextMove: string;
  assistantResponse: string;
  usedFragmentIds: string[];
  excludedFragmentIds: string[];
  exclusionReasons: Record<string, string>;
}

export interface ContinuityEngine {
  createSnapshot(request: ContinuityRequest): Promise<ContinuitySnapshot>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

export function isContinuitySnapshot(
  value: unknown
): value is ContinuitySnapshot {
  if (
    !isRecord(value) ||
    typeof value.northStar !== "string" ||
    !isStringArray(value.settled) ||
    !isStringArray(value.rejected) ||
    typeof value.openQuestion !== "string" ||
    typeof value.nextMove !== "string" ||
    typeof value.assistantResponse !== "string" ||
    !isStringArray(value.usedFragmentIds) ||
    !isStringArray(value.excludedFragmentIds) ||
    !isStringRecord(value.exclusionReasons)
  ) {
    return false;
  }

  const excludedIds = new Set(value.excludedFragmentIds);
  const reasonIds = Object.keys(value.exclusionReasons);

  return (
    excludedIds.size === value.excludedFragmentIds.length &&
    reasonIds.length === excludedIds.size &&
    reasonIds.every((id) => excludedIds.has(id))
  );
}

export const demoContinuityFragments: ContinuityFragment[] = [
  {
    id: "continuity-demo-north-star",
    content: "Restore a usable thinking state after interruption.",
    signal: "north_star",
    category: "product_direction"
  },
  {
    id: "continuity-demo-settled",
    content: "Keep manual classification out of the experience.",
    signal: "settled",
    category: "experience"
  },
  {
    id: "continuity-demo-rejected",
    content: "No text-heavy memory management dashboard.",
    signal: "rejected",
    category: "interface"
  },
  {
    id: "continuity-demo-open-question",
    content: "How can restored continuity become instantly visible?",
    signal: "open_question",
    category: "demo"
  },
  {
    id: "continuity-demo-next-move",
    content: "Jump forward in time, then resume from the last coherent state.",
    signal: "next_move",
    category: "demo"
  }
];

function keepLastById(
  fragments: ContinuityFragment[]
): ContinuityFragment[] {
  const lastIndexById = new Map<string, number>();

  fragments.forEach((fragment, index) => {
    lastIndexById.set(fragment.id, index);
  });

  return fragments.filter(
    (fragment, index) => lastIndexById.get(fragment.id) === index
  );
}

function latestWithSignal(
  fragments: ContinuityFragment[],
  signal: ContinuitySignal
): ContinuityFragment | undefined {
  for (let index = fragments.length - 1; index >= 0; index -= 1) {
    if (fragments[index].signal === signal) {
      return fragments[index];
    }
  }

  return undefined;
}

function latestPerCategory(
  fragments: ContinuityFragment[],
  signal: ContinuitySignal
): ContinuityFragment[] {
  const matchingFragments = fragments.filter(
    (fragment) => fragment.signal === signal
  );
  const lastIndexByCategory = new Map<string, number>();

  matchingFragments.forEach((fragment, index) => {
    lastIndexByCategory.set(fragment.category, index);
  });

  return matchingFragments.filter(
    (fragment, index) =>
      lastIndexByCategory.get(fragment.category) === index
  );
}

export function buildLocalContinuitySnapshot(
  request: ContinuityRequest
): ContinuitySnapshot {
  const fragments = keepLastById(request.fragments);
  const northStarFragment = latestWithSignal(fragments, "north_star");
  const settledFragments = latestPerCategory(fragments, "settled");
  const rejectedFragments = latestPerCategory(fragments, "rejected");
  const openQuestionFragment = latestWithSignal(fragments, "open_question");
  const nextMoveFragment = latestWithSignal(fragments, "next_move");

  const northStar =
    northStarFragment?.content.trim() ?? "No north star has been captured yet.";
  const settled = settledFragments.map((fragment) => fragment.content.trim());
  const rejected = rejectedFragments.map((fragment) =>
    fragment.content.trim()
  );
  const openQuestion =
    openQuestionFragment?.content.trim() ??
    "What needs to be clarified before continuing?";
  const nextMove =
    nextMoveFragment?.content.trim() ??
    `Resolve the open question: ${openQuestion}`;

  const usedFragmentIds = [
    northStarFragment?.id,
    ...settledFragments.map((fragment) => fragment.id),
    openQuestionFragment?.id,
    nextMoveFragment?.id
  ].filter((id): id is string => Boolean(id));
  const excludedFragmentIds = rejectedFragments.map(
    (fragment) => fragment.id
  );
  const exclusionReasons = Object.fromEntries(
    excludedFragmentIds.map((id) => [id, "Rejected direction"])
  );

  const asClause = (value: string) =>
    value.trim().replace(/[.!?]+/g, "").replace(/\s+/g, " ");
  const lowercaseFirst = (value: string) =>
    value.length > 0
      ? `${value[0].toLowerCase()}${value.slice(1)}`
      : value;
  const promptClause = asClause(request.prompt);
  const purposeClause = /^to\b/i.test(promptClause)
    ? `${promptClause[0].toUpperCase()}${promptClause.slice(1)}`
    : `To ${lowercaseFirst(promptClause)}`;
  const continuationClauses = [nextMove, ...settled]
    .map(asClause)
    .filter(Boolean)
    .map(lowercaseFirst);
  const assistantResponse = `${purposeClause}: ${continuationClauses.join(
    "; "
  )}.`;

  return {
    northStar,
    settled,
    rejected,
    openQuestion,
    nextMove,
    assistantResponse,
    usedFragmentIds,
    excludedFragmentIds,
    exclusionReasons
  };
}
