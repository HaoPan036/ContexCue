# Memory Schema

## Person schema

- `id`: stable identifier.
- `displayName`: synthetic display label.
- `relationshipLabel`: user-facing relationship category.
- `notes`: implementation notes.

## SourceSnippet schema

- `id`
- `sourceType`: `private_chat`, `group_chat`, `ai_feedback`, or `new_message`
- `personIds`
- `timestamp`
- `title`
- `content`
- `tags`

Source snippets are extraction inputs. V0.1 does not persist raw snippets into demo state.

## MemoryCandidate schema

- `id`
- `personId`
- `type`: `preference`, `temporary_health_context`, `emotional_context`, `commitment`, `relationship_signal`, or `user_reply_style`
- `content`
- `sourceSnippetIds`
- `evidence`
- `sensitivity`: `low`, `medium`, or `high`
- `suggestedTtlDays`
- `needsUserConfirmation`
- `suggestedAction`: `save_long_term`, `save_short_term`, `require_confirmation`, `block`, or `ignore`

## MemoryRecord schema

- `id`
- `personId`
- `type`
- `content`
- `evidence`
- `sourceSnippetIds`
- `createdAt`
- `expiresAt`
- `privacyLevel`: `normal`, `sensitive`, or `private`
- `status`: `active`, `expired`, `ignored`, `blocked`, or `pending_confirmation`
- `allowedTaskTypes`
- `blockedTaskTypes`

## MemoryGateDecision schema

- `memoryCandidateId`
- `decision`: `allow_long_term`, `allow_short_term`, `require_user_confirmation`, `block`, or `ignore`
- `reason`
- `ttlDays`
- `requiresConfirmation`
- `rawChatStored`

`rawChatStored` is always `false` in V0.1.

## FeedbackEvent schema

- `id`
- `selectedReplyOptionId`
- `editedText`
- `selectedStyle`
- `rejectedStyles`
- `personId`
- `createdAt`
- `learnedPreference`

## UserStyleProfile schema

- `id`
- `personId`
- `preferredStyles`
- `rejectedStyles`
- `notes`
- `updatedAt`
