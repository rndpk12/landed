import type { ApplicationStatus } from '../types/application';

const statusStyles: Record<ApplicationStatus, string> = {
  Saved: 'bg-slate-100 text-slate-700 ring-slate-200',
  Applied: 'bg-blue-50 text-blue-700 ring-blue-200',
  OA: 'bg-violet-50 text-violet-700 ring-violet-200',
  Interview: 'bg-amber-50 text-amber-700 ring-amber-200',
  Offer: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  Accepted: 'bg-green-50 text-green-700 ring-green-200'
};

export const StatusBadge = ({ status }: { status: ApplicationStatus }) => (
  <span className={'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ' + statusStyles[status]}>
    {status}
  </span>
);
