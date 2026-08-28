import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Edit3, NotebookTabs, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { applicationApi } from '../services/applicationApi';
import { interviewNoteApi } from '../services/interviewNoteApi';
import type { Application } from '../types/application';
import type { InterviewNote, InterviewNotePayload } from '../types/interviewNote';

const schema = z.object({
  roundNumber: z.coerce.number().min(1, 'Round is required.').max(20, 'Use a round number from 1 to 20.'),
  interviewDate: z.string().optional(),
  questionsAsked: z.string().optional(),
  notes: z.string().optional(),
  outcome: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = {
  roundNumber: 1,
  interviewDate: '',
  questionsAsked: '',
  notes: '',
  outcome: ''
};

const toPayload = (values: FormValues): InterviewNotePayload => ({
  roundNumber: values.roundNumber,
  interviewDate: values.interviewDate || undefined,
  questionsAsked: values.questionsAsked || undefined,
  notes: values.notes || undefined,
  outcome: values.outcome || undefined
});

export const InterviewNotesPage = () => {
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<InterviewNote | null>(null);
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({ queryKey: ['applications'], queryFn: applicationApi.list });
  const applications = useMemo(() => applicationsQuery.data ?? [], [applicationsQuery.data]);
  const selectedApplication = applications.find((application) => application.id === selectedApplicationId) ?? applications[0];
  const activeApplicationId = selectedApplication?.id ?? '';

  const notesQuery = useQuery({
    queryKey: ['interview-notes', activeApplicationId],
    queryFn: () => interviewNoteApi.list(activeApplicationId),
    enabled: Boolean(activeApplicationId)
  });

  const createMutation = useMutation({
    mutationFn: ({ applicationId, values }: { applicationId: string; values: FormValues }) =>
      interviewNoteApi.create(applicationId, toPayload(values)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interview-notes', activeApplicationId] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) => interviewNoteApi.update(id, toPayload(values)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interview-notes', activeApplicationId] })
  });

  const deleteMutation = useMutation({
    mutationFn: interviewNoteApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interview-notes', activeApplicationId] })
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues
  });

  useEffect(() => {
    if (!selectedApplicationId && applications[0]) {
      setSelectedApplicationId(applications[0].id);
    }
  }, [applications, selectedApplicationId]);

  const openCreateModal = () => {
    setEditingNote(null);
    createMutation.reset();
    updateMutation.reset();
    reset({ ...emptyValues, roundNumber: (notesQuery.data?.length ?? 0) + 1 });
    setModalOpen(true);
  };

  const openEditModal = (note: InterviewNote) => {
    setEditingNote(note);
    createMutation.reset();
    updateMutation.reset();
    reset({
      roundNumber: note.roundNumber,
      interviewDate: note.interviewDate ?? '',
      questionsAsked: note.questionsAsked ?? '',
      notes: note.notes ?? '',
      outcome: note.outcome ?? ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingNote(null);
    reset(emptyValues);
  };

  const onSubmit = async (values: FormValues) => {
    if (!activeApplicationId) {
      return;
    }

    if (editingNote) {
      await updateMutation.mutateAsync({ id: editingNote.id, values });
    } else {
      await createMutation.mutateAsync({ applicationId: activeApplicationId, values });
    }

    closeModal();
  };

  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;

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

  if (!applications.length) {
    return (
      <div className="page-shell">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Interview Notes</h2>
          <p className="mt-1 text-sm text-slate-500">Keep round-specific notes grouped by application.</p>
        </div>
        <EmptyState icon={NotebookTabs} title="No applications yet" description="Add an application before tracking interview rounds." />
      </div>
    );
  }

  const notes = notesQuery.data ?? [];

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Interview Notes</h2>
          <p className="mt-1 text-sm text-slate-500">Track questions, notes, and outcomes for every interview round.</p>
        </div>
        <button className="btn-primary" type="button" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Add Interview Round
        </button>
      </div>

      {mutationError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {mutationError.message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.35fr_0.65fr]">
        <ApplicationPicker applications={applications} selectedId={activeApplicationId} onSelect={setSelectedApplicationId} />

        <div className="card p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-600">{selectedApplication?.company}</p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">{selectedApplication?.role}</h3>
              <p className="mt-1 text-sm text-slate-500">Timeline view</p>
            </div>
            <button className="btn-secondary" type="button" onClick={() => notesQuery.refetch()}>Refresh</button>
          </div>

          {notesQuery.isLoading ? (
            <LoadingSpinner label="Loading interview notes" />
          ) : notesQuery.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              <p className="font-semibold">Could not load interview notes</p>
              <p className="mt-1">{notesQuery.error.message}</p>
              <button className="btn-secondary mt-4" type="button" onClick={() => notesQuery.refetch()}>Try again</button>
            </div>
          ) : notes.length ? (
            <div className="space-y-5">
              {notes.map((note) => (
                <article key={note.id} className="relative rounded-2xl border border-slate-200 p-5">
                  <div className="absolute -left-2 top-6 h-4 w-4 rounded-full bg-primary-600 ring-4 ring-primary-50" />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-950">Round {note.roundNumber}</h4>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        {note.interviewDate ? formatDate(note.interviewDate) : 'Date not set'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary px-3 py-2" type="button" onClick={() => openEditModal(note)} aria-label="Edit interview round"><Edit3 className="h-4 w-4" /></button>
                      <button className="btn-secondary px-3 py-2 text-rose-600" type="button" disabled={deleteMutation.isPending && deleteMutation.variables === note.id} onClick={() => deleteMutation.mutate(note.id)} aria-label="Delete interview round"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <NoteBlock title="Questions Asked" value={note.questionsAsked} />
                    <NoteBlock title="Notes" value={note.notes} />
                    <NoteBlock title="Outcome" value={note.outcome} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={NotebookTabs} title="No interview rounds yet" description="Add Round 1 when you start preparing or after the interview wraps." />
          )}
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 py-8 backdrop-blur-sm">
          <form className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">{editingNote ? 'Edit Interview Round' : 'Add Interview Round'}</h3>
                <p className="text-sm text-slate-500">{selectedApplication?.company} · {selectedApplication?.role}</p>
              </div>
              <button className="btn-secondary" type="button" onClick={closeModal}>Close</button>
            </div>

            {mutationError ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{mutationError.message}</p> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Round Number</label>
                <input className="input mt-2" type="number" min="1" max="20" {...register('roundNumber')} />
                {errors.roundNumber ? <p className="mt-1 text-xs text-rose-600">{errors.roundNumber.message}</p> : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Interview Date</label>
                <input className="input mt-2" type="date" {...register('interviewDate')} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Questions Asked</label>
                <textarea className="input mt-2 min-h-28" {...register('questionsAsked')} />
                {errors.questionsAsked ? <p className="mt-1 text-xs text-rose-600">{errors.questionsAsked.message}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Notes</label>
                <textarea className="input mt-2 min-h-32" {...register('notes')} />
                {errors.notes ? <p className="mt-1 text-xs text-rose-600">{errors.notes.message}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Outcome</label>
                <input className="input mt-2" placeholder="Moved to next round, rejected, offer pending..." {...register('outcome')} />
                {errors.outcome ? <p className="mt-1 text-xs text-rose-600">{errors.outcome.message}</p> : null}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-secondary" type="button" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Round'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};

const ApplicationPicker = ({ applications, selectedId, onSelect }: { applications: Application[]; selectedId: string; onSelect: (id: string) => void }) => (
  <div className="card p-4">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Applications</h3>
    <div className="mt-4 space-y-2">
      {applications.map((application) => (
        <button
          key={application.id}
          className={'w-full rounded-2xl px-4 py-3 text-left transition ' + (selectedId === application.id ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100' : 'bg-slate-50 text-slate-700 hover:bg-slate-100')}
          type="button"
          onClick={() => onSelect(application.id)}
        >
          <p className="text-sm font-semibold">{application.company}</p>
          <p className="mt-1 truncate text-xs opacity-80">{application.role}</p>
        </button>
      ))}
    </div>
  </div>
);

const NoteBlock = ({ title, value }: { title: string; value?: string | null }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{value || 'Not captured yet.'}</p>
  </div>
);

const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}).format(new Date(value));
