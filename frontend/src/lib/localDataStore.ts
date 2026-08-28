import { API_BASE_URL } from './apiClient';
import type { Activity } from '../types/activity';
import type { Application, ApplicationPayload } from '../types/application';
import type { InterviewNote, InterviewNotePayload } from '../types/interviewNote';
import type { Resume, ResumeUploadPayload, ResumeVersion } from '../types/resume';
import type { ResumeMatchAnalyzePayload, ResumeMatchAnalyzeResponse } from '../types/resumeMatch';
import type { ResumePerformance } from '../types/resumePerformance';

type StoreShape = {
  applications: Application[];
  resumes: Resume[];
  notes: InterviewNote[];
  activities: Activity[];
};

const STORE_KEY = 'landed.localData.v1';

export const shouldUseLocalDataFallback = (error: unknown) =>
  (import.meta.env.DEV || API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) &&
  error instanceof Error &&
  (error.message === 'Network Error' || error.message.includes('timeout'));

const nowIso = () => new Date().toISOString();

const makeId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return prefix + '_' + crypto.randomUUID();
  }

  return prefix + '_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
};

const emptyStore = (): StoreShape => ({ applications: [], resumes: [], notes: [], activities: [] });

const isSeedApplication = (application: Application) =>
  (application.company === 'Stripe' && application.role === 'Frontend Engineer') ||
  (application.company === 'Notion' && application.role === 'Product Engineer') ||
  (application.company === 'Linear' && application.role === 'Design Engineer');

const removeSeedData = (store: StoreShape): StoreShape => ({
  applications: store.applications.filter((application) => !isSeedApplication(application)),
  resumes: store.resumes.filter((resume) => !['local-resume-product', 'local-resume-fullstack'].includes(resume.id)),
  notes: store.notes.filter((note) => note.id !== 'local-note-1'),
  activities: store.activities.filter(
    (activityItem) =>
      !['Added Stripe - Frontend Engineer.', 'Uploaded Product UI Resume.', 'Added Round 1 notes.'].includes(activityItem.description)
  )
});

const activity = (type: Activity['type'], title: string, description: string, entityId?: string): Activity => ({
  id: makeId('act'),
  type,
  title,
  description,
  entityId,
  occurredAt: nowIso()
});

const readStore = (): StoreShape => {
  const stored = localStorage.getItem(STORE_KEY);

  if (!stored) {
    const store = emptyStore();
    writeStore(store);
    return store;
  }

  try {
    const parsed = JSON.parse(stored) as StoreShape;
    const cleaned = removeSeedData(parsed);
    if (JSON.stringify(cleaned) !== JSON.stringify(parsed)) {
      writeStore(cleaned);
    }
    return cleaned;
  } catch {
    const store = emptyStore();
    writeStore(store);
    return store;
  }
};

const writeStore = (store: StoreShape) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
};

const addActivity = (store: StoreShape, type: Activity['type'], title: string, description: string, entityId?: string) => {
  store.activities = [activity(type, title, description, entityId), ...store.activities].slice(0, 100);
};

const buildTimeline = (application: Application) => [
  {
    id: application.id + '-created',
    label: application.status === 'Saved' ? 'Saved role' : 'Application created',
    status: application.status,
    timestamp: application.createdAt ? new Date(application.createdAt).toLocaleString() : 'Created'
  }
];

const refreshResumeMetrics = (store: StoreShape) => {
  store.resumes = store.resumes.map((resume) => {
    const versionIds = new Set(resume.versions.map((version) => version.id));
    const applications = store.applications.filter((application) => application.resumeVersionId && versionIds.has(application.resumeVersionId));
    const interviews = applications.filter((application) => ['Interview', 'Offer', 'Accepted'].includes(application.status)).length;
    const offers = applications.filter((application) => ['Offer', 'Accepted'].includes(application.status)).length;

    return {
      ...resume,
      applications: applications.length,
      interviews,
      conversionRate: applications.length ? Math.round(((interviews + offers) / applications.length) * 100) : 0
    };
  });
};

const latestResumeVersion = (store: StoreShape, resumeVersionId?: string) =>
  store.resumes.flatMap((resume) => resume.versions.map((version) => ({ resume, version }))).find((item) => item.version.id === resumeVersionId);

