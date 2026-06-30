# Architecture

## Page structure

- `/`: primary cross-app demo with WeChat-style chat, Doubao-style AI advice, voice trigger, ContextCue status, MemoryGate, and reply suggestion.
- `/demo`: compatibility route for the same cross-app demo.
- `/memory-library`: structured memory records with approve, edit, ignore, and expire controls.
- `/feedback-learning`: reply preference selection and preference signal creation.
- `/voice-trigger-capture`: secondary capture inbox retained for inspecting individual simulated voice trigger examples.
- `/evaluation`: static V0.1 system test suite with 16 cases.

## Component structure

- `AppMockup`: frames app-like mockup surfaces.
- `WeChatMockup`: renders the Person A chat scenario.
- `DoubaoMockup`: renders the AI advice and user feedback signal.
- `VoiceTriggerBar`: simulates the "Hi Jarvis" command.
- `ContextCueStatus`: compact background agent status panel.
- `MemoryGatePanel`: compact privacy decisions.
- `ParsedIntentCard`: transcript, parsed intents, and memory operations.
- `ReplySuggestionCard`: final reply and compact evidence.
- `FAQDrawer`: deeper explanation outside the main screen.
- `SourceCard`: legacy source snippet card.
- `AgentStepCard`: wraps each agent stage.
- `MemoryCandidateCard`: shows extracted candidates and optional controls.
- `MemoryGateDecisionCard`: renders gate decisions, TTL, confirmation, and raw chat policy.
- `StitchedContextPanel`: displays the evidence grounded stitched context.
- `ReplyOptionCard`: renders selectable reply options.
- `FeedbackEventCard`: shows the saved feedback event and current style profile.
- `VoiceTriggerCard`: shows simulated transcript parsing, MemoryGate outcome, storage policy, and next reply impact.
- `EvaluationCaseCard`: renders one static eval case.
- `PrivacyBadge`: shared privacy/status badge.
- `EvidencePill`: source or domain citation chip.
- `DemoProgressStepper`: five-stage workflow stepper.

## Data flow

1. `src/lib/cross-app-demo.ts` provides deterministic primary scenario data.
2. `src/data/demo-data.json` provides legacy structured memory and evaluation fixtures.
3. The root page reads fixed app messages, voice command, parsed intents, memory operations, gate decisions, reply suggestion, and FAQ content.
4. User actions update local state and selected structured memory/feedback entries in `localStorage`.
5. The reset button clears all ContextCue demo keys.

## State management

The workspace uses simple React state. Browser `localStorage` is used only for:

- Approved or changed memory records.
- Selected reply option.
- Feedback event.
- User style profile.
- Cross-app memory operations.
- Cross-app feedback event.

The reset button clears those keys and restores deterministic defaults.

## Mock mode

Default behavior is deterministic mock mode. App messages, voice trigger parsing, MemoryGate decisions, reply suggestion, and evaluation results are precomputed so the demo is reliable without setup.

## Optional future LLM mode

A future LLM mode could call an API only after the deterministic workflow is preserved. The LLM should produce candidates, context summaries, and reply drafts, while MemoryGate remains a separate deterministic policy layer that blocks raw chat storage and enforces TTL, person scope, and task scope.
