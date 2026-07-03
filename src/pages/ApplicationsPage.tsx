import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { ApplicationsTable } from '../components/ApplicationsTable';
import { EmptyState } from '../components/EmptyState';
import { JobImportModal } from '../components/JobImportModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { applicationApi } from '../services/applicationApi';
import type { Application, ApplicationStatus } from '../types/application';
import type { JobImportResponse } from '../types/jobImport';

const statuses: Array<ApplicationStatus | 'All'> = ['All', 'Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Accepted'];
const schema = z.object({
  company: z.string().min(1, 'Company is required.'),
  role: z.string().min(1, 'Role is required.'),
  jobUrl: z.string().url('Enter a valid URL.').optional().or(z.literal('')),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  skills: z.string().optional(),
  jobDescription: z.string().optional(),
  status: z.enum(['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Accepted']),
  notes: z.string().optional(),
  appliedDate: z.string().min(1, 'Applied date is required.')
});
type FormValues = z.infer<typeof schema>;

const appendImportedContext = (notes?: string, skills?: string) => {
  const normalizedNotes = notes?.trim() ?? '';
  const normalizedSkills = skills?.trim() ?? '';

  if (!normalizedSkills) {
    return normalizedNotes || undefined;
  }

  const skillsLine = 'Skills: ' + normalizedSkills;
  return normalizedNotes ? normalizedNotes + '\n\n' + skillsLine : skillsLine;
};

const toApplicationPayload = (values: FormValues) => ({
  ...values,
  jobUrl: values.jobUrl || undefined,
  location: values.location || undefined,
  employmentType: values.employmentType || undefined,
  jobDescription: values.jobDescription || undefined,
  notes: appendImportedContext(values.notes, values.skills)
});

