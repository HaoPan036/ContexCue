import type {
  AppSource,
  MemoryOperation,
  ReplySuggestion,
  VoiceCommand
} from "@/types";

export const crossAppSources: AppSource[] = [
  {
    id: "wechat-style",
    kind: "wechat_style_chat",
    label: "WeChat style chat",
    subtitle: "Person A · normal conversation",
    messages: [
      {
        id: "wa-1",
        role: "person_a",
        text: "This week has been exhausting. My advisor criticized me again in group meeting."
      },
      {
        id: "wa-2",
        role: "person_a",
        text: "I might still be free this weekend."
      },
      {
        id: "wa-3",
        role: "person_a",
        text: "Can we find somewhere quiet this time? Last place was too noisy."
      },
      {
        id: "wa-4",
        role: "person_a",
        text: "Also no spicy food recently. My stomach has not been great."
      },
      {
        id: "wu-1",
        role: "user",
        text: "Sure, I'll check."
      },
      {
        id: "wa-5",
        role: "person_a",
        text: "Are we still going out this weekend? I feel a bit tired.",
        timestamp: "Later"
      }
    ]
  },
  {
    id: "doubao-style",
    kind: "doubao_style_ai",
    label: "Doubao style AI chat",
    subtitle: "Reply advice · feedback signal",
    messages: [
      {
        id: "du-1",
        role: "user",
        text: "How should I reply to A? I want to sound caring, but not pushy."
      },
      {
        id: "da-1",
        role: "assistant",
        text: "Option 1: Directly ask what happened."
      },
      {
        id: "da-2",
        role: "assistant",
        text: "Option 2: Suggest a place immediately."
      },
      {
        id: "da-3",
        role: "assistant",
        text: "Option 3: Acknowledge tiredness and give a low pressure option.",
        selected: true
      },
      {
        id: "ds-1",
        role: "system",
        text: "User selected Option 3 and edited it slightly.",
        edited: true
      }
    ]
  }
];

export const voiceCommand: VoiceCommand = {
  id: "voice-main",
  label: "Voice trigger",
  transcript:
    "Hi Jarvis, remember that A prefers quiet places. Also, don't make my reply sound pushy. The spicy food thing is temporary, only keep it for two weeks.",
  sampleCommands: [
    "Remember quiet places",
    "Avoid pushy replies",
    "Keep spicy food for 14 days"
  ]
};

export const memoryOperations: MemoryOperation[] = [
  {
    id: "op-quiet",
    label: "Quiet place preference",
    content: "A prefers quiet places",
    personId: "person-a",
    sensitivity: "low",
    ttlDays: null,
    requiresConfirmation: false
  },
  {
    id: "op-style",
    label: "Reply style",
    content: "For A, prefer warm and low pressure replies",
    personId: "person-a",
    sensitivity: "low",
    ttlDays: null,
    requiresConfirmation: false
  },
  {
    id: "op-spicy",
    label: "Temporary food context",
    content: "Avoid spicy food for A for 14 days",
    personId: "person-a",
    sensitivity: "high",
    ttlDays: 14,
    requiresConfirmation: true
  }
];

export const replySuggestion: ReplySuggestion = {
  id: "reply-suggestion-main",
  text:
    "This week sounds really tiring. We can find a quiet place and avoid spicy food. If you'd rather rest, that's totally fine too. We can decide based on how you feel this weekend.",
  usedContext: [
    "A prefers quiet places",
    "A recently avoids spicy food",
    "User prefers low pressure replies with A",
    "A seems tired this week"
  ]
};

export const faqItems = [
  {
    question: "What is ContextCue?",
    answer:
      "A background memory layer for personal AI agents. It turns explicit user instructions into controlled, scoped memory."
  },
  {
    question: "Why does this need AI?",
    answer:
      "The useful signal is scattered across app conversations, AI feedback, time, and user corrections. The agent has to stitch those fragments without saving unsafe context."
  },
  {
    question: "Is this a chatbot?",
    answer:
      "No. The chat apps remain the primary surface. ContextCue runs quietly around them and helps update memory or prepare a reply."
  },
  {
    question: "Does it store raw chat?",
    answer:
      "No. V0.1 uses chat as extraction input only and stores structured memory candidates."
  },
  {
    question: "Does it store voice?",
    answer:
      "No. Raw audio is never stored. Simulated transcripts are used for extraction only."
  },
  {
    question: "What is MemoryGate?",
    answer:
      "A policy layer that decides whether extracted context should be saved long term, saved short term, confirmed, ignored, or blocked."
  },
  {
    question: "How is this different from a normal AI reply assistant?",
    answer:
      "A reply assistant drafts from the current prompt. ContextCue manages memory and feedback across apps before the reply is generated."
  },
  {
    question: "How is this different from a high permission personal agent?",
    answer:
      "It relies on explicit capture triggers and privacy gates instead of broad always-on access."
  },
  {
    question: "What can users control?",
    answer:
      "Users can decide what to remember, block, expire, correct, or apply as future reply preference."
  },
  {
    question: "What is the future roadmap?",
    answer:
      "Real import adapters, stronger consent controls, local encrypted storage, expiry review, and optional LLM mode."
  }
];
