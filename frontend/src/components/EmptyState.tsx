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
    <div className="mb-4 border-[3px] border-black bg-[#f9d44a] p-4 text-black shadow-[3px_3px_0_#000]">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-base font-black uppercase text-black">{title}</h3>
    <p className="mt-2 max-w-sm text-sm font-bold text-[#555]">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);
