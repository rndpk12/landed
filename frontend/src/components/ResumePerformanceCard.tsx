import type { Resume } from '../types/resume';

export const ResumePerformanceCard = ({ resumes }: { resumes: Resume[] }) => (
  <div className="card p-5">
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-slate-950">Resume Performance</h2>
      <p className="text-sm text-slate-500">Conversion by resume variant.</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {resumes.map((resume) => (
        <div key={resume.id} className="rounded-2xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-950">{resume.name + ' ' + resume.version}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-lg font-bold text-slate-950">{resume.applications}</p>
              <p className="text-xs text-slate-500">Applications</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-950">{resume.interviews}</p>
              <p className="text-xs text-slate-500">Interviews</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary-600">{resume.conversionRate}%</p>
              <p className="text-xs text-slate-500">Conversion</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