export const ApplicationsPage = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | 'All'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const queryClient = useQueryClient();
  const applicationsQuery = useQuery({ queryKey: ['applications'], queryFn: applicationApi.list });
  const createMutation = useMutation({ mutationFn: applicationApi.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, values }: { id: string; values: FormValues }) => applicationApi.update(id, toApplicationPayload(values)), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }) });
  const deleteMutation = useMutation({ mutationFn: applicationApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }) });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { company: '', role: '', jobUrl: '', location: '', employmentType: '', skills: '', jobDescription: '', status: 'Applied', notes: '', appliedDate: new Date().toISOString().slice(0, 10) }
  });

  useEffect(() => {
    setQuery(searchParams.get('search') ?? '');
  }, [searchParams]);

  const emptyFormValues = useMemo<FormValues>(() => ({
    company: '',
    role: '',
    jobUrl: '',
    location: '',
    employmentType: '',
    skills: '',
    jobDescription: '',
    status: 'Applied',
    notes: '',
    appliedDate: new Date().toISOString().slice(0, 10)
  }), []);

  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filtered = useMemo(() => {
    const applications = applicationsQuery.data ?? [];
    return applications.filter((application) => {
      const matchesQuery = [application.company, application.role, application.resume].join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'All' || application.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [applicationsQuery.data, query, status]);

  const openCreateModal = () => {
    setEditingApplication(null);
    createMutation.reset();
    updateMutation.reset();
    reset(emptyFormValues);
    setModalOpen(true);
  };

  const openEditModal = (application: Application) => {
    setEditingApplication(application);
    createMutation.reset();
    updateMutation.reset();
    reset({
      company: application.company,
      role: application.role,
      jobUrl: application.jobUrl ?? '',
      location: application.location ?? '',
      employmentType: application.employmentType ?? '',
      skills: '',
      jobDescription: application.jobDescription ?? '',
      status: application.status,
      notes: application.notes ?? '',
      appliedDate: application.appliedDate || new Date().toISOString().slice(0, 10)
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingApplication(null);
    reset(emptyFormValues);
  };

  const onImported = (url: string, job: JobImportResponse) => {
    setEditingApplication(null);
    createMutation.reset();
    updateMutation.reset();
    reset({
      ...emptyFormValues,
      company: job.company,
      role: job.role,
      jobUrl: url,
      location: job.location,
      employmentType: job.employmentType,
      skills: job.skills.join(', '),
      jobDescription: job.description,
      notes: [job.experience ? 'Experience: ' + job.experience : '', job.salary ? 'Salary: ' + job.salary : ''].filter(Boolean).join('\n')
    });
    setImportModalOpen(false);
    setModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    if (editingApplication) {
      await updateMutation.mutateAsync({ id: editingApplication.id, values });
    } else {
      await createMutation.mutateAsync(toApplicationPayload(values));
    }

    reset(emptyFormValues);
    setModalOpen(false);
    setEditingApplication(null);
  };

  const onDelete = (id: string) => {
    deleteMutation.reset();
    deleteMutation.mutate(id);
  };

  if (applicationsQuery.isLoading) {
    return <LoadingSpinner label="Loading applications" />;
  }

  if (applicationsQuery.isError) {
    return (
      <div className="page-shell">
        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-950">Could not load applications</h2>
          <p className="mt-2 text-sm text-slate-500">{applicationsQuery.error.message}</p>
          <button className="btn-primary mt-5" type="button" onClick={() => applicationsQuery.refetch()}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Applications</h2>
          <p className="mt-1 text-sm text-slate-500">Search, filter, and manage every active opportunity.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" type="button" onClick={() => setImportModalOpen(true)}>
            <Link className="h-4 w-4" />
            Import from Job URL
          </button>
          <button className="btn-primary" type="button" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>
      </div>
      {mutationError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {mutationError.message}
        </div>
      ) : null}
      <section className="card p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex max-w-md items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input className="w-full text-sm outline-none" placeholder="Search company, role, resume..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button key={item} className={'rounded-full px-3 py-1.5 text-sm font-semibold transition ' + (status === item ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')} type="button" onClick={() => setStatus(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>
      {filtered.length ? (
        <ApplicationsTable applications={filtered} onEdit={openEditModal} onDelete={onDelete} deletingId={deleteMutation.isPending ? deleteMutation.variables : null} />
      ) : (
        <EmptyState icon={Search} title="No applications found" description="Try a different search or add a new application to the pipeline." />
      )}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-sm">
          <form
            className="max-h-[88dvh] w-full max-w-[600px] overflow-y-auto border-[4px] border-black bg-[#fffaf1] p-4 text-black shadow-[8px_8px_0_#000] sm:p-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mb-4 flex items-start justify-between gap-4 border-b-[3px] border-black pb-3">
              <div>
                <h3 className="text-xl font-black uppercase text-black">{editingApplication ? 'Edit Application' : 'Add Application'}</h3>
                <p className="text-xs font-bold text-[#555]">Capture the basics and keep moving.</p>
              </div>
              <button className="border-[3px] border-black bg-white px-3 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#f9d44a]" type="button" onClick={closeModal}>Close</button>
            </div>
            {mutationError ? <p className="mb-3 border-[3px] border-[#dc2626] bg-[#fee2e2] px-3 py-2 text-xs font-black text-[#991b1b]">{mutationError.message}</p> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="text-[11px] font-black uppercase text-black">Company</label><input className="mt-1 h-10 w-full border-[3px] border-black bg-white px-3 py-1.5 text-xs font-bold text-black outline-none placeholder:text-[#9a9489] focus:shadow-[3px_3px_0_#000]" {...register('company')} />{errors.company ? <p className="mt-1 text-xs font-bold text-rose-600">{errors.company.message}</p> : null}</div>
              <div><label className="text-[11px] font-black uppercase text-black">Role</label><input className="mt-1 h-10 w-full border-[3px] border-black bg-white px-3 py-1.5 text-xs font-bold text-black outline-none placeholder:text-[#9a9489] focus:shadow-[3px_3px_0_#000]" {...register('role')} />{errors.role ? <p className="mt-1 text-xs font-bold text-rose-600">{errors.role.message}</p> : null}</div>
              <div><label className="text-[11px] font-black uppercase text-black">Job URL</label><input className="mt-1 h-10 w-full border-[3px] border-black bg-white px-3 py-1.5 text-xs font-bold text-black outline-none placeholder:text-[#9a9489] focus:shadow-[3px_3px_0_#000]" {...register('jobUrl')} />{errors.jobUrl ? <p className="mt-1 text-xs font-bold text-rose-600">{errors.jobUrl.message}</p> : null}</div>
              <div><label className="text-[11px] font-black uppercase text-black">Location</label><input className="mt-1 h-10 w-full border-[3px] border-black bg-white px-3 py-1.5 text-xs font-bold text-black outline-none placeholder:text-[#9a9489] focus:shadow-[3px_3px_0_#000]" {...register('location')} /></div>
              <div><label className="text-[11px] font-black uppercase text-black">Employment Type</label><input className="mt-1 h-10 w-full border-[3px] border-black bg-white px-3 py-1.5 text-xs font-bold text-black outline-none placeholder:text-[#9a9489] focus:shadow-[3px_3px_0_#000]" {...register('employmentType')} /></div>
              <div><label className="text-[11px] font-black uppercase text-black">Status</label><select className="mt-1 h-10 w-full border-[3px] border-black bg-white px-3 py-1.5 text-xs font-bold text-black outline-none focus:shadow-[3px_3px_0_#000]" {...register('status')}>{statuses.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></div>
              <div><label className="text-[11px] font-black uppercase text-black">Applied Date</label><input className="mt-1 h-10 w-full border-[3px] border-black bg-white px-3 py-1.5 text-xs font-bold text-black outline-none focus:shadow-[3px_3px_0_#000]" type="date" {...register('appliedDate')} />{errors.appliedDate ? <p className="mt-1 text-xs font-bold text-rose-600">{errors.appliedDate.message}</p> : null}</div>
              <div><label className="text-[11px] font-black uppercase text-black">Skills</label><input className="mt-1 h-10 w-full border-[3px] border-black bg-white px-3 py-1.5 text-xs font-bold text-black outline-none placeholder:text-[#9a9489] focus:shadow-[3px_3px_0_#000]" placeholder="React, TypeScript, SQL" {...register('skills')} /></div>
              <div><label className="text-[11px] font-black uppercase text-black">Description</label><textarea className="mt-1 min-h-20 w-full border-[3px] border-black bg-white px-3 py-2 text-xs font-bold text-black outline-none focus:shadow-[3px_3px_0_#000]" {...register('jobDescription')} /></div>
              <div><label className="text-[11px] font-black uppercase text-black">Notes</label><textarea className="mt-1 min-h-20 w-full border-[3px] border-black bg-white px-3 py-2 text-xs font-bold text-black outline-none focus:shadow-[3px_3px_0_#000]" {...register('notes')} /></div>
            </div>
            <div className="mt-3 flex justify-end gap-2.5">
              <button className="border-[3px] border-black bg-white px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#f9d44a]" type="button" onClick={closeModal}>Cancel</button>
              <button className="border-[3px] border-black bg-[#f97316] px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Application'}</button>
            </div>
          </form>
        </div>
      ) : null}
      {importModalOpen ? <JobImportModal onClose={() => setImportModalOpen(false)} onImported={onImported} /> : null}
    </div>
  );
};
