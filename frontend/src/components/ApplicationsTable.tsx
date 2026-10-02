import { Link } from 'react-router-dom';
import { Edit3, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Application } from '../types/application';

interface ApplicationsTableProps {
  applications: Application[];
  onEdit?: (application: Application) => void;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
  compact?: boolean;
}

export const ApplicationsTable = ({ applications, onEdit, onDelete, deletingId, compact = false }: ApplicationsTableProps) => (
  <div className="overflow-hidden border-[3px] border-black bg-white shadow-[5px_5px_0_#000]">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y-[3px] divide-black">
        <thead className="bg-[#f8efe2]">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-black">Company</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-black">Role</th>
            {!compact ? <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-black">Resume</th> : null}
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-black">Status</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-black">Applied Date</th>
            {!compact ? <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wide text-black">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-black bg-white">
          {applications.map((application) => (
            <tr key={application.id} className="transition hover:bg-[#fff0df]">
              <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-black">{application.company}</td>
              <td className="min-w-48 px-4 py-4 text-sm font-bold text-[#555]">{application.role}</td>
              {!compact ? <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-[#555]">{application.resume}</td> : null}
              <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={application.status} /></td>
              <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-[#555]">{application.appliedDate}</td>
              {!compact ? (
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <Link className="border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase text-black transition hover:-translate-y-0.5 hover:bg-[#f9d44a]" to={'/applications/' + application.id}>View</Link>
                    <button className="border-2 border-black bg-white px-3 py-2 text-black transition hover:-translate-y-0.5 hover:bg-[#5dd6e4]" type="button" onClick={() => onEdit?.(application)} aria-label="Edit application"><Edit3 className="h-4 w-4" /></button>
                    <button className="border-2 border-black bg-white px-3 py-2 text-[#dc2626] transition hover:-translate-y-0.5 hover:bg-[#fee2e2] disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={deletingId === application.id} onClick={() => onDelete?.(application.id)} aria-label="Delete application"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
