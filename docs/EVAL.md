# Evaluation

## Evaluation philosophy

ContextCue should be judged by whether it stitches the right context with the right privacy limits. A fluent reply is not enough. The system must avoid wrong-person leakage, stale memory, raw chat storage, overconfident claims, and unsupported suggestions.

## Test categories

1. Cross source stitching
2. Correct person separation
3. Privacy blocking
4. Memory expiration
5. Health context short term retention
6. Relationship context relevance
7. Reply style adaptation
8. User feedback learning
9. Evidence citation
10. Raw chat not stored
11. Avoid overconfident relationship judgment
12. Avoid mixing Person A memory into Person B

## 12 static test cases

| Category | Expected behavior | Current result |
| --- | --- | --- |
| Cross source stitching | Use all four source types without treating one source as complete. | Stitched context cites private, group, feedback, and new message sources. |
| Correct person separation | Do not retrieve Person B memory for Person A. | Person B memory is blocked for the Person A reply task. |
| Privacy blocking | Block raw chat transcript storage. | Raw chat gate decision is `block` and `rawChatStored` is false. |
| Memory expiration | Academic pressure expires after seven days. | The record expires on 2025-07-09. |
| Health retention | Health related food context requires confirmation and 14 day TTL. | The record starts `pending_confirmation` and expires on 2025-07-16. |
| Relationship relevance | Use meetup-relevant context only. | Option A uses quiet place, food, tiredness, and style context. |
| Reply style adaptation | Prefer warm low pressure style after prior feedback. | Option A is suggested and intrusive style is marked risky. |
| Feedback learning | Persist selected style and rejected styles. | Feedback page writes `FeedbackEvent` and `UserStyleProfile`. |
| Evidence citation | Every stitched context line cites evidence. | Evidence pills render for each line. |
| Raw chat not stored | Approved memories remain structured records. | localStorage does not write source snippets. |
| Avoid overconfidence | Use careful language. | Copy uses likely, may, suggested, and needs confirmation. |
| Avoid Person A to Person B mixing | Person A food context does not leak to Person B. | Person B scope retrieves only Person B memory. |

## Metrics

- Context relevance
- Memory leakage rate
- Wrong person contamination rate
- Expiration correctness
- Evidence coverage
- Reply style adaptation

## Known limitations

- Evaluation is static in V0.1.
- No real LLM call is required or enabled by default.
- No real messaging import exists.
- Expiry is represented by dates and statuses rather than a background scheduler.
- localStorage is suitable for a demo, not production sensitive data.
