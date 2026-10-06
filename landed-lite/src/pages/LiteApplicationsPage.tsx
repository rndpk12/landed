import { Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LiteStatusBadge } from '../components/LiteStatusBadge';
import { liteStore } from '../lib/store';
import { resumeStore } from '../lib/resumeStore';
import { LITE_STATUSES, type LiteStatus } from '../types/application';

export const LiteApplicationsPage = () => {
  const [applications, setApplications] = useState(() => liteStore.list());
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<LiteStatus | 'All'>('All');
  const [resumeNames, setResumeNames] = useState<Record<string, string>>({});
  useEffect(() => { void resumeStore.list().then((resumes) => setResumeNames(Object.fromEntries(resumes.map((resume) => [resume.id, resume.name])))); }, []);
  const visible = useMemo(() => applications.filter((item) => (status === 'All' || item.status === status) && `${item.company} ${item.role} ${item.location}`.toLowerCase().includes(query.toLowerCase())), [applications, query, status]);
  const remove = (id: string) => {
    if (window.confirm('Remove this application from Landed Lite?')) { liteStore.remove(id); setApplications(liteStore.list()); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#f97316]">Landed Lite</p><h1 className="mt-1 text-4xl font-black uppercase">Applications</h1></div><Link className="btn-primary no-underline" to="/applications/new"><Plus className="h-4 w-4" /> Add job</Link></div>
      <div className="border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_#000]">
        <div className="flex flex-col gap-3 md:flex-row"><label className="input flex items-center gap-2 py-0"><Search className="h-4 w-4 text-[#666]" /><input className="w-full border-0 bg-transparent py-2.5 outline-none" placeholder="Search company, role, or location" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select className="input md:w-44" value={status} onChange={(event) => setStatus(event.target.value as LiteStatus | 'All')}><option>All</option>{LITE_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></div>
      </div>
      <div className="border-[4px] border-black bg-white shadow-[7px_7px_0_#000]">
        {visible.length === 0 ? <div className="p-10 text-center font-bold text-[#666]">No applications match this view.</div> : visible.map((application) => (
          <div className="flex flex-col gap-4 border-b-[3px] border-black p-4 last:border-b-0 sm:flex-row sm:items-center" key={application.id}>
            <span className="grid h-11 w-11 shrink-0 place-items-center border-2 border-black bg-black text-lg font-black text-white">{application.company[0]?.toUpperCase()}</span>
            <Link className="min-w-0 flex-1 text-black no-underline" to={`/applications/${application.id}/edit`}><p className="truncate text-lg font-black">{application.role}</p><p className="truncate text-sm font-bold text-[#666]">{application.company}{application.location ? ` · ${application.location}` : ''}</p>{application.resumeId ? <p className="mt-1 truncate text-xs font-black text-[#f97316]">Resume: {resumeNames[application.resumeId] ?? 'Removed from vault'}</p> : null}</Link>
            <div className="flex items-center justify-between gap-3 sm:justify-end"><LiteStatusBadge status={application.status} /><button aria-label={`Delete ${application.role}`} className="grid h-9 w-9 place-items-center border-2 border-black bg-white text-[#d33] hover:bg-[#ffe5e5]" type="button" onClick={() => remove(application.id)}><Trash2 className="h-4 w-4" /></button></div>
          </div>
        ))}
      </div>
    </div>
  );
};
