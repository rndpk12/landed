import { ArrowRight, BriefcaseBusiness, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LiteStatusBadge } from '../components/LiteStatusBadge';
import { liteStore } from '../lib/store';
import { LITE_STATUSES } from '../types/application';

export const LiteDashboardPage = () => {
  const applications = liteStore.list();
  const counts = Object.fromEntries(LITE_STATUSES.map((status) => [status, applications.filter((item) => item.status === status).length]));

  return (
    <div className="space-y-6">
      <section className="border-[4px] border-black bg-white p-6 shadow-[7px_7px_0_#000] sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f97316]">Landed Lite</p>
        <div className="mt-2 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><h1 className="text-4xl font-black uppercase leading-none sm:text-5xl">Your job search, simplified.</h1><p className="mt-3 max-w-xl font-bold leading-6 text-[#666]">No account. No cloud sync. Just a clear view of your next move.</p></div>
          <Link className="btn-primary shrink-0 no-underline" to="/lite/applications/new"><Plus className="h-4 w-4" /> Add job</Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {LITE_STATUSES.map((status) => (
          <div className="border-[3px] border-black bg-white p-4 shadow-[3px_3px_0_#000]" key={status}>
            <p className="text-[11px] font-black uppercase text-[#666]">{status}</p>
            <p className="mt-1 text-4xl font-black">{counts[status]}</p>
          </div>
        ))}
      </section>

      <section className="border-[4px] border-black bg-white shadow-[7px_7px_0_#000]">
        <div className="flex items-center justify-between gap-4 border-b-[3px] border-black bg-[#f5ead8] p-4">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase"><BriefcaseBusiness className="h-5 w-5 text-[#f97316]" /> Recent applications</h2>
          <Link className="text-xs font-black uppercase text-black underline decoration-2 underline-offset-4" to="/lite/applications">See all</Link>
        </div>
        {applications.length === 0 ? (
          <div className="p-8 text-center"><p className="text-xl font-black">Your board is empty.</p><p className="mt-2 font-bold text-[#666]">Add your first role to begin tracking.</p><Link className="btn-primary mt-5 no-underline" to="/lite/applications/new">Add your first job <ArrowRight className="h-4 w-4" /></Link></div>
        ) : (
          <div className="divide-y-[3px] divide-black">
            {applications.slice(0, 5).map((application) => (
              <Link className="flex items-center gap-4 p-4 text-black no-underline transition hover:bg-[#fff4e4]" key={application.id} to={`/lite/applications/${application.id}/edit`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-black bg-black text-sm font-black text-white">{application.company[0]?.toUpperCase()}</span>
                <div className="min-w-0 flex-1"><p className="truncate font-black">{application.role}</p><p className="truncate text-sm font-bold text-[#666]">{application.company}{application.location ? ` · ${application.location}` : ''}</p></div>
                <LiteStatusBadge status={application.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
