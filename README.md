# ContextCue

## What is ContextCue

ContextCue is a portfolio-ready local demo of a social context agent with privacy controlled memory.

It is not a social media replacement, chat client, dating advice app, or daily journal. It is a context layer on top of existing social workflows: it observes scattered fragments, extracts structured memory candidates, applies privacy rules, and helps draft better replies while keeping the user in control.

## Why this needs AI

The hard problem is not generating a pleasant message. The hard problem is deciding which fragments matter across time, chats, group contexts, and previous AI feedback choices.

ContextCue demonstrates AI-shaped context stitching:

- Collect low-signal fragments from multiple sources.
- Separate people and task scopes.
- Convert raw snippets into structured memory candidates.
- Decide what is safe, expired, sensitive, or blocked.
- Cite evidence for each recommendation.
- Learn from the reply the user actually chooses.

## Demo scenario

The synthetic scenario centers on Person A:

- July 1 private chat: Person A mentions stress, a Friday meetup, a quieter place, and avoiding spicy food.
- July 2 group chat: classmates mention Person A is preparing for a Monday presentation.
- July 2 AI feedback: the user previously chose a warm, low pressure reply and rejected direct interrogation.
- New message: Person A asks whether the weekend plan is still happening and says they feel tired.

The expected suggestion is warm, context aware, and low pressure:

```text
This week sounds really tiring. We can find a quiet place and avoid spicy food. If you would rather rest, that is totally fine too. We can decide based on how you feel this weekend.
```

## Core workflow

1. Observe: show the four fragmented sources.
2. Extract: identify structured memory candidates.
3. Gate: apply MemoryGate privacy and expiry rules.
4. Stitch: produce current relationship context with evidence.
5. Recommend and Learn: show reply options and update the style profile from the user's choice.

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

- `Person`
- `SourceSnippet`
- `MemoryCandidate`
- `MemoryRecord`
- `MemoryGateDecision`
- `AgentRun`
- `ReplyOption`
- `FeedbackEvent`
- `UserStyleProfile`

Synthetic data lives in `src/data/demo-data.json`.

## Privacy assumptions

- The app uses synthetic demo data only.
- No login, real messaging integration, backend, cloud sync, or external database is included.
- V0.1 stores optional demo state in browser `localStorage`.
- `localStorage` is limited to memory records, the selected reply option, feedback event, and user style profile.
- Raw source snippets are not persisted by the demo state.
- Sensitive health context requires confirmation and expires.
- Emotional context is short term.
- Memories are scoped by person and task.
- The app avoids confident psychological claims and uses careful language such as "likely" and "may indicate."

## Evaluation

The Evaluation page contains 12 static V0.1 test cases:

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
