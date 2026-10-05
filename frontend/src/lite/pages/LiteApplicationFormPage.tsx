import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { liteStore } from '../lib/store';
import { LITE_STATUSES, type LiteApplicationInput, type LiteStatus } from '../types/application';

const emptyApplication: LiteApplicationInput = { company: '', role: '', jobUrl: '', location: '', description: '', status: 'Saved', notes: '' };

export const LiteApplicationFormPage = () => {
  const { id } = useParams();
  const existing = id ? liteStore.get(id) : undefined;
  const [form, setForm] = useState<LiteApplicationInput>(existing ? {
    company: existing.company, role: existing.role, jobUrl: existing.jobUrl, location: existing.location, description: existing.description ?? '', status: existing.status, notes: existing.notes
  } : emptyApplication);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const update = <Key extends keyof LiteApplicationInput>(key: Key, value: LiteApplicationInput[Key]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) { setError('Company and role are required.'); return; }
    if (id) liteStore.update(id, form); else liteStore.create(form);
    navigate('/lite/applications');
  };

  if (id && !existing) return <div className="card p-8"><p className="text-xl font-black">Application not found.</p><Link className="btn-primary mt-5 no-underline" to="/lite/applications">Back to applications</Link></div>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link className="inline-flex items-center gap-2 text-sm font-black text-black" to="/lite/applications"><ArrowLeft className="h-4 w-4" /> Back to applications</Link>
      <form className="mt-5 border-[4px] border-black bg-white shadow-[7px_7px_0_#000]" onSubmit={submit}>
        <div className="border-b-[3px] border-black bg-[#f5ead8] p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#f97316]">Landed Lite</p><h1 className="mt-1 text-3xl font-black uppercase">{id ? 'Edit application' : 'Add a job'}</h1><p className="mt-2 text-sm font-bold text-[#666]">This is saved only in this browser.</p></div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <label className="text-xs font-black uppercase">Company<input className="input mt-2" value={form.company} onChange={(event) => update('company', event.target.value)} placeholder="e.g. Figma" autoFocus /></label>
          <label className="text-xs font-black uppercase">Role<input className="input mt-2" value={form.role} onChange={(event) => update('role', event.target.value)} placeholder="e.g. Product Designer" /></label>
          <label className="text-xs font-black uppercase">Location<input className="input mt-2" value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Remote, Bengaluru, etc." /></label>
          <label className="text-xs font-black uppercase">Status<select className="input mt-2" value={form.status} onChange={(event) => update('status', event.target.value as LiteStatus)}>{LITE_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label className="text-xs font-black uppercase sm:col-span-2">Job link<input className="input mt-2" value={form.jobUrl} onChange={(event) => update('jobUrl', event.target.value)} placeholder="https://company.com/jobs/..." type="url" /></label>
          <label className="text-xs font-black uppercase sm:col-span-2">Job description<textarea className="input mt-2 min-h-36 resize-y" value={form.description ?? ''} onChange={(event) => update('description', event.target.value)} placeholder="Paste the job description here to use Landed Lite ATS Match." /></label>
          <label className="text-xs font-black uppercase sm:col-span-2">Notes<textarea className="input mt-2 min-h-32 resize-y" value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Add interview dates, contact names, reminders, or anything useful." /></label>
          {error ? <p className="border-2 border-black bg-[#ffe5e5] p-3 text-sm font-bold text-[#a11] sm:col-span-2">{error}</p> : null}
          <div className="flex flex-wrap gap-3 sm:col-span-2"><button className="btn-primary" type="submit"><Save className="h-4 w-4" /> {id ? 'Save changes' : 'Save application'}</button><Link className="btn-secondary no-underline" to="/lite/applications">Cancel</Link></div>
        </div>
      </form>
    </div>
  );
};
