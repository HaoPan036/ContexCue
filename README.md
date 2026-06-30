# ContextCue

## What is ContextCue

ContextCue is a cross-app interaction demo for a social context agent with privacy controlled memory.

It is not a social media replacement, chat client, dating advice app, voice assistant clone, or automatic sender. It is a background memory and context layer for personal AI agents.

## Why this needs AI

The hard problem is not generating a pleasant message. The hard problem is deciding which fragments matter across time, chats, group contexts, and previous AI feedback choices.

ContextCue centers on AI-shaped context stitching:

- Collect low-signal fragments from multiple sources.
- Separate people and task scopes.
- Convert raw snippets into structured memory candidates.
- Decide what is safe, expired, sensitive, or blocked.
- Cite evidence for each recommendation.
- Learn from the reply the user actually chooses.

## Cross-app scenario

The primary screen shows two app-style mockups:

- WeChat style chat with Person A.
- Doubao style AI chat where the user asked for reply advice and selected a low pressure option.

The user then triggers ContextCue with a simulated voice command:

```text
Hi Jarvis, remember that A prefers quiet places. Also, don't make my reply sound pushy. The spicy food thing is temporary, only keep it for two weeks.
```

ContextCue parses the instruction, applies MemoryGate, updates structured memory, and suggests a reply for the latest WeChat-style message:

```text
This week sounds really tiring. We can find a quiet place and avoid spicy food. If you'd rather rest, that's totally fine too. We can decide based on how you feel this weekend.
```

## Core workflow

1. Show normal app conversations.
2. User clicks Run demo to simulate a voice trigger.
3. Transcript appears.
4. Parsed instructions appear.
5. MemoryGate decisions appear.
6. ContextCue updates memory in the background.
7. Final reply suggestion appears.
8. User can click Use this reply to save a feedback event.

## Voice Trigger Capture

V0.1 uses simulated transcripts instead of microphone input. Voice is not used as a voice assistant. The phrase "Hi Jarvis" marks an intentional memory capture instruction: remember, correct, block, expire, or update a future reply preference.

The workspace uses fixed transcripts instead of real microphone input. It shows each transcript, parsed intent, extracted candidate, MemoryGate decision, confirmation requirement, audio/transcript storage status, and how the instruction changes the next reply.

## MemoryGate design

MemoryGate turns extracted candidates into controlled memory records:

- Quiet place preference: safe long term preference.
- Avoid spicy food: sensitive health related context, confirmation required, 14 day TTL.
- Academic pressure: short term emotional context, 7 day TTL.
- Raw chat: blocked from storage.
- Reply style preference: safe user preference scoped to Person A.

Every record has person scope, task scope, evidence, privacy level, status, allowed domains, and blocked domains.

## Data model

The TypeScript model includes:

- `AppSource`
- `VoiceCommand`
- `ParsedIntent`
- `MemoryOperation`
- `Person`
- `SourceSnippet`
- `MemoryCandidate`
- `MemoryRecord`
- `MemoryGateDecision`
- `AgentRun`
- `ReplyOption`
- `ReplySuggestion`
- `FeedbackEvent`
- `UserStyleProfile`

Synthetic legacy data lives in `src/data/demo-data.json`. The primary cross-app demo data lives in `src/lib/cross-app-demo.ts`.

## Privacy assumptions

- The app uses synthetic data only.
- No login, real messaging integration, backend, cloud sync, or external database is included.
- V0.1 stores optional local state in browser `localStorage`.
- `localStorage` is limited to memory records, the selected reply option, feedback event, and user style profile.
- Raw source snippets are not persisted by the demo state.
- Raw audio is never stored in V0.1.
- Voice transcripts are used only for extraction and are not stored as reusable memory.
- Sensitive health context requires confirmation and expires.
- Emotional context is short term.
- Tone or prosody can only be used as low confidence metadata and must not be used for diagnosis or strong emotional claims.
- Memories are scoped by person and task.
- The app avoids confident psychological claims and uses careful language such as "likely" and "may indicate."

## System tests

The Tests page contains 16 static V0.1 cases:

- Cross source stitching
- Correct person separation
- Privacy blocking
- Memory expiration
- Health context short term retention
- Relationship context relevance
- Reply style adaptation
- User feedback learning
- Evidence citation
- Raw chat not stored
- Avoid overconfident relationship judgment
- Avoid mixing Person A memory into Person B

## How to run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Build verification:

```bash
npm run typecheck
npm run build
```

## Future roadmap

- Optional LLM mode when an OpenAI API key is present.
- Import adapters for screenshots or exported chat snippets.
- More explicit consent workflows for sensitive memory.
- Expiry review notifications.
- Stronger retrieval evaluation with held-out cases.
- Local encrypted storage for approved memories.
- User-defined relationship and task scopes.
