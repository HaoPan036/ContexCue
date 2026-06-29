"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { AgentStepCard } from "@/components/AgentStepCard";
import { DemoProgressStepper, type DemoStage } from "@/components/DemoProgressStepper";
import { FeedbackEventCard } from "@/components/FeedbackEventCard";
import { MemoryCandidateCard } from "@/components/MemoryCandidateCard";
import { MemoryGateDecisionCard } from "@/components/MemoryGateDecisionCard";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { ReplyOptionCard } from "@/components/ReplyOptionCard";
import { SourceCard } from "@/components/SourceCard";
import { StitchedContextPanel } from "@/components/StitchedContextPanel";
import { demoData } from "@/lib/demo-data";
import { useDemoState } from "@/hooks/useDemoState";

const stages: DemoStage[] = [
  { id: 1, label: "Observe" },
  { id: 2, label: "Extract" },
  { id: 3, label: "Gate" },
  { id: 4, label: "Stitch" },
  { id: 5, label: "Recommend" }
];

const candidateToMemoryId: Record<string, string> = {
  "cand-quiet-place": "memory-quiet-place",
  "cand-avoid-spicy": "memory-avoid-spicy",
  "cand-academic-pressure": "memory-academic-pressure",
  "cand-reply-style": "memory-reply-style",
  "cand-friday-availability": "memory-friday-availability",
  "cand-raw-chat": "memory-raw-chat"
};

export function DemoWorkspace() {
  const [currentStage, setCurrentStage] = useState(0);
  const {
    selectedReplyOptionId,
    feedbackEvent,
    styleProfile,
    updateMemoryStatus,
    selectReplyOption,
    resetDemo
  } = useDemoState();

  const mainSources = useMemo(
    () => demoData.sourceSnippets.filter((source) => source.tags.includes("main_scenario")),
    []
  );
  const scenarioCandidates = useMemo(
    () =>
      demoData.memoryCandidates.filter((candidate) =>
        candidate.sourceSnippetIds.some((sourceId) => demoData.agentRun.inputSourceIds.includes(sourceId))
      ),
    []
  );
  const scenarioDecisions = useMemo(
    () =>
      demoData.memoryGateDecisions.filter((decision) =>
        scenarioCandidates.some((candidate) => candidate.id === decision.memoryCandidateId)
      ),
    [scenarioCandidates]
  );

  useEffect(() => {
    if (currentStage <= 0 || currentStage >= stages.length) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCurrentStage((stage) => Math.min(stage + 1, stages.length));
    }, 700);

    return () => window.clearTimeout(timer);
  }, [currentStage]);

  function runStitching() {
    setCurrentStage(1);
  }

  function resetAll() {
    resetDemo();
    setCurrentStage(0);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <PrivacyBadge value="mock" label="Deterministic mock mode" />
            <PrivacyBadge value="normal" label="Synthetic data only" />
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-slate-950">Demo Workspace</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            The demo stitches four scattered sources into task specific context, applies
            MemoryGate rules, recommends evidence grounded replies, and learns from the final
            user choice.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runStitching}
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Run Context Stitching
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset demo
          </button>
        </div>
      </div>

      <div className="mb-6">
        <DemoProgressStepper stages={stages} currentStage={currentStage} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)_minmax(0,0.95fr)]">
        <aside className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Stage 1 / Observe</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Conversation sources</h2>
          </div>
          {mainSources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </aside>

        <section className="space-y-4">
          {currentStage === 0 ? (
            <AgentStepCard title="Ready to stitch context" eyebrow="Idle">
              <p>
                The workspace is loaded with synthetic snippets. Run the agent to reveal the five
                stages and inspect each MemoryGate decision.
              </p>
            </AgentStepCard>
          ) : null}

          {currentStage >= 1 ? (
            <AgentStepCard title="Observe four fragmented sources" eyebrow="Stage 1 / Observe" complete={currentStage > 1} active={currentStage === 1}>
              <p>
                The agent sees a private chat, a group chat, a previous AI feedback choice, and a
                new message. The sources remain inputs; raw chat is not saved as memory.
              </p>
            </AgentStepCard>
          ) : null}

          {currentStage >= 2 ? (
            <AgentStepCard title="Extract structured candidates" eyebrow="Stage 2 / Extract" complete={currentStage > 2} active={currentStage === 2}>
              <div className="grid gap-3">
                {scenarioCandidates.map((candidate) => {
                  const memoryId = candidateToMemoryId[candidate.id];
                  return (
                    <MemoryCandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onApprove={memoryId && candidate.suggestedAction !== "block" ? () => updateMemoryStatus(memoryId, "active") : undefined}
                      onIgnore={memoryId ? () => updateMemoryStatus(memoryId, "ignored") : undefined}
                      onExpire={memoryId && candidate.suggestedAction !== "block" ? () => updateMemoryStatus(memoryId, "expired") : undefined}
                    />
                  );
                })}
              </div>
            </AgentStepCard>
          ) : null}

          {currentStage >= 3 ? (
            <AgentStepCard title="Apply MemoryGate privacy rules" eyebrow="Stage 3 / Gate" complete={currentStage > 3} active={currentStage === 3}>
              <p>
                Long term preferences, short term emotional context, sensitive health related
                memory, and raw transcript blocking each receive separate decisions.
              </p>
            </AgentStepCard>
          ) : null}

          {currentStage >= 4 ? <StitchedContextPanel agentRun={demoData.agentRun} /> : null}

          {currentStage >= 5 ? (
            <AgentStepCard title="Recommend and learn" eyebrow="Stage 5 / Recommend" active={currentStage === 5}>
              <p>
                Option A uses the stitched context carefully: it acknowledges tiredness, lowers
                planning pressure, avoids spicy food, and leaves space to rest.
              </p>
            </AgentStepCard>
          ) : null}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="card-shell p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">MemoryGate rules</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>Raw chat is not stored in V0.1.</li>
              <li>Memories are scoped by person and task.</li>
              <li>Sensitive context needs confirmation.</li>
              <li>Health and emotional context expire automatically.</li>
              <li>Recommendations show evidence.</li>
            </ul>
          </section>

          {currentStage >= 3 ? (
            <div className="space-y-3">
              {scenarioDecisions.map((decision) => (
                <MemoryGateDecisionCard key={decision.memoryCandidateId} decision={decision} />
              ))}
            </div>
          ) : null}

          {currentStage >= 5 ? (
            <section className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Reply options</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Choose a final reply</h2>
              </div>
              {demoData.replyOptions.map((reply) => (
                <ReplyOptionCard
                  key={reply.id}
                  reply={reply}
                  recommended={reply.id === "reply-a"}
                  selected={selectedReplyOptionId === reply.id}
                  onSelect={() => selectReplyOption(reply)}
                />
              ))}
              <FeedbackEventCard event={feedbackEvent} profile={styleProfile} />
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
