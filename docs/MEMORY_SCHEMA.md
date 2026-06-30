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

## AppSource schema

- `id`
- `kind`: `wechat_style_chat` or `doubao_style_ai`
- `label`
- `subtitle`
- `messages`

## VoiceCommand schema

- `id`
- `label`
- `transcript`
- `sampleCommands`

V0.1 uses predefined transcripts instead of microphone input.

## ParsedIntent schema

- `id`
- `label`
- `target`
- `summary`

Example labels include `save_memory`, `update_reply_preference`, and `save_short_term_memory`.

## MemoryOperation schema

- `id`
- `label`
- `content`
- `personId`
- `sensitivity`
- `ttlDays`
- `requiresConfirmation`

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

## VoiceTriggerExample schema

- `id`
- `transcript`
- `parsedIntent`: `remember_preference`, `save_sensitive_short_term`, `block_last_conversation`, `update_reply_style`, or `correct_reply_framing`
- `extractedMemoryCandidate`
- `memoryType`
- `sensitivity`
- `memoryGateDecision`
- `confirmationRequired`
- `ttlDays`
- `rawAudioStored`
- `transcriptStored`
- `nextReplyChange`
- `privacyReason`
- `toneMetadataNote`

V0.1 voice examples are simulated transcripts. `rawAudioStored` and `transcriptStored` should remain `false`.
