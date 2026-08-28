import { AlertCircle, Clock3, Inbox } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import type { Activity } from '../types/activity';

interface ActivityTimelineProps {
  activities: Activity[];
  error?: Error | null;
  isError?: boolean;
  isLoading?: boolean;
  onRetry?: () => void;
}

const activityTypeLabels: Record<Activity['type'], string> = {
  APPLICATION_CREATED: 'Application Created',
  APPLICATION_STATUS_CHANGED: 'Status Changed',
  RESUME_UPLOADED: 'Resume Uploaded',
  RESUME_VERSION_CREATED: 'Resume Version Created',
  RESUME_MATCH_RUN: 'Resume Match Analyzed',
  INTERVIEW_NOTE_ADDED: 'Interview Note Added',
  INTERVIEW_NOTE_CREATED: 'Interview Note Created',
  INTERVIEW_NOTE_UPDATED: 'Interview Note Updated',
  INTERVIEW_NOTE_DELETED: 'Interview Note Deleted'
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

export const ActivityTimeline = ({ activities, error, isError = false, isLoading = false, onRetry }: ActivityTimelineProps) => (
  <div className="card p-5">
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-slate-950">Activity Timeline</h2>
      <p className="text-sm text-slate-500">Latest movement across your search.</p>
    </div>

    {isLoading ? (
      <LoadingSpinner label="Loading activities" />
    ) : isError ? (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Could not load activities</p>
            <p className="mt-1 text-rose-600">{error?.message ?? 'Please try again.'}</p>
            {onRetry ? (
              <button className="mt-3 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200" type="button" onClick={onRetry}>
                Try again
              </button>
            ) : null}
          </div>
        </div>
      </div>
    ) : activities.length ? (
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-600 ring-4 ring-primary-50" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{activityTypeLabels[activity.type]}</p>
              <p className="mt-0.5 text-sm text-slate-600">{activity.description}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock3 className="h-3.5 w-3.5" />
                {formatTimestamp(activity.occurredAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
        <Inbox className="h-6 w-6 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-900">No activity yet</p>
        <p className="mt-1 max-w-xs text-sm text-slate-500">Create applications, upload resumes, or run a match analysis to populate this timeline.</p>
      </div>
    )}
  </div>
);
