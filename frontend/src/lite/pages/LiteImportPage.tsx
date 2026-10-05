import { ArrowRight, Link2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { liteStore } from '../lib/store';
import type { LiteApplicationInput, LiteStatus } from '../types/application';

const guessCompany = (jobUrl: string) => {
  try {
    return new URL(jobUrl).hostname.replace(/^www\./, '').split('.')[0].replace(/[-_]/g, ' ');
  } catch {
    return '';
  }
};

export const LiteImportPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<LiteApplicationInput>(() => {
    const jobUrl = params.get('url') ?? '';
    return {
      company: params.get('company') ?? guessCompany(jobUrl),
      role: params.get('role') ?? '',
      jobUrl,
      location: params.get('location') ?? '',
      description: params.get('description') ?? '',
      notes: '',
      status: 'Saved'
    };
  });
  const [error, setError] = useState('');
  const set = <Key extends keyof LiteApplicationInput>(key: Key, value: LiteApplicationInput[Key]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.jobUrl.trim() || !form.company.trim() || !form.role.trim()) { setError('Job URL, company, and role are required.'); return; }
    liteStore.create(form);
    navigate('/lite/applications');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="border-[4px] border-black bg-white shadow-[7px_7px_0_#000]">
        <div className="border-b-[3px] border-black bg-[#5dd6e4] p-5 sm:p-6"><p className="flex items-center gap-2 text-xs font-black uppercase"><Link2 className="h-4 w-4" /> Import from URL</p><h1 className="mt-2 text-3xl font-black uppercase">Save a role in one pass.</h1><p className="mt-2 max-w-xl text-sm font-bold leading-6">Paste a job URL and the important details. Later, the Landed Lite extension can open this page with these fields pre-filled.</p></div>
        <form className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6" onSubmit={submit}>
          <label className="text-xs font-black uppercase sm:col-span-2">Job URL<input className="input mt-2" placeholder="https://jobs.example.com/role" type="url" value={form.jobUrl} onChange={(event) => { const jobUrl = event.target.value; set('jobUrl', jobUrl); if (!form.company) set('company', guessCompany(jobUrl)); }} /></label>
          <label className="text-xs font-black uppercase">Company<input className="input mt-2 capitalize" placeholder="e.g. Linear" value={form.company} onChange={(event) => set('company', event.target.value)} /></label>
          <label className="text-xs font-black uppercase">Role<input className="input mt-2" placeholder="e.g. Software Engineer" value={form.role} onChange={(event) => set('role', event.target.value)} /></label>
          <label className="text-xs font-black uppercase">Location<input className="input mt-2" placeholder="Remote, Mumbai, etc." value={form.location} onChange={(event) => set('location', event.target.value)} /></label>
          <label className="text-xs font-black uppercase">Status<select className="input mt-2" value={form.status} onChange={(event) => set('status', event.target.value as LiteStatus)}><option>Saved</option><option>Applied</option></select></label>
          <label className="text-xs font-black uppercase sm:col-span-2">Job description<textarea className="input mt-2 min-h-44 resize-y" placeholder="Paste the job description for notes and ATS matching." value={form.description ?? ''} onChange={(event) => set('description', event.target.value)} /></label>
          {error ? <p className="border-2 border-black bg-[#ffe5e5] p-3 text-sm font-bold text-[#a11] sm:col-span-2">{error}</p> : null}
          <div className="sm:col-span-2"><button className="btn-primary" type="submit">Save to Landed Lite <ArrowRight className="h-4 w-4" /></button></div>
        </form>
      </div>
      <p className="mt-6 border-l-4 border-[#f97316] pl-3 text-sm font-bold leading-6 text-[#555]">Lite does not scrape or send data to job boards. It saves the details you paste on this device only.</p>
    </div>
  );
};
