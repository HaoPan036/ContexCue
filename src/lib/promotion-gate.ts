import type { BeliefStatus, FragmentOrigin, UserStance } from "@/types";

export interface PromotionInput {
  origin: FragmentOrigin;
  stance: UserStance;
  isReaffirmation: boolean;
}

export interface PromotionDecision {
  beliefStatus: BeliefStatus;
  ruleFired: string;
}

function assertNever(value: never): never {
  throw new Error(`Unhandled promotion input: ${String(value)}`);
}

function decideNonEndorsedOrigin(origin: FragmentOrigin): PromotionDecision {
  switch (origin) {
    case "ai_output":
      return {
        beliefStatus: "external_view",
        ruleFired: "AI said ≠ your view"
      };
    case "external_content":
      return {
        beliefStatus: "external_view",
        ruleFired: "Seen ≠ agreed"
      };
    case "other_person":
      return {
        beliefStatus: "external_view",
        ruleFired: "Someone else's view ≠ yours"
      };
    case "self":
      return {
        beliefStatus: "candidate_belief",
        ruleFired: "Said once ≠ long-term value"
      };
    default:
      return assertNever(origin);
  }
}

export function promotionGate(input: PromotionInput): PromotionDecision {
  const { isReaffirmation, origin, stance } = input;

  if (isReaffirmation && stance === "endorsed") {
    return {
      beliefStatus: "user_belief",
      ruleFired: "Re-affirmed after time gap"
    };
  }

  switch (stance) {
    case "endorsed":
      return {
        beliefStatus: "candidate_belief",
        ruleFired: "Endorsed once ≠ long-term — re-affirm later"
      };
    case "skeptical":
    case "rejected":
    case "undecided":
      return decideNonEndorsedOrigin(origin);
    default:
      return assertNever(stance);
  }
}
