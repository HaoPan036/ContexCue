# Architecture

## Page structure

- `/`: landing page explaining ContextCue in about 10 seconds.
- `/demo`: three-column workflow for sources, agent reasoning, MemoryGate, and reply options.
- `/memory-library`: structured memory records with approve, edit, ignore, and expire controls.
- `/feedback-learning`: reply selection and preference signal creation.
- `/evaluation`: static V0.1 evaluation suite with 12 test cases.

## Component structure

- `SourceCard`: renders source snippets and raw-chat-not-stored messaging.
- `AgentStepCard`: wraps each agent stage.
- `MemoryCandidateCard`: shows extracted candidates and optional controls.
- `MemoryGateDecisionCard`: renders gate decisions, TTL, confirmation, and raw chat policy.
- `StitchedContextPanel`: displays the evidence grounded stitched context.
- `ReplyOptionCard`: renders selectable reply options.
- `FeedbackEventCard`: shows the saved feedback event and current style profile.
- `EvaluationCaseCard`: renders one static eval case.
- `PrivacyBadge`: shared privacy/status badge.
- `EvidencePill`: source or domain citation chip.
- `DemoProgressStepper`: five-stage workflow stepper.

## Data flow

1. `src/data/demo-data.json` provides deterministic synthetic data.
2. `src/lib/demo-data.ts` exposes typed maps and formatting helpers.
3. Pages and components read demo data directly for mock agent outputs.
4. `useDemoState` loads and persists optional user changes.
5. User actions update memory record statuses, selected reply, feedback event, and style profile.

## State management

The demo uses simple React state. Browser `localStorage` is used only for:

- Approved or changed memory records.
- Selected reply option.
- Feedback event.
- User style profile.

The reset button clears those keys and restores deterministic defaults.

## Mock mode

Default behavior is deterministic mock mode. Extraction, gate decisions, stitched context, reply options, and evaluation results are precomputed from local JSON so the demo is reliable without setup.

## Optional future LLM mode

A future LLM mode could call an API only after the deterministic workflow is preserved. The LLM should produce candidates, context summaries, and reply drafts, while MemoryGate remains a separate deterministic policy layer that blocks raw chat storage and enforces TTL, person scope, and task scope.
