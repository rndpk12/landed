import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ListTodo,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Sparkles,
  Target,
  TimerReset,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useActivitiesQuery } from '../hooks/useActivitiesQuery';
import { useAuth } from '../hooks/useAuth';
import { applicationApi } from '../services/applicationApi';
import { resumeApi } from '../services/resumeApi';
import type { ApplicationStatus } from '../types/application';

const statusStyles: Record<ApplicationStatus, string> = {
  Saved: 'bg-[#ece8df] text-black',
  Applied: 'bg-[#5dd6e4] text-black',
  OA: 'bg-[#f9d44a] text-black',
  Interview: 'bg-[#96d35f] text-black',
  Offer: 'bg-[#a78bfa] text-black',
  Rejected: 'bg-[#fee2e2] text-[#991b1b]',
  Accepted: 'bg-[#dcfce7] text-[#166534]'
};

const formatToday = () =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

const firstName = (name?: string | null) => name?.trim().split(/\s+/)[0] || 'there';

const formatShortDate = (date?: string) => {
  if (!date) {
    return 'No date set';
  }

  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(date));
};

const currentWeekDays = () => {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay() || 7;
  monday.setDate(today.getDate() - day + 1);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
      day: new Intl.DateTimeFormat(undefined, { day: 'numeric' }).format(date),
      isToday: date.toDateString() === today.toDateString()
    };
  });
};

