import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CalendarClock, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { applicationApi } from '../services/applicationApi';
import { reminderApi } from '../services/reminderApi';
import type { Reminder } from '../types/reminder';

const schema = z.object({
  jobApplicationId: z.string().min(1, 'Choose an application.'),
  message: z.string().trim().min(1, 'Add a reminder message.').max(500, 'Keep the message under 500 characters.'),
  scheduledAt: z.string().min(1, 'Choose a date and time.')
});

type FormValues = z.infer<typeof schema>;

const statusLabel: Record<Reminder['status'], string> = {
  scheduled: 'Scheduled',
  processing: 'Processing',
  processed: 'Delivered',
  failed: 'Needs attention',
  cancelled: 'Cancelled'
};

const toIso = (value: string) => new Date(value).toISOString();

export const RemindersPage = () => {
  const queryClient = useQueryClient();
  const applicationsQuery = useQuery({ queryKey: ['applications'], queryFn: applicationApi.list });
  const remindersQuery = useQuery({ queryKey: ['reminders'], queryFn: reminderApi.list });
  const [editingId, setEditingId] = useState<string | null>(null);
  const createMutation = useMutation({ mutationFn: reminderApi.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, values }: { id: string; values: Partial<FormValues> }) => reminderApi.update(id, { message: values.message, scheduledAt: values.scheduledAt ? toIso(values.scheduledAt) : undefined }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }) });
  const deleteMutation = useMutation({ mutationFn: reminderApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }) });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { jobApplicationId: '', message: '', scheduledAt: '' }
  });

  const applications = applicationsQuery.data ?? [];
  const reminders = useMemo(() => [...(remindersQuery.data ?? [])].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)), [remindersQuery.data]);
  const error = applicationsQuery.error ?? remindersQuery.error ?? createMutation.error ?? updateMutation.error ?? deleteMutation.error;

  const onSubmit = async (values: FormValues) => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, values });
    } else {
      await createMutation.mutateAsync({ jobApplicationId: values.jobApplicationId, message: values.message, scheduledAt: toIso(values.scheduledAt) });
    }
    reset({ jobApplicationId: '', message: '', scheduledAt: '' });
    setEditingId(null);
  };

  const startEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    reset({ jobApplicationId: reminder.jobApplicationId, message: reminder.message, scheduledAt: toLocalInput(reminder.scheduledAt) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (applicationsQuery.isLoading || remindersQuery.isLoading) return <LoadingSpinner label="Loading reminders" />;

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-5 border-b-[3px] border-black pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f97316]">Never miss the next move</p>
          <h2 className="mt-1 text-[clamp(30px,3vw,42px)] font-black uppercase leading-none tracking-[-0.045em] text-black">Reminders</h2>
          <p className="mt-3 max-w-2xl text-sm font-bold text-[#555]">Schedule private, in-app nudges for every job application. Sidekiq delivers them when they are due.</p>
        </div>
        <button className="btn-secondary" type="button" onClick={() => void remindersQuery.refetch()}><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      {error ? <div className="border-[3px] border-rose-600 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error.message}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
        <form className="card h-fit space-y-4 p-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-start gap-3 border-b-[3px] border-black pb-4"><div className="border-[3px] border-black bg-[#5dd6e4] p-2 shadow-[3px_3px_0_#000]"><Bell className="h-5 w-5" /></div><div><h3 className="text-lg font-black uppercase">{editingId ? 'Edit reminder' : 'New reminder'}</h3><p className="mt-1 text-xs font-bold text-[#555]">Only you can see these reminders.</p></div></div>
          <div><label className="text-xs font-black uppercase">Job application</label><select className="input mt-2" {...register('jobApplicationId')}><option value="">Choose an application</option>{applications.map((application) => <option key={application.id} value={application.id}>{application.company} · {application.role}</option>)}</select>{errors.jobApplicationId ? <p className="mt-1 text-xs font-bold text-rose-600">{errors.jobApplicationId.message}</p> : null}</div>
          <div><label className="text-xs font-black uppercase">Message</label><textarea className="input mt-2 min-h-28" placeholder="Follow up with the recruiter..." {...register('message')} />{errors.message ? <p className="mt-1 text-xs font-bold text-rose-600">{errors.message.message}</p> : null}</div>
          <div><label className="text-xs font-black uppercase">Date and time</label><input className="input mt-2" type="datetime-local" {...register('scheduledAt')} />{errors.scheduledAt ? <p className="mt-1 text-xs font-bold text-rose-600">{errors.scheduledAt.message}</p> : null}</div>
          <div className="flex gap-3"><button className="btn-primary" type="submit" disabled={createMutation.isPending || updateMutation.isPending}><Plus className="h-4 w-4" />{createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingId ? 'Update reminder' : 'Schedule reminder'}</button>{editingId ? <button className="btn-secondary" type="button" onClick={() => { setEditingId(null); reset({ jobApplicationId: '', message: '', scheduledAt: '' }); }}>Cancel</button> : null}</div>
        </form>

        <div className="space-y-4">
          {!applications.length ? <EmptyState icon={CalendarClock} title="Add an application first" description="Reminders attach to saved applications so every follow-up stays in context." /> : !reminders.length ? <EmptyState icon={CalendarClock} title="No reminders yet" description="Schedule your first follow-up from the form." /> : reminders.map((reminder) => (
            <article key={reminder.id} className="card p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-[#f97316]">{formatDate(reminder.scheduledAt)}</p><h3 className="mt-1 text-lg font-black text-black">{reminder.message}</h3><p className="mt-1 text-sm font-bold text-[#555]">{reminder.application?.company ?? 'Application'} · {reminder.application?.role ?? 'Job application'}</p></div><span className="w-fit border-[3px] border-black bg-[#f9d44a] px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0_#000]">{statusLabel[reminder.status]}</span></div><div className="mt-4 flex gap-2"><button className="btn-secondary px-3 py-2" type="button" onClick={() => startEdit(reminder)}>Edit</button><button className="btn-secondary px-3 py-2 text-rose-700" type="button" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(reminder.id)}><Trash2 className="h-4 w-4" /> Delete</button></div></article>
          ))}
        </div>
      </section>
    </div>
  );
};

const formatDate = (value: string) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const toLocalInput = (value: string) => { const date = new Date(value); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16); };
