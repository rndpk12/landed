import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  helper?: string;
}

export const StatCard = ({ icon: Icon, value, label, helper }: StatCardProps) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-black uppercase tracking-wide text-[#555]">{label}</p>
        <p className="mt-2 text-3xl font-black tracking-tight text-black">{value}</p>
      </div>
      <div className="border-[3px] border-black bg-[#f9d44a] p-3 text-black">
        <Icon className="h-5 w-5" />
      </div>
    </div>
    {helper ? <p className="mt-4 text-xs font-bold text-[#555]">{helper}</p> : null}
  </div>
);
