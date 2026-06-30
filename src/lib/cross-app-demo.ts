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
        text: "Gemini can connect to Photos now?"
      },
      {
        id: "wa-3",
        role: "person_a",
        text: "Looks useful. Also a little creepy."
      },
      {
        id: "wu-1",
        role: "user",
        text: "I'll check what it actually uses."
      },
      {
        id: "wa-5",
        role: "person_a",
        text: "Send me the short version?",
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
    "Hi Jarvis, remember A is cautious about AI tools connected to personal photos. Keep AI news replies practical, sourced, and not hypey.",
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
    content: "A is cautious about AI tools connected to personal photos",
    personId: "person-a",
    sensitivity: "medium",
    ttlDays: 30,
    requiresConfirmation: true
  },
  {
    id: "op-style-practical",
    label: "Reply style",
    content: "Explain AI news without hype",
    personId: "person-a",
    sensitivity: "low",
    ttlDays: null,
    requiresConfirmation: false
  },
  {
    id: "op-source-context",
    label: "Source preference",
    content: "Include source context",
    personId: "person-a",
    sensitivity: "low",
    ttlDays: null,
    requiresConfirmation: false
  }
];

export const replySuggestion: ReplySuggestion = {
  id: "reply-suggestion-main",
  text:
    "Short version: useful, but check Photos access first. Google says Photos data is not used for ads or outside-Photos model training.",
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
