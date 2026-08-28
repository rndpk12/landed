import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { applicationApi } from '../services/applicationApi';

export const ApplicationDetailsPage = () => {
  const { id = '' } = useParams();
  const { data: application, isLoading } = useQuery({ queryKey: ['application', id], queryFn: () => applicationApi.get(id) });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!application) {
    return (
      <div className="page-shell">
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-950">Application not found</h2>
          <Link className="mt-4 inline-flex text-sm font-semibold text-primary-600" to="/applications">Back to applications</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Link className="text-sm font-semibold text-primary-600" to="/applications">← Back to applications</Link>
      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">{application.company}</h2>
            <p className="mt-2 text-lg text-slate-600">{application.role}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Info label="Applied Date" value={application.appliedDate} />
          <Info label="Resume Used" value={application.resume} />
          <Info label="Status" value={application.status} />
          <Info label="Job URL" value={application.jobUrl ? <a className="inline-flex items-center gap-1 text-primary-600" href={application.jobUrl} target="_blank" rel="noreferrer">Open <ExternalLink className="h-3 w-3" /></a> : 'Not added'} />
        </div>
        <div className="mt-8 rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-700">Notes</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{application.notes ?? 'No notes yet.'}</p>
        </div>
      </section>
      <section className="card p-6">
        <h3 className="text-lg font-semibold text-slate-950">Timeline</h3>
        <div className="mt-5 space-y-4">
          {application.timeline.map((event) => (
            <div key={event.id} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
              <div className="mt-1 h-3 w-3 rounded-full bg-primary-600 ring-4 ring-primary-50" />
              <div>
                <p className="font-semibold text-slate-950">{event.label}</p>
                <p className="text-sm text-slate-500">{event.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-2xl border border-slate-200 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <div className="mt-2 text-sm font-semibold text-slate-950">{value}</div>
  </div>
);
