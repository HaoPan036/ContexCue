# 3 Minute Demo Script

## 0 to 30 seconds: problem

ContextCue is a context layer for social communication. It is not a chat app and not a social network. The problem is that useful context is scattered across private chats, group chats, time, and previous AI feedback choices.

The demo focuses on one thing: stitching scattered, low-signal social fragments into privacy controlled memory for a better reply.

## 30 to 75 seconds: fragmented sources

Open the Context Workbench. Point to the four source cards:

- Private chat from July 1: Person A mentions stress, Friday availability, quieter places, and avoiding spicy food.
- Group chat from July 2: Person A may be under presentation pressure.
- Previous AI feedback: the user preferred warm, low pressure replies and rejected direct interrogation.
- Today's message: Person A asks about the weekend plan and says they feel tired.

Emphasize that raw chat is an input, not a stored memory.

## 75 to 120 seconds: context stitching

Click Run Context Stitching. Walk through Observe and Extract.

The agent extracts structured candidates:

- Quiet place preference.
- Avoid spicy food as sensitive short term health context.
- Academic pressure as short term emotional context.
- Warm low pressure reply style as user preference.
- Friday availability as a lightweight commitment.
- Raw chat transcript as blocked.

## 120 to 165 seconds: MemoryGate

Show MemoryGate decisions.

Quiet place can be saved long term. Health context requires confirmation and expires after 14 days. Academic pressure expires after 7 days. Raw chat is blocked from storage. Memories are scoped by person and task, so Person B data does not enter Person A's reply.

Open the Memory Library briefly to show approve, edit, ignore, and expire controls.

## 165 to 210 seconds: reply and feedback learning

Return to the Context Workbench or Reply Preferences page.

Show the three reply options:

- Option A: warm, low pressure, context aware.
- Option B: task oriented.
- Option C: intrusive.

Select Option A. The selected reply creates a feedback event with selected style, rejected styles, relationship scope, and future instruction. This proves the user remains in control and their choice becomes future context.

Open Voice Trigger Capture. Show that "Hi Jarvis" is not a voice assistant interaction; it is an intentional capture marker. Walk through one preference trigger, one sensitive health trigger, one block instruction, and one tone correction. Point out that raw audio and transcripts are not stored.

## 210 to 240 seconds: evaluation and roadmap

Open Tests. Show the 16 static cases across stitching, privacy blocking, expiry, person separation, evidence citation, style adaptation, and voice trigger privacy.

Close with the roadmap: optional LLM mode, stronger held-out evaluation, consent workflows, expiry review, and local encrypted storage.
