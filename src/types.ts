export type SourceType =
  | "private_chat"
  | "group_chat"
  | "ai_feedback"
  | "new_message";

export type FragmentOrigin =
  | "self"
  | "other_person"
  | "ai_output"
  | "external_content";

export type UserStance =
  | "endorsed"
  | "skeptical"
  | "rejected"
  | "undecided";

export type CognitiveType =
  | "fact_claim"
  | "value_judgment"
  | "hypothesis"
  | "question";

export type BeliefStatus =
  | "external_view"
  | "candidate_belief"
  | "user_belief";

export type MemoryType =
  | "preference"
  | "temporary_health_context"
  | "emotional_context"
  | "commitment"
  | "relationship_signal"
  | "user_reply_style"
  | "user_principle"
  | "world_judgment";

export type Sensitivity = "low" | "medium" | "high";

export type SuggestedAction =
  | "save_long_term"
  | "save_short_term"
  | "require_confirmation"
  | "block"
  | "ignore";

export type PrivacyLevel = "normal" | "sensitive" | "private";

export type MemoryStatus =
  | "active"
  | "expired"
  | "ignored"
  | "blocked"
  | "pending_confirmation";

export type GateDecision =
  | "allow_long_term"
  | "allow_short_term"
  | "require_user_confirmation"
  | "block"
  | "ignore";

export type ReplyStyle =
  | "warm_supportive_low_pressure"
  | "warm_low_pressure"
  | "task_oriented"
  | "intrusive_interrogation";

export type EvaluationStatus = "pass" | "fail";

export type VoiceIntent =
  | "remember_preference"
  | "save_sensitive_short_term"
  | "block_last_conversation"
  | "update_reply_style"
  | "correct_reply_framing";

export interface Person {
  id: string;
  displayName: string;
  relationshipLabel: string;
  notes: string;
}

export interface SourceSnippet {
  id: string;
  sourceType: SourceType;
  personIds: string[];
  timestamp: string;
  title: string;
  content: string;
  tags: string[];
}

export interface MemoryCandidate {
  id: string;
  personId: string;
  type: MemoryType;
  content: string;
  sourceSnippetIds: string[];
  evidence: string;
  sensitivity: Sensitivity;
  suggestedTtlDays: number | null;
  needsUserConfirmation: boolean;
  suggestedAction: SuggestedAction;
}

export interface MemoryRecord {
  id: string;
  personId: string;
  type: MemoryType;
  content: string;
  origin?: FragmentOrigin;
  stance?: UserStance;
  cognitiveType?: CognitiveType;
  beliefStatus?: BeliefStatus;
  revisionHistory?: Array<{
    at: string;
    from: BeliefStatus;
    to: BeliefStatus;
    note: string;
  }>;
  evidence: string;
  sourceSnippetIds: string[];
  createdAt: string;
  expiresAt: string | null;
  privacyLevel: PrivacyLevel;
  status: MemoryStatus;
  allowedTaskTypes: string[];
  blockedTaskTypes: string[];
}

export interface MemoryGateDecision {
  memoryCandidateId: string;
  decision: GateDecision;
  reason: string;
  ttlDays: number | null;
  requiresConfirmation: boolean;
  rawChatStored: boolean;
  label?: string;
  scope?: string;
  rawAudioStored?: boolean;
  transcriptStored?: boolean;
}

export interface StitchedContextLine {
  id: string;
  text: string;
  evidenceSourceIds: string[];
  caution?: string;
}

export interface AgentRun {
  id: string;
  inputSourceIds: string[];
  selectedMemoryIds: string[];
  blockedMemoryIds: string[];
  stitchedContext: StitchedContextLine[];
  replyStrategy: string;
  generatedReplyOptions: string[];
  evidenceMap: Record<string, string[]>;
  createdAt: string;
}

export interface ReplyOption {
  id: string;
  label: string;
  style: ReplyStyle;
  text: string;
  rationale: string;
  usedMemoryIds: string[];
}

export interface FeedbackEvent {
  id: string;
  selectedReplyOptionId: string;
  editedText: string;
  selectedStyle: ReplyStyle;
  rejectedStyles: ReplyStyle[];
  personId: string;
  createdAt: string;
  learnedPreference: string;
}

export interface UserStyleProfile {
  id: string;
  personId: string;
  preferredStyles: ReplyStyle[];
  rejectedStyles: ReplyStyle[];
  notes: string;
  updatedAt: string;
}

export interface EvaluationCase {
  id: string;
  category: string;
  testName: string;
  inputCondition: string;
  expectedBehavior: string;
  currentResult: string;
  status: EvaluationStatus;
}

export interface VoiceTriggerExample {
  id: string;
  transcript: string;
  parsedIntent: VoiceIntent;
  extractedMemoryCandidate: string;
  memoryType: MemoryType | "privacy_instruction" | "tone_correction";
  sensitivity: Sensitivity;
  memoryGateDecision: GateDecision;
  confirmationRequired: boolean;
  ttlDays: number | null;
  rawAudioStored: boolean;
  transcriptStored: boolean;
  nextReplyChange: string;
  privacyReason: string;
  toneMetadataNote: string;
}

export type AppSourceKind = "whatsapp_chat" | "doubao_style_ai";

export type AppMessageRole = "person_a" | "user" | "assistant" | "system";

export interface AppMessage {
  id: string;
  role: AppMessageRole;
  text: string;
  timestamp?: string;
  selected?: boolean;
  edited?: boolean;
}

export interface AppSource {
  id: string;
  kind: AppSourceKind;
  label: string;
  subtitle: string;
  messages: AppMessage[];
}

export interface VoiceCommand {
  id: string;
  label: string;
  transcript: string;
  sampleCommands: string[];
}

export interface ParsedIntent {
  id: string;
  label: string;
  target: string;
  summary: string;
}

export interface MemoryOperation {
  id: string;
  label: string;
  content: string;
  personId: string;
  sensitivity: Sensitivity;
  ttlDays: number | null;
  requiresConfirmation: boolean;
}

export interface ReplySuggestion {
  id: string;
  text: string;
  usedContext: string[];
}

export type ApiProvider = "openai";

export type ApiSurface = "responses";

export interface ApiProviderReservation {
  provider: ApiProvider;
  apiSurface: ApiSurface;
  status: "reserved";
  secretHandling: "server_only";
}

export interface DemoData {
  persons: Person[];
  sourceSnippets: SourceSnippet[];
  memoryCandidates: MemoryCandidate[];
  memoryRecords: MemoryRecord[];
  memoryGateDecisions: MemoryGateDecision[];
  agentRun: AgentRun;
  replyOptions: ReplyOption[];
  styleProfileSeed: UserStyleProfile;
  voiceTriggerExamples: VoiceTriggerExample[];
  evaluationCases: EvaluationCase[];
}
