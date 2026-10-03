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
      <div className="page-shell py-10">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_#000]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f97316]">Missing application</p>
          <h2 className="mt-2 text-2xl font-black uppercase text-black">Application not found</h2>
          <Link className="mt-6 inline-flex border-2 border-black bg-[#f97316] px-4 py-2 text-sm font-black uppercase text-white shadow-[3px_3px_0_#000]" to="/applications">← Back to applications</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8 py-8 sm:py-10">
      <Link className="inline-flex border-b-2 border-[#f97316] text-sm font-black uppercase text-black transition hover:-translate-x-0.5" to="/applications">← Back to applications</Link>
      <section className="border-4 border-black bg-white p-5 shadow-[9px_9px_0_#000] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f97316]">Application record</p>
            <h2 className="mt-2 break-words text-3xl font-black tracking-tight text-black sm:text-4xl">{application.company}</h2>
            <p className="mt-2 text-lg font-bold text-[#64748b]">{application.role}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Info label="Applied Date" value={application.appliedDate} />
          <Info label="Resume Used" value={application.resume} />
          <Info label="Status" value={application.status} />
          <Info label="Job URL" value={application.jobUrl ? <a className="inline-flex items-center gap-1 text-primary-600" href={application.jobUrl} target="_blank" rel="noreferrer">Open <ExternalLink className="h-3 w-3" /></a> : 'Not added'} />
        </div>
        <div className="mt-8 border-2 border-black bg-[#fffaf1] p-5">
          <p className="border-l-4 border-[#f97316] pl-3 text-xs font-black uppercase tracking-[0.15em] text-black">Notes</p>
          <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#475569]">{application.notes ?? 'No notes yet.'}</p>
        </div>
      </section>
      <section className="border-4 border-black bg-white p-5 shadow-[9px_9px_0_#000] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center border-2 border-black bg-[#f97316] text-lg font-black text-white">↗</span>
          <h3 className="text-xl font-black uppercase text-black">Timeline</h3>
        </div>
        <div className="mt-5 space-y-4">
          {application.timeline.map((event) => (
            <div key={event.id} className="flex gap-4 border-2 border-black bg-[#fffaf1] p-4">
              <div className="mt-1 h-4 w-4 shrink-0 border-2 border-black bg-[#5dd6e4]" />
              <div>
                <p className="font-black text-black">{event.label}</p>
                <p className="mt-1 text-sm font-semibold text-[#64748b]">{event.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="border-2 border-black bg-[#fffaf1] p-4">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">{label}</p>
    <div className="mt-2 text-sm font-black text-black">{value}</div>
  </div>
);
