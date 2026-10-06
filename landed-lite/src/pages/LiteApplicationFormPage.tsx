import { ArrowLeft, Link2, LoaderCircle, Save } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { formatCompanyName } from '../lib/format';
import { liteStore } from '../lib/store';
import { LITE_STATUSES, type LiteApplicationInput, type LiteStatus } from '../types/application';

const emptyApplication: LiteApplicationInput = { company: '', role: '', jobUrl: '', location: '', description: '', status: 'Saved', notes: '' };

type ImportedJob = Pick<LiteApplicationInput, 'company' | 'role' | 'location' | 'description'>;

const guessCompany = (jobUrl: string) => {
  try {
    return new URL(jobUrl).hostname.replace(/^www\./, '').split('.')[0].replace(/[-_]/g, ' ');
  } catch {
    return '';
  }
};

const SKILLS = ['C++', 'C', 'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Linux', 'LLM', 'Machine Learning', 'Data Structures', 'Algorithms'];

const jobHighlights = (description: string) => {
  const compact = description.replace(/\s+/g, ' ').trim();
  const sentences = compact.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
  const responsibilities = sentences.filter((sentence) => /\b(work|build|develop|design|collaborate|responsible|write|test|own)\b/i.test(sentence)).slice(0, 3);
  const requirements = sentences.filter((sentence) => /\b(required|degree|experience|skill|proficien|understanding|knowledge|background)\b/i.test(sentence)).slice(0, 3);
  const skills = SKILLS.filter((skill) => new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(compact));
  return { summary: sentences.slice(0, 2).join(' '), responsibilities, requirements, skills };
};