const panelClass = 'border-[3px] border-black bg-white shadow-[5px_5px_0_#000]';
const iconBox = 'grid h-9 w-9 place-items-center border-[3px] border-black bg-[#f97316] text-white shadow-[3px_3px_0_#000]';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [shareLabel, setShareLabel] = useState('Share');
  const applicationsQuery = useQuery({ queryKey: ['applications'], queryFn: applicationApi.list });
  const resumesQuery = useQuery({ queryKey: ['resumes'], queryFn: resumeApi.list });
  const activitiesQuery = useActivitiesQuery();

  if (applicationsQuery.isLoading || resumesQuery.isLoading) {
    return <LoadingSpinner />;
  }

  const applications = applicationsQuery.data ?? [];
  const resumes = resumesQuery.data ?? [];
  const displayApplications = applications.slice(0, 5);
  const interviews = applications.filter((item) => item.status === 'Interview').length;
  const activeApplications = applications.filter((item) => !['Rejected', 'Accepted'].includes(item.status)).length;
  const offers = applications.filter((item) => item.status === 'Offer' || item.status === 'Accepted').length;
  const recentActivities = activitiesQuery.data ?? [];
  const weekDays = currentWeekDays();
  const scheduledApplications = applications
    .filter((application) => ['Interview', 'OA', 'Offer'].includes(application.status))
    .slice(0, 3);
  const applicationNotes = applications
    .filter((application) => application.notes?.trim())
    .slice(0, 3);

  const shareDashboard = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Landed dashboard', url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareLabel('Copied');
        window.setTimeout(() => setShareLabel('Share'), 1600);
      }
    } catch {
      setShareLabel('Share');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-3 py-4 sm:px-4 lg:px-5">
      <section className={`${panelClass} overflow-hidden bg-[#fffaf1]`}>
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-5 md:p-6">
            <div className="mb-4 inline-flex items-center gap-2 border-2 border-[#f3d8b9] bg-[#fff6e8] px-3 py-1.5 text-[11px] font-black uppercase text-[#7a3515] shadow-[2px_2px_0_rgba(0,0,0,0.12)]">
              <Sparkles className="h-4 w-4 text-[#f97316]" />
              {formatToday()}
            </div>
            <h2 className="max-w-[660px] text-[clamp(2.2rem,4.2vw,4rem)] font-black uppercase leading-[0.92] text-black">
              Good evening, {firstName(user?.name)}.
            </h2>
            <p className="mt-4 max-w-[520px] text-[14px] font-bold leading-6 text-[#555]">
              Your job search command center: applications, resume versions, interviews, and follow-ups in one loud workspace.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                className="inline-flex items-center gap-2 border-[3px] border-black bg-white px-3 py-2.5 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#f9d44a]"
                type="button"
                onClick={shareDashboard}
              >
                <Share2 className="h-4 w-4" />
                {shareLabel}
              </button>
              <Link
                className="inline-flex items-center gap-2 border-[3px] border-black bg-[#f97316] px-3 py-2.5 text-xs font-black uppercase text-white shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5"
                to="/applications"
              >
                <Plus className="h-4 w-4" />
                Add application
              </Link>
            </div>
          </div>

          <div className="grid border-t-[3px] border-black bg-[#09090b] p-4 text-white sm:grid-cols-3 lg:grid-cols-1 lg:border-l-[3px] lg:border-t-0">
            <HeroMetric icon={TimerReset} label="active applications" value={activeApplications} color="bg-[#f97316]" />
            <HeroMetric icon={CheckCircle2} label="interviews" value={interviews} color="bg-[#96d35f]" />
            <HeroMetric icon={FileText} label="resumes" value={resumes.length} color="bg-[#5dd6e4]" />
          </div>
        </div>
      </section>

      <section className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-2.5 border-b-[3px] border-black bg-[#f8efe2] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className={iconBox}>
              <ListTodo className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-black uppercase tracking-tight text-black">Application Pipeline</h3>
            <span className="border-2 border-black bg-white px-2.5 py-1 text-[11px] font-black uppercase text-[#555]">
              This week
            </span>
          </div>
          <Link
            className="border-[3px] border-black bg-white px-4 py-1.5 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#f9d44a]"
            to="/applications"
          >
            See all
          </Link>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-white text-left text-xs font-black uppercase text-black">
                <th className="border-b-[3px] border-black px-3 py-3">
                  <span className="inline-flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4" />
                    Role
                  </span>
                </th>
                <th className="border-b-[3px] border-l-[3px] border-black px-3 py-3">
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Company
                  </span>
                </th>
                <th className="border-b-[3px] border-l-[3px] border-black px-3 py-3">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Status
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayApplications.length ? (
                displayApplications.map((application, index) => (
                  <tr key={application.id} className="text-[13px] text-[#555]">
                    <td className="border-b-[3px] border-black px-3 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-black text-black">{application.role}</p>
                          <p className="mt-1 truncate text-xs font-bold text-[#777]">
                            {application.resume || 'Resume not selected'}
                          </p>
                        </div>
                        <div className="hidden items-center gap-3 text-xs font-black text-[#555] sm:flex">
                          <span className="inline-flex items-center gap-1">
                            <MessageSquareText className="h-3.5 w-3.5" />
                            {index + 2}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            {index + 5}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border-b-[3px] border-l-[3px] border-black px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center border-[3px] border-black bg-black text-[11px] font-black text-white shadow-[2px_2px_0_#f97316]">
                          {application.company.slice(0, 1)}
                        </span>
                        <div>
                          <p className="font-black text-black">{application.company}</p>
                          <p className="text-xs font-bold text-[#777]">{application.location || 'Location flexible'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b-[3px] border-l-[3px] border-black px-3 py-3">
                      <span className={`inline-flex border-2 border-black px-2.5 py-1 text-[11px] font-black uppercase ${statusStyles[application.status]}`}>
                        {application.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-[13px] font-bold text-[#555]" colSpan={3}>
                    No applications yet. Add your first real application to start tracking your pipeline.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className={`${panelClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b-[3px] border-black bg-[#f8efe2] px-3 py-3">
            <div className="flex items-center gap-3">
              <span className={iconBox}>
                <CalendarDays className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">Schedule</h3>
            </div>
            <MoreHorizontal className="h-5 w-5 text-black" />
          </div>
          <div className="grid grid-cols-7 gap-1.5 border-b-[3px] border-black bg-white px-3 py-2.5 text-center text-[11px] font-black uppercase text-black">
            {weekDays.map((day) => (
              <span
                key={day.key}
                className={day.isToday ? 'border-2 border-black bg-[#f5b8d4] py-1.5 shadow-[2px_2px_0_#000]' : 'py-1.5'}
              >
                {day.label} {day.day}
              </span>
            ))}
          </div>
          <div className="divide-y-[3px] divide-black bg-white px-3 py-1">
            {scheduledApplications.length ? (
              scheduledApplications.map((application) => (
                <div key={application.id} className="flex items-center gap-3 py-3">
                  <span className="h-10 w-2 border-2 border-black bg-[#96d35f]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-black text-black">{application.role}</p>
                    <p className="mt-1 text-xs font-bold text-[#555]">
                      {application.company} - {application.status} - {formatShortDate(application.appliedDate)}
                    </p>
                  </div>
                  <MoreHorizontal className="h-5 w-5 text-black" />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-[13px] font-bold text-[#555]">
                No interview or assessment items yet.
              </div>
            )}
          </div>
        </div>

        <div className={`${panelClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b-[3px] border-black bg-[#f8efe2] px-3 py-3">
            <div className="flex items-center gap-3">
              <span className={iconBox}>
                <BellRing className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">Notes</h3>
            </div>
            <Link className="text-xs font-black uppercase text-[#555] hover:text-black" to="/interview-notes">
              Open notes
            </Link>
          </div>
          <div className="divide-y-[3px] divide-black bg-white px-3 py-1">
            {applicationNotes.length ? (
              applicationNotes.map((application) => (
                <div key={application.id} className="flex gap-3 py-3">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border-[3px] border-black bg-[#5dd6e4]">
                    <MessageSquareText className="h-4 w-4 text-black" />
                  </span>
                  <div>
                    <p className="text-[13px] font-black text-black">{application.company} - {application.role}</p>
                    <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#555]">{application.notes}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-[13px] font-bold text-[#555]">
                Notes you add to applications will appear here.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Target} label="Offers or accepted roles" value={offers} color="bg-[#a78bfa]" />
        <MetricCard icon={Search} label="Recent activity" value={recentActivities.length} color="bg-[#5dd6e4]" />
        <MetricCard
          icon={Clock3}
          label="Interview conversion"
          value={`${applications.length ? Math.round((interviews / applications.length) * 100) : 0}%`}
          color="bg-[#f9d44a]"
        />
      </section>
    </div>
  );
};

const HeroMetric = ({
  color,
  icon: Icon,
  label,
  value
}: {
  color: string;
  icon: typeof TimerReset;
  label: string;
  value: number;
}) => (
  <div className="border-b-[3px] border-black p-4 last:border-b-0 sm:border-b-0 sm:border-r-[3px] sm:last:border-r-0 lg:border-b-[3px] lg:border-r-0 lg:last:border-b-0">
    <div className={`mb-3 grid h-9 w-9 place-items-center border-[3px] border-black ${color} text-black shadow-[3px_3px_0_#000]`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="text-[34px] font-black leading-none">{value}</div>
    <div className="mt-2 text-[11px] font-black uppercase text-white/70">{label}</div>
  </div>
);

const MetricCard = ({
  color,
  icon: Icon,
  label,
  value
}: {
  color: string;
  icon: typeof Target;
  label: string;
  value: number | string;
}) => (
  <div className={`${panelClass} p-4`}>
    <div className={`grid h-9 w-9 place-items-center border-[3px] border-black ${color} text-black shadow-[3px_3px_0_#000]`}>
      <Icon className="h-4 w-4" />
    </div>
    <p className="mt-3 text-3xl font-black text-black">{value}</p>
    <p className="mt-1 text-xs font-black uppercase text-[#555]">{label}</p>
  </div>
);
