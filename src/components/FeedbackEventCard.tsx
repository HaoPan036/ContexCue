import { CalendarClock, UserRoundCheck } from "lucide-react";
import { peopleById, titleCase } from "@/lib/demo-data";
import type { FeedbackEvent, UserStyleProfile } from "@/types";

export function FeedbackEventCard({
  event,
  profile
}: {
  event: FeedbackEvent | null;
  profile: UserStyleProfile;
}) {
  const person = peopleById.get(profile.personId);

  return (
    <section className="card-shell p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700">
          <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Feedback event</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">
            {event ? "Saved preference signal" : "Seeded style profile"}
          </h3>
        </div>
      </div>

      {event ? (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">selected_style</dt>
            <dd className="mt-1 text-slate-900">{titleCase(event.selectedStyle)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">relationship_scope</dt>
            <dd className="mt-1 text-slate-900">{person?.displayName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">rejected_styles</dt>
            <dd className="mt-1 text-slate-900">{event.rejectedStyles.map(titleCase).join(", ")}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">created_at</dt>
            <dd className="mt-1 inline-flex items-center gap-1 text-slate-900">
              <CalendarClock className="h-4 w-4 text-slate-400" aria-hidden="true" />
              {new Date(event.createdAt).toLocaleString()}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">future_instruction</dt>
            <dd className="mt-1 rounded-md border border-slate-100 bg-slate-50 p-3 text-slate-800">
              {event.learnedPreference}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">edited_text</dt>
            <dd className="mt-1 rounded-md border border-slate-100 bg-slate-50 p-3 text-slate-800">
              {event.editedText}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">{profile.notes}</p>
      )}

      <div className="mt-4 rounded-md border border-indigo-100 bg-indigo-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-normal text-indigo-700">Current profile</p>
        <p className="mt-1 text-sm leading-6 text-indigo-950">
          Preferred: {profile.preferredStyles.map(titleCase).join(", ")}. Rejected:{" "}
          {profile.rejectedStyles.map(titleCase).join(", ")}.
        </p>
      </div>
    </section>
  );
}
