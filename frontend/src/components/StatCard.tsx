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
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      </div>
      <div className="rounded-xl bg-primary-50 p-3 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
    </div>
    {helper ? <p className="mt-4 text-xs font-medium text-slate-500">{helper}</p> : null}
  </div>
);
