import type {
  AppSource,
  MemoryOperation,
  ReplySuggestion,
  VoiceCommand
} from "@/types";

export const crossAppSources: AppSource[] = [
  {
    id: "whatsapp-chat",
    kind: "whatsapp_chat",
    label: "WhatsApp chat",
    subtitle: "Person A · AI news discussion",
    messages: [
      {
        id: "wa-1",
        role: "person_a",
        text: "Did you see Gemini's new personalized image thing with Google Photos?"
      },
      {
        id: "wa-2",
        role: "person_a",
        text: "Everyone is posting AI photo edits again."
      },
      {
        id: "wa-3",
        role: "person_a",
        text: "It looks fun, but I get nervous when tools connect to my photos."
      },
      {
        id: "wa-4",
        role: "person_a",
        text: "I don't want a dramatic take. I just want to know if it's actually safe to try."
      },
      {
        id: "wu-1",
        role: "user",
        text: "Yeah, I saw the update. Let me check the details."
      },
      {
        id: "wa-5",
        role: "person_a",
        text: "Can you send me the short version before I decide?",
        timestamp: "10:42"
      }
    ]
  },
  {
    id: "doubao-style",
    kind: "doubao_style_ai",
    label: "AI reply feedback",
    subtitle: "Reply advice · feedback signal",
    messages: [
      {
        id: "du-1",
        role: "user",
        text: "How should I reply to A about the Gemini image feature? Keep it practical."
      },
      {
        id: "da-1",
        role: "assistant",
        text: "Option 1: Hype the feature and say everyone should try it."
      },
      {
        id: "da-2",
        role: "assistant",
        text: "Option 2: Tell them to avoid it completely."
      },
      {
        id: "da-3",
        role: "assistant",
        text: "Option 3: Summarize the feature, mention privacy tradeoffs, and keep the choice low pressure.",
        selected: true
      },
      {
        id: "ds-1",
        role: "system",
        text: "User selected Option 3 and removed the hype language.",
        edited: true
      }
    ]
  }
];

export const voiceCommand: VoiceCommand = {
  id: "voice-main",
  label: "Voice trigger",
  transcript:
    "Hi Jarvis, remember that A is cautious about AI tools that connect to personal photos. For AI news, keep replies practical, sourced, and not hypey.",
  sampleCommands: [
    "Remember AI photo privacy concern",
    "Use a practical tone for AI news",
    "Avoid hype language"
  ]
};

export const memoryOperations: MemoryOperation[] = [
  {
    id: "op-ai-privacy",
    label: "AI photo privacy preference",
    content: "A is cautious about AI tools that connect to personal photos",
    personId: "person-a",
    sensitivity: "medium",
    ttlDays: 30,
    requiresConfirmation: true
  },
  {
    id: "op-style-practical",
    label: "Reply style",
    content: "For A, explain AI news in a practical, low-hype tone",
    personId: "person-a",
    sensitivity: "low",
    ttlDays: null,
    requiresConfirmation: false
  },
  {
    id: "op-source-context",
    label: "Source preference",
    content: "When discussing fast-moving AI news with A, include source context",
    personId: "person-a",
    sensitivity: "low",
    ttlDays: null,
    requiresConfirmation: false
  }
];

export const replySuggestion: ReplySuggestion = {
  id: "reply-suggestion-main",
  text:
    "Short version: Gemini can now personalize image prompts using your interests and connected Google Photos. Google says private photo libraries are not used to train the model, but I would still check what you connect and keep it off if you are unsure. No rush to try it.",
  usedContext: [
    "A is cautious about personal photos",
    "A asked for the short version",
    "Use practical AI news tone",
    "Avoid hype language"
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
