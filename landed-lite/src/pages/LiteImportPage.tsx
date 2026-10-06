import { ArrowRight, Link2, LoaderCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { formatCompanyName } from '../lib/format';
import { liteStore } from '../lib/store';
import type { LiteApplicationInput, LiteStatus } from '../types/application';

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

type ImportedJob = {
  company: string;
  role: string;
  location: string;
  description: string;
};

export const LiteImportPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<LiteApplicationInput>(() => {
    const jobUrl = params.get('url') ?? '';
    return {
      company: formatCompanyName(params.get('company') ?? guessCompany(jobUrl)),
      role: params.get('role') ?? '',
      jobUrl,
      location: params.get('location') ?? '',
      description: params.get('description') ?? '',
      notes: '',
      status: 'Saved'
    };
  });
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const lastImportedUrl = useRef('');
  const set = <Key extends keyof LiteApplicationInput>(key: Key, value: LiteApplicationInput[Key]) => setForm((current) => ({ ...current, [key]: value }));
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
      if (data.description) setShowDescription(false);
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
    if (!form.jobUrl.trim() || !form.company.trim() || !form.role.trim()) { setError('Job URL, company, and role are required.'); return; }
    liteStore.create(form);
    navigate('/applications');
  };
  const highlights = form.description ? jobHighlights(form.description) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="border-[4px] border-black bg-white shadow-[7px_7px_0_#000]">
        <div className="border-b-[3px] border-black bg-[#5dd6e4] p-5 sm:p-6"><p className="flex items-center gap-2 text-xs font-black uppercase"><Link2 className="h-4 w-4" /> Import from URL</p><h1 className="mt-2 text-3xl font-black uppercase">Save a role in one pass.</h1><p className="mt-2 max-w-xl text-sm font-bold leading-6">Paste a supported job URL, then leave the field to fill the job details automatically. The extension can also pre-fill this page from an open job post.</p></div>
        <form className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6" onSubmit={submit}>
          <label className="text-xs font-black uppercase sm:col-span-2">Job URL<div className="mt-2 flex flex-col gap-3 sm:flex-row"><input className="input flex-1" placeholder="Paste a LinkedIn, Greenhouse, Lever, Workday, Ashby, or Naukri URL" type="url" value={form.jobUrl} onBlur={() => void importDetails()} onChange={(event) => { const jobUrl = event.target.value; lastImportedUrl.current = ''; set('jobUrl', jobUrl); if (!form.company) set('company', guessCompany(jobUrl)); }} /><button className="btn-secondary shrink-0" type="button" onClick={() => void importDetails()} disabled={importing}>{importing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}{importing ? 'Reading job' : 'Auto-fill'}</button></div></label>
          <label className="text-xs font-black uppercase">Company<input className="input mt-2" placeholder="e.g. Linear" value={form.company} onChange={(event) => set('company', event.target.value)} onBlur={(event) => set('company', formatCompanyName(event.target.value))} /></label>
          <label className="text-xs font-black uppercase">Role<input className="input mt-2" placeholder="e.g. Software Engineer" value={form.role} onChange={(event) => set('role', event.target.value)} /></label>
          <label className="text-xs font-black uppercase">Location<input className="input mt-2" placeholder="Remote, Mumbai, etc." value={form.location} onChange={(event) => set('location', event.target.value)} /></label>
          <label className="text-xs font-black uppercase">Status<select className="input mt-2" value={form.status} onChange={(event) => set('status', event.target.value as LiteStatus)}><option>Saved</option><option>Applied</option></select></label>
          {highlights ? <section className="border-[3px] border-black bg-[#fffaf1] p-4 sm:col-span-2"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><p className="text-xs font-black uppercase text-[#f97316]">Simple job view</p><h2 className="text-lg font-black uppercase">Job highlights</h2></div><button className="text-xs font-black uppercase underline decoration-2 underline-offset-4" type="button" onClick={() => setShowDescription((visible) => !visible)}>{showDescription ? 'Hide full description' : 'View full description'}</button></div><p className="mt-3 text-sm font-bold leading-6 text-[#444]">{highlights.summary || 'We saved the full job description below for ATS matching.'}</p><div className="mt-4 grid gap-4 md:grid-cols-2"><div><h3 className="text-xs font-black uppercase">What you will do</h3>{highlights.responsibilities.length ? <ul className="mt-2 space-y-2 pl-4 text-sm font-bold leading-5">{highlights.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm font-bold text-[#666]">Review the full description for responsibilities.</p>}</div><div><h3 className="text-xs font-black uppercase">What they are looking for</h3>{highlights.requirements.length ? <ul className="mt-2 space-y-2 pl-4 text-sm font-bold leading-5">{highlights.requirements.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm font-bold text-[#666]">Review the full description for requirements.</p>}</div></div>{highlights.skills.length ? <div className="mt-4"><h3 className="text-xs font-black uppercase">Detected skills</h3><div className="mt-2 flex flex-wrap gap-2">{highlights.skills.map((skill) => <span className="border-2 border-black bg-[#96d35f] px-2 py-1 text-xs font-black" key={skill}>{skill}</span>)}</div></div> : null}</section> : null}
          <section className="sm:col-span-2"><div className="flex items-center justify-between gap-3"><label className="text-xs font-black uppercase">Full job description</label><button className="text-xs font-black uppercase underline decoration-2 underline-offset-4" type="button" onClick={() => setShowDescription((visible) => !visible)}>{showDescription ? 'Hide description' : 'Add or edit description'}</button></div>{showDescription || !form.description ? <textarea className="input mt-2 min-h-36 resize-y" placeholder="Paste the job description for notes and ATS matching." value={form.description ?? ''} onChange={(event) => set('description', event.target.value)} /> : <p className="mt-2 text-sm font-bold text-[#666]">Full description is saved for ATS Match. Use “View full description” to edit it.</p>}</section>
          {error ? <p className="border-2 border-black bg-[#ffe5e5] p-3 text-sm font-bold text-[#a11] sm:col-span-2">{error}</p> : null}
          <div className="sm:col-span-2"><button className="btn-primary" type="submit">Save to Landed Lite <ArrowRight className="h-4 w-4" /></button></div>
        </form>
      </div>
      <p className="mt-6 border-l-4 border-[#f97316] pl-3 text-sm font-bold leading-6 text-[#555]">Lite does not scrape or send data to job boards. It saves the details you paste on this device only.</p>
    </div>
  );
};
