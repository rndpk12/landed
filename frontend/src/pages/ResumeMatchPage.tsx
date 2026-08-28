import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, FileSearch, Lightbulb, Search, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { resumeApi } from '../services/resumeApi';
import { resumeMatchApi } from '../services/resumeMatchApi';

export const ResumeMatchPage = () => {
  const resumesQuery = useQuery({ queryKey: ['resumes'], queryFn: resumeApi.list });
  const analyzeMutation = useMutation({ mutationFn: resumeMatchApi.analyze });
  const [resumeId, setResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const resumes = useMemo(() => resumesQuery.data ?? [], [resumesQuery.data]);
  const selectedResumeId = resumeId || resumes[0]?.id || '';
  const selectedResume = useMemo(() => resumes.find((resume) => resume.id === selectedResumeId), [resumes, selectedResumeId]);
  const canAnalyze = Boolean(selectedResumeId && jobDescription.trim().length >= 20 && !analyzeMutation.isPending);

  const onAnalyze = () => {
    if (!canAnalyze) {
      return;
    }

    analyzeMutation.mutate({ resumeId: selectedResumeId, jobDescription });
  };

  if (resumesQuery.isLoading) {
    return <LoadingSpinner label="Loading resumes" />;
  }

  if (resumesQuery.isError) {
    return (
      <div className="page-shell">
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-950">Could not load resumes</h2>
          <p className="mt-2 text-sm text-slate-500">{resumesQuery.error.message}</p>
          <button className="btn-primary mt-5" type="button" onClick={() => resumesQuery.refetch()}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-600">Resume intelligence</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Resume Match Engine</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Compare an uploaded resume against a job description using local keyword, TF-IDF, and similarity analysis.</p>
        </div>
      </div>

      {!resumes.length ? (
        <EmptyState icon={FileSearch} title="Upload a resume first" description="Add a resume to your vault before running a match analysis." />
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="card p-5">
            <h3 className="text-lg font-semibold text-slate-950">Analyze a job description</h3>
            <p className="mt-1 text-sm text-slate-500">Choose a resume, paste the full JD, and let the local match engine do its quiet little spreadsheet sorcery.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Resume</label>
                <select className="input mt-2" value={selectedResumeId} onChange={(event) => setResumeId(event.target.value)}>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>{resume.name} · {resume.version} · {resume.roleTag}</option>
                  ))}
                </select>
                {selectedResume ? <p className="mt-2 text-xs text-slate-500">Latest upload: {selectedResume.uploadDate} · {selectedResume.versions.length} version{selectedResume.versions.length === 1 ? '' : 's'}</p> : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Job Description</label>
                <textarea
                  className="input mt-2 min-h-80 resize-y leading-6"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                />
                <p className="mt-2 text-xs text-slate-500">{jobDescription.trim().length} characters</p>
              </div>

              {analyzeMutation.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {analyzeMutation.error.message}
                </div>
              ) : null}

              <button className="btn-primary w-full" type="button" disabled={!canAnalyze} onClick={onAnalyze}>
                {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Match'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {analyzeMutation.isPending ? <LoadingSpinner label="Analyzing resume match" /> : null}
            {analyzeMutation.data ? <ResultsPanel result={analyzeMutation.data} /> : null}
            {!analyzeMutation.isPending && !analyzeMutation.data ? (
              <EmptyState icon={Search} title="Ready to analyze" description="Your match score, keywords, and ATS suggestions will appear here after analysis." />
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
};

const ResultsPanel = ({ result }: { result: { matchScore: number; matchedKeywords: string[]; missingKeywords: string[]; suggestions: string[] } }) => (
  <div className="space-y-6">
    <section className="card p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ProgressRing score={result.matchScore} />
        <div>
          <p className="text-sm font-semibold text-primary-600">Match Score</p>
          <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{result.matchScore}%</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">A blended local score based on TF-IDF cosine similarity, keyword frequency, and job-description keyword coverage.</p>
        </div>
      </div>
    </section>

    <section className="grid gap-6 lg:grid-cols-2">
      <KeywordCard icon={CheckCircle2} title="Matched Keywords" tone="emerald" keywords={result.matchedKeywords} empty="No strong keyword matches yet." />
      <KeywordCard icon={XCircle} title="Missing Keywords" tone="rose" keywords={result.missingKeywords} empty="No major missing keywords found." />
    </section>

    <section className="card p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary-50 p-3 text-primary-600"><Lightbulb className="h-5 w-5" /></div>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">ATS Suggestions</h3>
          <p className="text-sm text-slate-500">Concrete edits to improve alignment.</p>
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {result.suggestions.map((suggestion) => (
          <li key={suggestion} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{suggestion}</li>
        ))}
      </ul>
    </section>
  </div>
);

const ProgressRing = ({ score }: { score: number }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 144 144" aria-hidden="true">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-950">{score}%</div>
    </div>
  );
};

const KeywordCard = ({ icon: Icon, title, tone, keywords, empty }: { icon: typeof CheckCircle2; title: string; tone: 'emerald' | 'rose'; keywords: string[]; empty: string }) => {
  const toneClass = tone === 'emerald' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200';

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={'rounded-xl p-3 ring-1 ' + toneClass}><Icon className="h-5 w-5" /></div>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {keywords.length ? keywords.map((keyword) => (
          <span key={keyword} className={'rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ' + toneClass}>{formatKeyword(keyword)}</span>
        )) : <p className="text-sm text-slate-500">{empty}</p>}
      </div>
    </div>
  );
};

const formatKeyword = (keyword: string) => keyword.split(/[\s-]+/).map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(' ');
