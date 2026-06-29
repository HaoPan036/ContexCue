# MemoryGate

## Why MemoryGate exists

ContextCue handles social context that may be sensitive, stale, person-specific, or unsafe to reuse. MemoryGate prevents the demo from treating every observed fragment as permanent memory.

## Save rules

- Low sensitivity preferences can be saved long term when scoped to a person and task.
- User reply style choices can be saved as user preferences.
- Health related context requires confirmation and short TTL.
- Emotional context receives short TTL.
- Raw chat transcripts are blocked from memory storage.
- Person B memory is never retrieved for a Person A task.
- Voice trigger transcripts are extraction inputs only; they do not become reusable memory records.
- Raw audio is never stored in V0.1.

## Retrieval rules

Retrieval must satisfy:

- Person scope matches the current reply task.
- Task type is allowed.
- Task type is not blocked.
- Memory status is active or explicitly usable for the current review.
- Evidence is available.
- Expired memories are not used.

## Expiration rules

- Health related context: 14 days in the demo scenario.
- Emotional or pressure context: 7 days in the demo scenario.
- Lightweight commitments: short term unless refreshed.
- Long term preferences: no automatic expiry, but user can edit, ignore, or expire them.

## Sensitive information handling

Sensitive memories are marked `sensitive` or `private`. Health context starts as `pending_confirmation`. Raw chat is represented as a blocked memory record only to make the policy visible; it is not a reusable memory.

Voice trigger health context follows the same rule: a spoken instruction such as "A is avoiding spicy food this week" requires confirmation and a short TTL.

## Voice trigger handling

"Hi Jarvis" is treated as an intentional capture marker, not as a voice assistant wake word. The simulated transcript may create a structured candidate, style preference, correction, block instruction, or expiry instruction.

MemoryGate must show:

- Parsed intent.
- Extracted candidate.
- Confirmation requirement.
- TTL.
- Raw audio storage status.
- Transcript storage status.
- Effect on the next reply.

Tone or prosody can only be used as low confidence metadata. Tone must not be used for psychological diagnosis or strong emotional claims.

## Evidence display

Every recommendation and stitched context line should cite source evidence. Evidence is shown as snippet text plus source pills rather than hidden model reasoning.

## User controls

The Memory Library allows the user to:

- Approve a memory.
- Edit memory content.
- Ignore a memory.
- Expire a memory.

These controls update browser `localStorage` and can be reset to the deterministic defaults.
