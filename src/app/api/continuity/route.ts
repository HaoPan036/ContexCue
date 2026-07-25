import { NextResponse } from "next/server";
import {
  buildLocalContinuitySnapshot,
  isContinuitySnapshot,
  type ContinuityEngine,
  type ContinuityFragment,
  type ContinuityRequest,
  type ContinuitySignal
} from "@/lib/continuity-engine";

const continuityEngine: ContinuityEngine = {
  createSnapshot: async (request) =>
    buildLocalContinuitySnapshot(request)
};

const MAX_PROMPT_LENGTH = 2_000;
const MAX_FRAGMENT_COUNT = 100;
const MAX_FRAGMENT_ID_LENGTH = 200;
const MAX_FRAGMENT_CONTENT_LENGTH = 10_000;
const MAX_FRAGMENT_CATEGORY_LENGTH = 100;

const continuitySignals = new Set<ContinuitySignal>([
  "north_star",
  "settled",
  "rejected",
  "open_question",
  "next_move"
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseBoundedString(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 && trimmedValue.length <= maxLength
    ? trimmedValue
    : null;
}

function parseContinuityFragment(
  value: unknown
): ContinuityFragment | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = parseBoundedString(value.id, MAX_FRAGMENT_ID_LENGTH);
  const content = parseBoundedString(
    value.content,
    MAX_FRAGMENT_CONTENT_LENGTH
  );
  const category = parseBoundedString(
    value.category,
    MAX_FRAGMENT_CATEGORY_LENGTH
  );
  const signal =
    typeof value.signal === "string" &&
    continuitySignals.has(value.signal as ContinuitySignal)
      ? (value.signal as ContinuitySignal)
      : null;

  if (!id || !content || !category || !signal) {
    return null;
  }

  return { id, content, signal, category };
}

function parseContinuityRequest(value: unknown): ContinuityRequest | null {
  if (!isRecord(value) || !Array.isArray(value.fragments)) {
    return null;
  }

  const prompt = parseBoundedString(value.prompt, MAX_PROMPT_LENGTH);

  if (!prompt || value.fragments.length > MAX_FRAGMENT_COUNT) {
    return null;
  }

  const fragments: ContinuityFragment[] = [];

  for (const valueFragment of value.fragments) {
    const fragment = parseContinuityFragment(valueFragment);

    if (!fragment) {
      return null;
    }

    fragments.push(fragment);
  }

  const fragmentIds = fragments.map((fragment) => fragment.id);
  if (new Set(fragmentIds).size !== fragmentIds.length) {
    return null;
  }

  return {
    prompt,
    fragments
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const continuityRequest = parseContinuityRequest(body);

  if (!continuityRequest) {
    return NextResponse.json(
      {
        error:
          "Expected { prompt: string; fragments: ContinuityFragment[] } with unique fragment ids."
      },
      { status: 400 }
    );
  }

  try {
    const snapshot =
      await continuityEngine.createSnapshot(continuityRequest);

    if (!isContinuitySnapshot(snapshot)) {
      return NextResponse.json(
        { error: "Continuity engine returned an invalid snapshot." },
        { status: 502 }
      );
    }

    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json(
      { error: "Unable to build continuity snapshot." },
      { status: 500 }
    );
  }
}
