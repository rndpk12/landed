import { FileText, FolderOpen, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { liteStore } from '../lib/store';
import { resumeStore } from '../lib/resumeStore';
import type { LiteResume } from '../types/resume';

const formatSize = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const LiteResumeVaultPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [resumes, setResumes] = useState<LiteResume[]>([]);
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const refresh = async () => { setResumes(await resumeStore.list()); setLoading(false); };

  useEffect(() => { void refresh(); }, []);

  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setMessage('Choose a resume smaller than 10 MB.'); return; }
    try {
      await resumeStore.add(file, label);
      setLabel('');
      if (inputRef.current) inputRef.current.value = '';
      await refresh();
      setMessage('Resume added to this browser’s vault.');
    } catch {
      setMessage('Could not save that resume in this browser.');
    }
  };

  const remove = async (resume: LiteResume) => {
    if (!window.confirm(`Remove “${resume.name}” from the local resume vault? Applications that used it will keep their history, but the file record will be unavailable.`)) return;
    await resumeStore.remove(resume.id);
    await refresh();
    setMessage('Resume removed from the local vault.');
  };

  const usage = (resumeId: string) => liteStore.list().filter((application) => application.resumeId === resumeId).length;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#f97316]">Landed Lite</p><h1 className="mt-1 flex items-center gap-3 text-4xl font-black uppercase"><FolderOpen className="h-8 w-8 text-[#f97316]" /> Resume vault</h1><p className="mt-3 max-w-2xl font-bold leading-6 text-[#666]">Keep named resume versions in this browser, then attach the exact version used to every job application.</p></div>
      <section className="border-[4px] border-black bg-white p-5 shadow-[6px_6px_0_#000] sm:p-6"><div className="grid gap-4 sm:grid-cols-[1fr_auto]"><label className="text-xs font-black uppercase">Resume label<input className="input mt-2" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. Backend resume — October" /></label><div className="self-end"><button className="btn-primary w-full" type="button" onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4" /> Add resume</button><input accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" ref={inputRef} type="file" onChange={(event) => void upload(event.target.files?.[0])} /></div></div><p className="mt-3 text-xs font-bold text-[#666]">PDF, DOC, or DOCX · up to 10 MB · saved only in this browser.</p></section>
      <section className="border-[4px] border-black bg-white shadow-[6px_6px_0_#000]">{loading ? <div className="flex items-center gap-2 p-6 font-bold"><LoaderCircle className="h-5 w-5 animate-spin" /> Opening your vault…</div> : resumes.length === 0 ? <div className="p-8 text-center"><FileText className="mx-auto h-9 w-9" /><p className="mt-3 text-xl font-black">No resume versions yet.</p><p className="mt-2 font-bold text-[#666]">Add a resume, then select it when saving a job.</p></div> : resumes.map((resume) => <div className="flex flex-col gap-4 border-b-[3px] border-black p-4 last:border-b-0 sm:flex-row sm:items-center" key={resume.id}><span className="grid h-11 w-11 place-items-center border-2 border-black bg-[#5dd6e4]"><FileText className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="truncate text-lg font-black">{resume.name}</p><p className="truncate text-sm font-bold text-[#666]">{resume.fileName} · {formatSize(resume.fileSize)} · Used for {usage(resume.id)} application{usage(resume.id) === 1 ? '' : 's'}</p></div><button aria-label={`Remove ${resume.name}`} className="btn-secondary border-[#b42318] text-[#b42318] hover:bg-[#ffe5e5]" type="button" onClick={() => void remove(resume)}><Trash2 className="h-4 w-4" /> Remove</button></div>)}</section>
      {message ? <p className="border-[3px] border-black bg-[#96d35f] p-4 text-sm font-black">{message}</p> : null}
    </div>
  );
};
