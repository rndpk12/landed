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
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Company</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
            {!compact ? <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Resume</th> : null}
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Applied Date</th>
            {!compact ? <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {applications.map((application) => (
            <tr key={application.id} className="hover:bg-slate-50/70">
              <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">{application.company}</td>
              <td className="min-w-48 px-4 py-4 text-sm text-slate-600">{application.role}</td>
              {!compact ? <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{application.resume}</td> : null}
              <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={application.status} /></td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{application.appliedDate}</td>
              {!compact ? (
                <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <Link className="btn-secondary px-3 py-2" to={'/applications/' + application.id}>View</Link>
                    <button className="btn-secondary px-3 py-2" type="button" onClick={() => onEdit?.(application)} aria-label="Edit application"><Edit3 className="h-4 w-4" /></button>
                    <button className="btn-secondary px-3 py-2 text-rose-600" type="button" disabled={deletingId === application.id} onClick={() => onDelete?.(application.id)} aria-label="Delete application"><Trash2 className="h-4 w-4" /></button>
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
