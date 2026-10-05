import { Check, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { liteStore } from '../lib/store';

const stopWords = new Set(['about', 'after', 'also', 'and', 'are', 'for', 'from', 'have', 'into', 'job', 'our', 'role', 'that', 'the', 'their', 'this', 'they', 'with', 'will', 'you', 'your']);
const tokens = (text: string) => [...new Set(text.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g)?.filter((word) => !stopWords.has(word)) ?? [])];

export const LiteAtsMatchPage = () => {
  const applications = liteStore.list();
  const [applicationId, setApplicationId] = useState(applications[0]?.id ?? '');
  const [resume, setResume] = useState('');
  const application = applications.find((item) => item.id === applicationId);
  const result = useMemo(() => {
    const jobWords = tokens(`${application?.role ?? ''} ${application?.description ?? ''}`);
    const resumeWords = new Set(tokens(resume));
    const matched = jobWords.filter((word) => resumeWords.has(word));
    return { jobWords, matched, missing: jobWords.filter((word) => !resumeWords.has(word)), score: jobWords.length ? Math.round((matched.length / jobWords.length) * 100) : 0 };
  }, [application, resume]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#f97316]">Landed Lite</p><h1 className="mt-1 flex items-center gap-3 text-4xl font-black uppercase"><Sparkles className="h-8 w-8 text-[#f97316]" /> ATS Match</h1><p className="mt-3 max-w-2xl font-bold leading-6 text-[#666]">A private keyword comparison for tailoring your resume. It is a guide, not an ATS guarantee—and nothing leaves your browser.</p></div>
      {applications.length === 0 ? <div className="card p-8"><p className="text-xl font-black">Add a role first.</p><p className="mt-2 font-bold text-[#666]">Paste a job description when importing a job, then return here to compare it with your resume text.</p></div> : <>
        <section className="border-[4px] border-black bg-white p-5 shadow-[6px_6px_0_#000] sm:p-6"><label className="text-xs font-black uppercase">Choose a saved application<select className="input mt-2" value={applicationId} onChange={(event) => setApplicationId(event.target.value)}>{applications.map((item) => <option key={item.id} value={item.id}>{item.company} — {item.role}</option>)}</select></label><label className="mt-5 block text-xs font-black uppercase">Paste your resume text<textarea className="input mt-2 min-h-52 resize-y" placeholder="Paste your resume content here. It is analyzed locally and disappears when you leave this page." value={resume} onChange={(event) => setResume(event.target.value)} /></label></section>
        {!application?.description ? <div className="border-[3px] border-black bg-[#f9d44a] p-5 font-bold">This application has no job description yet. Edit it and paste the role description to calculate a meaningful match.</div> : <section className="grid gap-5 md:grid-cols-[220px_1fr]"><div className="border-[4px] border-black bg-black p-6 text-white shadow-[6px_6px_0_#000]"><p className="text-xs font-black uppercase text-[#f9d44a]">Keyword match</p><p className="mt-3 text-7xl font-black">{resume.trim() ? result.score : '—'}<span className="text-2xl">{resume.trim() ? '%' : ''}</span></p><p className="mt-4 text-sm font-bold leading-6 text-[#c7c7c7]">{resume.trim() ? `${result.matched.length} of ${result.jobWords.length} job keywords appear in your pasted resume.` : 'Paste resume text to calculate a private keyword comparison.'}</p></div><div className="border-[4px] border-black bg-white p-6 shadow-[6px_6px_0_#000]"><h2 className="text-lg font-black uppercase">Strong matches</h2><div className="mt-4 flex flex-wrap gap-2">{result.matched.length ? result.matched.slice(0, 18).map((word) => <span className="flex items-center gap-1 border-2 border-black bg-[#96d35f] px-2 py-1 text-xs font-black" key={word}><Check className="h-3 w-3" />{word}</span>) : <p className="text-sm font-bold text-[#666]">Matches appear after you paste resume text.</p>}</div><h2 className="mt-7 text-lg font-black uppercase">Consider addressing</h2><p className="mt-2 text-xs font-bold text-[#666]">Only include skills you genuinely have.</p><div className="mt-4 flex flex-wrap gap-2">{result.missing.slice(0, 18).map((word) => <span className="border-2 border-black bg-[#f5ead8] px-2 py-1 text-xs font-black" key={word}>{word}</span>)}</div></div></section>}
      </>}
    </div>
  );
};
