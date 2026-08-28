import { apiClient } from '../lib/apiClient';
import { localDataStore, shouldUseLocalDataFallback } from '../lib/localDataStore';
import type { Application, ApplicationPayload, ApplicationStatus } from '../types/application';
import type { PageResponse } from '../types/page';

type BackendApplicationStatus = 'SAVED' | 'APPLIED' | 'OA' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'ACCEPTED';

interface BackendResumeVersion {
  id: string;
  version: number;
  filename: string;
}

interface BackendApplicationResponse {
  id: string;
  company: string;
  role: string;
  jobUrl?: string | null;
  location?: string | null;
  jobDescription?: string | null;
  employmentType?: string | null;
  resumeVersion?: BackendResumeVersion | null;
  status: BackendApplicationStatus;
  notes?: string | null;
  appliedDate?: string | null;
  createdAt?: string;
}

interface BackendApplicationRequest {
  company: string;
  role: string;
  jobUrl?: string;
  location?: string;
  jobDescription?: string;
  employmentType?: string;
  resumeVersionId?: string;
  status: BackendApplicationStatus;
  notes?: string;
  appliedDate?: string;
}

const toBackendStatus: Record<ApplicationStatus, BackendApplicationStatus> = {
  Saved: 'SAVED',
  Applied: 'APPLIED',
  OA: 'OA',
  Interview: 'INTERVIEW',
  Offer: 'OFFER',
  Rejected: 'REJECTED',
  Accepted: 'ACCEPTED'
};

const fromBackendStatus: Record<BackendApplicationStatus, ApplicationStatus> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  OA: 'OA',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  ACCEPTED: 'Accepted'
};

const emptyToUndefined = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const resumeLabel = (resumeVersion?: BackendResumeVersion | null) => {
  if (!resumeVersion) {
    return 'Not selected';
  }

  return resumeVersion.filename || 'Resume v' + resumeVersion.version;
};

const mapApplication = (application: BackendApplicationResponse): Application => {
  const status = fromBackendStatus[application.status];
  const createdAt = application.createdAt ? new Date(application.createdAt).toLocaleString() : 'Created';

  return {
    id: application.id,
    company: application.company,
    role: application.role,
    jobUrl: application.jobUrl ?? undefined,
    location: application.location ?? undefined,
    jobDescription: application.jobDescription ?? undefined,
    employmentType: application.employmentType ?? undefined,
    resumeVersionId: application.resumeVersion?.id,
    resume: resumeLabel(application.resumeVersion),
    status,
    appliedDate: application.appliedDate ?? '',
    notes: application.notes ?? undefined,
    createdAt: application.createdAt,
    timeline: [
      {
        id: application.id + '-created',
        label: status === 'Saved' ? 'Saved role' : 'Application created',
        status,
        timestamp: createdAt
      }
    ]
  };
};

const mapPayload = (payload: ApplicationPayload): BackendApplicationRequest => ({
  company: payload.company.trim(),
  role: payload.role.trim(),
  jobUrl: emptyToUndefined(payload.jobUrl),
  location: emptyToUndefined(payload.location),
  jobDescription: emptyToUndefined(payload.jobDescription),
  employmentType: emptyToUndefined(payload.employmentType),
  resumeVersionId: emptyToUndefined(payload.resumeVersionId),
  status: toBackendStatus[payload.status],
  notes: emptyToUndefined(payload.notes),
  appliedDate: emptyToUndefined(payload.appliedDate)
});

export const applicationApi = {
  async list(): Promise<Application[]> {
    try {
      const response = await apiClient.get<BackendApplicationResponse[] | PageResponse<BackendApplicationResponse>>(
        '/applications',
        { params: { size: 100 } }
      );
      const applications = Array.isArray(response.data) ? response.data : response.data.content;
      return applications.map(mapApplication);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.listApplications();
      }

      throw error;
    }
  },
  async get(id: string): Promise<Application | undefined> {
    try {
      const applications = await this.list();
      return applications.find((application) => application.id === id);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.getApplication(id);
      }

      throw error;
    }
  },
  async create(payload: ApplicationPayload): Promise<Application> {
    try {
      const response = await apiClient.post<BackendApplicationResponse>('/applications', mapPayload(payload));
      return mapApplication(response.data);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.createApplication(payload);
      }

      throw error;
    }
  },
  async update(id: string, payload: ApplicationPayload): Promise<Application> {
    try {
      const response = await apiClient.put<BackendApplicationResponse>('/applications/' + id, mapPayload(payload));
      return mapApplication(response.data);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.updateApplication(id, payload);
      }

      throw error;
    }
  },
  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete('/applications/' + id);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        localDataStore.removeApplication(id);
        return;
      }

      throw error;
    }
  }
};
