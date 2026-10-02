import type { ApplicationStatus } from '../types/application';

const statusStyles: Record<ApplicationStatus, string> = {
  Saved: 'bg-[#f8efe2] text-black',
  Applied: 'bg-[#f9d44a] text-black',
  OA: 'bg-[#5dd6e4] text-black',
  Interview: 'bg-[#f97316] text-white',
  Offer: 'bg-[#b7ef8c] text-black',
  Rejected: 'bg-[#fee2e2] text-[#991b1b]',
  Accepted: 'bg-black text-white'
};

export const StatusBadge = ({ status }: { status: ApplicationStatus }) => (
  <span className={'inline-flex items-center border-2 border-black px-2.5 py-1 text-[11px] font-black uppercase ' + statusStyles[status]}>
    {status}
  </span>
);