const payloadToApplication = (payload: ApplicationPayload, existing?: Application): Application => {
  const store = readStore();
  const linked = latestResumeVersion(store, payload.resumeVersionId);
  const createdAt = existing?.createdAt ?? nowIso();
  const id = existing?.id ?? makeId('app');
  const status = payload.status;
  const application: Application = {
    id,
    company: payload.company.trim(),
    role: payload.role.trim(),
    jobUrl: payload.jobUrl,
    location: payload.location,
    jobDescription: payload.jobDescription,
    employmentType: payload.employmentType,
    resumeVersionId: payload.resumeVersionId,
    resume: linked?.resume.name ?? payload.resume ?? 'Not selected',
    status,
    appliedDate: payload.appliedDate,
    notes: payload.notes,
    createdAt,
    timeline: existing?.status && existing.status !== status
      ? [
          ...buildTimeline({ ...existing, status: existing.status }),
          { id: id + '-status-' + Date.now(), label: 'Status changed to ' + status, status, timestamp: new Date().toLocaleString() }
        ]
      : buildTimeline({ ...(existing ?? ({} as Application)), id, status, createdAt } as Application)
  };

  return application;
};

export const localDataStore = {
  listApplications() {
    const store = readStore();
    return [...store.applications].sort((a, b) => (b.appliedDate || '').localeCompare(a.appliedDate || ''));
  },
  getApplication(id: string) {
    return readStore().applications.find((application) => application.id === id);
  },
  createApplication(payload: ApplicationPayload) {
    const store = readStore();
    const application = payloadToApplication(payload);
    store.applications = [application, ...store.applications];
    addActivity(store, 'APPLICATION_CREATED', 'Application added', 'Added ' + application.company + ' - ' + application.role + '.', application.id);
    refreshResumeMetrics(store);
    writeStore(store);
    return application;
  },
  updateApplication(id: string, payload: ApplicationPayload) {
    const store = readStore();
    const existing = store.applications.find((application) => application.id === id);

    if (!existing) {
      throw new Error('Application not found.');
    }

    const application = payloadToApplication(payload, existing);
    store.applications = store.applications.map((item) => (item.id === id ? application : item));
    addActivity(store, 'APPLICATION_STATUS_CHANGED', 'Application updated', 'Updated ' + application.company + ' - ' + application.role + '.', application.id);
    refreshResumeMetrics(store);
    writeStore(store);
    return application;
  },
  removeApplication(id: string) {
    const store = readStore();
    store.applications = store.applications.filter((application) => application.id !== id);
    store.notes = store.notes.filter((note) => note.applicationId !== id);
    refreshResumeMetrics(store);
    writeStore(store);
  },
  listResumes() {
    const store = readStore();
    refreshResumeMetrics(store);
    writeStore(store);
    return store.resumes;
  },
  getResume(id: string) {
    const resume = this.listResumes().find((item) => item.id === id);

    if (!resume) {
      throw new Error('Resume not found.');
    }

    return resume;
  },
  uploadResume(payload: ResumeUploadPayload) {
    const store = readStore();
    const file = payload.file[0];
    const createdAt = nowIso();
    const versionNumber = Number.parseInt(payload.version.replace(/\D/g, ''), 10) || 1;
    const version: ResumeVersion = {
      id: makeId('version'),
      version: versionNumber,
      filename: file?.name ?? payload.name + '.pdf',
      contentType: file?.type ?? 'application/pdf',
      fileSize: file?.size ?? 0,
      sha256: 'local-' + makeId('sha'),
      createdAt
    };
    const tags = payload.roleTag.split(',').map((tag) => tag.trim()).filter(Boolean);
    const resume: Resume = {
      id: makeId('resume'),
      name: payload.name.trim(),
      tags,
      version: 'v' + version.version,
      roleTag: tags[0] ?? payload.roleTag,
      uploadDate: new Date(createdAt).toLocaleDateString(),
      applications: 0,
      interviews: 0,
      conversionRate: 0,
      versions: [version],
      createdAt,
      updatedAt: createdAt
    };
    store.resumes = [resume, ...store.resumes];
    addActivity(store, 'RESUME_UPLOADED', 'Resume uploaded', 'Uploaded ' + resume.name + '.', resume.id);
    writeStore(store);
    return resume;
  },
  uploadResumeVersion(resumeId: string, file: File) {
    const store = readStore();
    const resume = store.resumes.find((item) => item.id === resumeId);

    if (!resume) {
      throw new Error('Resume not found.');
    }

    const createdAt = nowIso();
    const nextVersion = Math.max(0, ...resume.versions.map((version) => version.version)) + 1;
    const version: ResumeVersion = {
      id: makeId('version'),
      version: nextVersion,
      filename: file.name,
      contentType: file.type || 'application/pdf',
      fileSize: file.size,
      sha256: 'local-' + makeId('sha'),
      createdAt
    };
    resume.versions = [version, ...resume.versions];
    resume.version = 'v' + nextVersion;
    resume.updatedAt = createdAt;
    addActivity(store, 'RESUME_VERSION_CREATED', 'Resume version created', 'Added v' + nextVersion + ' for ' + resume.name + '.', resume.id);
    writeStore(store);
    return version;
  },
  removeResume(id: string) {
    const store = readStore();
    store.resumes = store.resumes.filter((resume) => resume.id !== id);
    store.applications = store.applications.map((application) =>
      application.resumeVersionId && !store.resumes.some((resume) => resume.versions.some((version) => version.id === application.resumeVersionId))
        ? { ...application, resumeVersionId: undefined, resume: 'Not selected' }
        : application
    );
    writeStore(store);
  },
  listNotes(applicationId: string) {
    return readStore().notes.filter((note) => note.applicationId === applicationId).sort((a, b) => a.roundNumber - b.roundNumber);
  },
  createNote(applicationId: string, payload: InterviewNotePayload) {
    const store = readStore();
    const note: InterviewNote = {
      id: makeId('note'),
      applicationId,
      ...payload,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    store.notes = [note, ...store.notes];
    addActivity(store, 'INTERVIEW_NOTE_CREATED', 'Interview note added', 'Added Round ' + note.roundNumber + ' notes.', note.id);
    writeStore(store);
    return note;
  },
  updateNote(id: string, payload: InterviewNotePayload) {
    const store = readStore();
    let updated: InterviewNote | undefined;
    store.notes = store.notes.map((note) => {
      if (note.id !== id) {
        return note;
      }

      updated = { ...note, ...payload, updatedAt: nowIso() };
      return updated;
    });

    if (!updated) {
      throw new Error('Interview note not found.');
    }

    addActivity(store, 'INTERVIEW_NOTE_UPDATED', 'Interview note updated', 'Updated Round ' + updated.roundNumber + ' notes.', updated.id);
    writeStore(store);
    return updated;
  },
  removeNote(id: string) {
    const store = readStore();
    store.notes = store.notes.filter((note) => note.id !== id);
    addActivity(store, 'INTERVIEW_NOTE_DELETED', 'Interview note deleted', 'Removed an interview note.', id);
    writeStore(store);
  },
  listActivities() {
    return readStore().activities.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  },
  listResumePerformance(): ResumePerformance[] {
    const store = readStore();
    refreshResumeMetrics(store);
    writeStore(store);
    return store.resumes.map((resume) => {
      const versionIds = new Set(resume.versions.map((version) => version.id));
      const applications = store.applications.filter((application) => application.resumeVersionId && versionIds.has(application.resumeVersionId));
      const interviews = applications.filter((application) => ['Interview', 'Offer', 'Accepted'].includes(application.status)).length;
      const offers = applications.filter((application) => ['Offer', 'Accepted'].includes(application.status)).length;

      return {
        resumeId: resume.id,
        resumeName: resume.name,
        applications: applications.length,
        interviews,
        offers,
        conversionRate: applications.length ? Math.round(((interviews + offers) / applications.length) * 100) : 0
      };
    });
  },
  analyzeResumeMatch(payload: ResumeMatchAnalyzePayload): ResumeMatchAnalyzeResponse {
    const resume = this.getResume(payload.resumeId);
    const jobKeywords = extractKeywords(payload.jobDescription);
    const resumeKeywords = extractKeywords([resume.name, resume.roleTag, resume.tags.join(' '), resume.versions.map((version) => version.filename).join(' ')].join(' '));
    const matchedKeywords = jobKeywords.filter((keyword) => resumeKeywords.includes(keyword)).slice(0, 12);
    const missingKeywords = jobKeywords.filter((keyword) => !resumeKeywords.includes(keyword)).slice(0, 12);
    const coverage = jobKeywords.length ? matchedKeywords.length / Math.min(jobKeywords.length, 18) : 0;
    const matchScore = Math.max(22, Math.min(96, Math.round(coverage * 78 + Math.min(resume.tags.length * 4, 18))));
    const suggestions = [
      missingKeywords[0] ? 'Add a concrete bullet that mentions ' + titleCase(missingKeywords[0]) + '.' : 'Your resume covers the strongest visible keywords.',
      missingKeywords[1] ? 'Mirror the job language around ' + titleCase(missingKeywords[1]) + ' where it is truthful.' : 'Keep the summary focused on the target role.',
      'Quantify impact with metrics, scope, or business outcome for the top two relevant projects.'
    ];

    const store = readStore();
    addActivity(store, 'RESUME_MATCH_RUN', 'Resume match analyzed', 'Analyzed ' + resume.name + ' against a job description.', resume.id);
    writeStore(store);

    return { matchScore, matchedKeywords, missingKeywords, suggestions };
  }
};

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const extractKeywords = (value: string) => {
  const stopWords = new Set(['and', 'the', 'for', 'with', 'you', 'our', 'are', 'will', 'from', 'that', 'this', 'have', 'your', 'role', 'work', 'team']);
  const counts = value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .reduce<Record<string, number>>((acc, word) => {
      acc[word] = (acc[word] ?? 0) + 1;
      return acc;
    }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([keyword]) => keyword)
    .slice(0, 24);
};