export const LiteApplicationFormPage = () => {
  const { id } = useParams();
  const existing = id ? liteStore.get(id) : undefined;
  const [form, setForm] = useState<LiteApplicationInput>(existing ? {
    company: existing.company, role: existing.role, jobUrl: existing.jobUrl, location: existing.location, description: existing.description ?? '', status: existing.status, notes: existing.notes
  } : emptyApplication);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const lastImportedUrl = useRef('');
  const navigate = useNavigate();
  const update = <Key extends keyof LiteApplicationInput>(key: Key, value: LiteApplicationInput[Key]) => setForm((current) => ({ ...current, [key]: value }));
  const importDetails = async () => {
    const jobUrl = form.jobUrl.trim();
    if (!jobUrl || jobUrl === lastImportedUrl.current || importing) return;

    setError('');
    setImporting(true);
    try {
      const { data } = await apiClient.post<ImportedJob>('/lite/job-import', { url: jobUrl });
      lastImportedUrl.current = jobUrl;
      setForm((current) => ({
        ...current,
        company: formatCompanyName(data.company || current.company || guessCompany(jobUrl)),
        role: data.role || current.role,
        location: data.location || current.location,
        description: data.description || current.description
      }));
    } catch (importError) {
      const message = importError instanceof Error ? importError.message : 'Could not import this job URL.';
      setError(message === 'Could not reach the sign-in server. Please try again in a moment.'
        ? 'Could not reach the local Lite import service. Start Docker Desktop, then run docker compose up -d --build from the project folder.'
        : message);
    } finally {
      setImporting(false);
    }
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) { setError('Company and role are required.'); return; }
    if (id) liteStore.update(id, form); else liteStore.create(form);
    navigate('/applications');
  };
  const highlights = form.description ? jobHighlights(form.description) : null;

  if (id && !existing) return <div className="card p-8"><p className="text-xl font-black">Application not found.</p><Link className="btn-primary mt-5 no-underline" to="/applications">Back to applications</Link></div>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link className="inline-flex items-center gap-2 text-sm font-black text-black" to="/applications"><ArrowLeft className="h-4 w-4" /> Back to applications</Link>
      <form className="mt-5 border-[4px] border-black bg-white shadow-[7px_7px_0_#000]" onSubmit={submit}>
        <div className="border-b-[3px] border-black bg-[#f5ead8] p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#f97316]">Landed Lite</p><h1 className="mt-1 text-3xl font-black uppercase">{id ? 'Edit application' : 'Add a job'}</h1><p className="mt-2 text-sm font-bold text-[#666]">This is saved only in this browser.</p></div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <label className="text-xs font-black uppercase sm:col-span-2">Job URL<div className="mt-2 flex flex-col gap-3 sm:flex-row"><input className="input flex-1" value={form.jobUrl} onBlur={() => void importDetails()} onChange={(event) => { lastImportedUrl.current = ''; update('jobUrl', event.target.value); }} placeholder="Paste a supported job URL" type="url" /><button className="btn-secondary shrink-0" type="button" onClick={() => void importDetails()} disabled={importing}>{importing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}{importing ? 'Reading job' : 'Auto-fill'}</button></div><span className="mt-2 block normal-case text-xs font-bold text-[#666]">Paste a URL to fill company, role, location, and description automatically.</span></label>
          <label className="text-xs font-black uppercase">Company<input className="input mt-2" value={form.company} onChange={(event) => update('company', event.target.value)} onBlur={(event) => update('company', formatCompanyName(event.target.value))} placeholder="e.g. Figma" autoFocus /></label>
          <label className="text-xs font-black uppercase">Role<input className="input mt-2" value={form.role} onChange={(event) => update('role', event.target.value)} placeholder="e.g. Product Designer" /></label>
          <label className="text-xs font-black uppercase">Location<input className="input mt-2" value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Remote, Bengaluru, etc." /></label>
          <label className="text-xs font-black uppercase">Status<select className="input mt-2" value={form.status} onChange={(event) => update('status', event.target.value as LiteStatus)}>{LITE_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
          {highlights ? <section className="border-[3px] border-black bg-[#fffaf1] p-4 sm:col-span-2"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><p className="text-xs font-black uppercase text-[#f97316]">Simple job view</p><h2 className="text-lg font-black uppercase">Job highlights</h2></div><button className="text-xs font-black uppercase underline decoration-2 underline-offset-4" type="button" onClick={() => setShowDescription((visible) => !visible)}>{showDescription ? 'Hide full description' : 'View full description'}</button></div><p className="mt-3 text-sm font-bold leading-6 text-[#444]">{highlights.summary || 'The full job description is saved for ATS matching.'}</p><div className="mt-4 grid gap-4 md:grid-cols-2"><div><h3 className="text-xs font-black uppercase">What you will do</h3>{highlights.responsibilities.length ? <ul className="mt-2 space-y-2 pl-4 text-sm font-bold leading-5">{highlights.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm font-bold text-[#666]">Review the full description for responsibilities.</p>}</div><div><h3 className="text-xs font-black uppercase">What they are looking for</h3>{highlights.requirements.length ? <ul className="mt-2 space-y-2 pl-4 text-sm font-bold leading-5">{highlights.requirements.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm font-bold text-[#666]">Review the full description for requirements.</p>}</div></div>{highlights.skills.length ? <div className="mt-4"><h3 className="text-xs font-black uppercase">Detected skills</h3><div className="mt-2 flex flex-wrap gap-2">{highlights.skills.map((skill) => <span className="border-2 border-black bg-[#96d35f] px-2 py-1 text-xs font-black" key={skill}>{skill}</span>)}</div></div> : null}</section> : null}
          <section className="sm:col-span-2"><div className="flex items-center justify-between gap-3"><label className="text-xs font-black uppercase">Full job description</label>{highlights ? <button className="text-xs font-black uppercase underline decoration-2 underline-offset-4" type="button" onClick={() => setShowDescription((visible) => !visible)}>{showDescription ? 'Hide description' : 'Edit description'}</button> : null}</div>{showDescription || !form.description ? <textarea className="input mt-2 min-h-36 resize-y" value={form.description ?? ''} onChange={(event) => update('description', event.target.value)} placeholder="Paste the job description here to use Landed Lite ATS Match." /> : <p className="mt-2 text-sm font-bold text-[#666]">Full description is saved for ATS Match. Select “View full description” to edit it.</p>}</section>
          <label className="text-xs font-black uppercase sm:col-span-2">Notes<textarea className="input mt-2 min-h-32 resize-y" value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Add interview dates, contact names, reminders, or anything useful." /></label>
          {error ? <p className="border-2 border-black bg-[#ffe5e5] p-3 text-sm font-bold text-[#a11] sm:col-span-2">{error}</p> : null}
          <div className="flex flex-wrap gap-3 sm:col-span-2"><button className="btn-primary" type="submit"><Save className="h-4 w-4" /> {id ? 'Save changes' : 'Save application'}</button><Link className="btn-secondary no-underline" to="/applications">Cancel</Link></div>
        </div>
      </form>
    </div>
  );
};
