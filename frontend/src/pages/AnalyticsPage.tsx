import { useQuery } from '@tanstack/react-query';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart, CartesianGrid } from 'recharts';
import type { ReactNode } from 'react';
import { BarChart3, BriefcaseBusiness, Search, Target, Trophy, XCircle } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatCard } from '../components/StatCard';
import { applicationApi } from '../services/applicationApi';
import { resumePerformanceApi } from '../services/resumePerformanceApi';
import type { Application, ApplicationStatus } from '../types/application';
import type { ResumePerformance } from '../types/resumePerformance';

const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Accepted'];
const funnelStatuses: ApplicationStatus[] = ['Applied', 'OA', 'Interview', 'Offer'];
const colors = ['#94a3b8', '#2563EB', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#22c55e'];

export const AnalyticsPage = () => {
  const applicationsQuery = useQuery({ queryKey: ['applications'], queryFn: applicationApi.list });
  const resumePerformanceQuery = useQuery({
    queryKey: ['resume-performance'],
    queryFn: resumePerformanceApi.list
  });

  if (applicationsQuery.isLoading || resumePerformanceQuery.isLoading) {
    return <LoadingSpinner label="Loading analytics" />;
  }

  if (applicationsQuery.isError || resumePerformanceQuery.isError) {
    const error = applicationsQuery.error ?? resumePerformanceQuery.error;
    return (
      <div className="page-shell">
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-950">Could not load analytics</h2>
          <p className="mt-2 text-sm text-slate-500">{error?.message ?? 'Please try again.'}</p>
          <button
            className="btn-primary mt-5"
            type="button"
            onClick={() => {
              void applicationsQuery.refetch();
              void resumePerformanceQuery.refetch();
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const applications = applicationsQuery.data ?? [];
  const resumePerformance = [...(resumePerformanceQuery.data ?? [])].sort(
    (a, b) =>
      b.conversionRate - a.conversionRate ||
      b.applications - a.applications ||
      b.interviews - a.interviews ||
      a.resumeName.localeCompare(b.resumeName)
  );
  const totalApplications = applications.length;
  const interviews = countByStatus(applications, 'Interview');
  const offers = countByStatus(applications, 'Offer') + countByStatus(applications, 'Accepted');
  const rejections = countByStatus(applications, 'Rejected');
  const responseRate = totalApplications ? Math.round(((interviews + offers) / totalApplications) * 100) : 0;
  const statusDistribution = statuses.map((status) => ({ name: status, value: countByStatus(applications, status) })).filter((item) => item.value > 0);
  const applicationsByMonth = buildMonthlyApplications(applications);
  const interviewFunnel = funnelStatuses.map((status) => ({ name: status, value: countByStatus(applications, status) }));
  const applicationTrend = buildMonthlyApplications(applications).map((item) => ({ month: item.month, applications: item.applications }));

  return (
    <div className="page-shell">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Analytics</h2>
        <p className="mt-1 text-sm text-slate-500">A crisp view of pipeline health and conversion.</p>
      </div>
      {!applications.length ? (
        <EmptyState icon={Search} title="No analytics yet" description="Add applications to unlock status distribution, funnel, and trend insights." />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard icon={BriefcaseBusiness} value={totalApplications} label="Total Applications" helper="Across all resume variants" />
            <StatCard icon={Target} value={interviews} label="Interviews" helper="Current interview-stage roles" />
            <StatCard icon={Trophy} value={offers} label="Offers" helper="Offer + accepted roles" />
            <StatCard icon={XCircle} value={rejections} label="Rejections" helper="Closed rejected roles" />
            <StatCard icon={BarChart3} value={responseRate + '%'} label="Response Rate" helper="Interviews + offers / applications" />
          </section>
          <section className="grid gap-6 xl:grid-cols-2">
            <ResumePerformanceSection performance={resumePerformance} />
            <ChartCard title="Application Status Distribution" subtitle="Where every opportunity currently sits.">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98} paddingAngle={3}>
                    {statusDistribution.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Applications by Month" subtitle="Application volume over the last 6 months.">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={applicationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Interview Funnel" subtitle="Progression from applied to offer.">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={interviewFunnel}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Application Trend" subtitle="Last 6 months of application activity.">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={applicationTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="applications" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>
        </>
      )}
    </div>
  );
};

const ChartCard = ({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) => (
  <div className="card p-5">
    <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
    <p className="mb-4 text-sm text-slate-500">{subtitle}</p>
    {children}
  </div>
);

const ResumePerformanceSection = ({ performance }: { performance: ResumePerformance[] }) => (
  <section className="xl:col-span-2">
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
              <Trophy className="h-5 w-5 text-amber-500" />
              Best Performing Resume
            </h3>
            <p className="text-sm text-slate-500">Ranked by interview conversion across linked applications.</p>
          </div>
          {performance[0] ? (
            <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
              Top: {performance[0].resumeName}
            </div>
          ) : null}
        </div>
      </div>

      {!performance.length ? (
        <div className="p-6">
          <EmptyState
            icon={Trophy}
            title="No resume performance yet"
            description="Link applications to resume versions to see conversion analytics."
          />
        </div>
      ) : (
        <div className="grid gap-0 xl:grid-cols-[1.2fr_1fr]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Resume Name</th>
                  <th className="px-5 py-3 font-semibold">Applications</th>
                  <th className="px-5 py-3 font-semibold">Interviews</th>
                  <th className="px-5 py-3 font-semibold">Offers</th>
                  <th className="px-5 py-3 font-semibold">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {performance.map((resume) => (
                  <tr className="hover:bg-slate-50" key={resume.resumeId}>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950">
                      {resume.resumeName}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{resume.applications}</td>
                    <td className="px-5 py-4 text-slate-600">{resume.interviews}</td>
                    <td className="px-5 py-4 text-slate-600">{resume.offers}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                        {resume.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 p-5 xl:border-l xl:border-t-0">
            <h4 className="text-sm font-semibold text-slate-950">Resume Conversion Comparison</h4>
            <p className="mb-4 text-sm text-slate-500">Interview conversion rate by resume.</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance} layout="vertical" margin={{ top: 4, right: 18, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="resumeName" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                <Bar dataKey="conversionRate" fill="#2563EB" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  </section>
);

const countByStatus = (applications: Application[], status: ApplicationStatus) => applications.filter((application) => application.status === status).length;

const buildMonthlyApplications = (applications: Application[]) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0'),
      month: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date),
      applications: 0
    };
  });

  applications.forEach((application) => {
    const sourceDate = application.appliedDate || application.createdAt;
    if (!sourceDate) {
      return;
    }

    const date = new Date(sourceDate);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    const bucket = months.find((month) => month.key === key);
    if (bucket) {
      bucket.applications += 1;
    }
  });

  return months.map((month) => ({ month: month.month, applications: month.applications }));
};
