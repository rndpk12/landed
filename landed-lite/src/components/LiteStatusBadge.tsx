import type { LiteStatus } from '../types/application';

const colors: Record<LiteStatus, string> = {
  Saved: 'bg-[#f9d44a]',
  Applied: 'bg-[#5dd6e4]',
  Interview: 'bg-[#96d35f]',
  Offer: 'bg-[#f97316] text-white',
  Rejected: 'bg-[#dedede]'
};

export const LiteStatusBadge = ({ status }: { status: LiteStatus }) => (
  <span className={`inline-flex border-2 border-black px-2 py-1 text-[10px] font-black uppercase ${colors[status]}`}>{status}</span>
);
