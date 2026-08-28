import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
    <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-slate-500">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-base font-semibold text-slate-950">{title}</h3>
    <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);
