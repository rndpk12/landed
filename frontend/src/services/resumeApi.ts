import { apiClient } from '../lib/apiClient';
import { localDataStore, shouldUseLocalDataFallback } from '../lib/localDataStore';
import type { Resume, ResumeUploadPayload, ResumeVersion, ResumeVersionUploadPayload } from '../types/resume';
import type { PageResponse } from '../types/page';

interface BackendResumeVersionResponse {
  id: string;
  version: number;
  filename: string;
  contentType: string;
  fileSize: number;
  sha256: string;
  createdAt: string;
}

interface BackendResumeResponse {
  id: string;
  name: string;
  tags: string[];
  applicationCount: number;
  versions: BackendResumeVersionResponse[];
  createdAt: string;
  updatedAt: string;
}

const formatDate = (value?: string) => {
  if (!value) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
};

const mapVersion = (version: BackendResumeVersionResponse): ResumeVersion => ({
  id: version.id,
  version: version.version,
  filename: version.filename,
  contentType: version.contentType,
  fileSize: version.fileSize,
  sha256: version.sha256,
  createdAt: version.createdAt
});

const mapResume = (resume: BackendResumeResponse): Resume => {
  const versions = [...resume.versions].map(mapVersion).sort((a, b) => b.version - a.version);
  const latestVersion = versions[0];
  const tags = Array.from(resume.tags ?? []);

  return {
    id: resume.id,
    name: resume.name,
    tags,
    version: latestVersion ? 'v' + latestVersion.version : 'v0',
    roleTag: tags[0] ?? 'General',
    uploadDate: formatDate(latestVersion?.createdAt ?? resume.createdAt),
    applications: resume.applicationCount,
    interviews: 0,
    conversionRate: 0,
    versions,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt
  };
};

const metadataBlob = (payload: ResumeUploadPayload) => {
  const tags = payload.roleTag.split(',').map((tag) => tag.trim()).filter(Boolean);
  return new Blob([JSON.stringify({ name: payload.name.trim(), tags })], { type: 'application/json' });
};

export const resumeApi = {
  async list(): Promise<Resume[]> {
    try {
      const response = await apiClient.get<BackendResumeResponse[] | PageResponse<BackendResumeResponse>>(
        '/resumes',
        { params: { size: 100 } }
      );
      const resumes = Array.isArray(response.data) ? response.data : response.data.content;
      return resumes.map(mapResume);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.listResumes();
      }

      throw error;
    }
  },
  async get(id: string): Promise<Resume> {
    try {
      const response = await apiClient.get<BackendResumeResponse>('/resumes/' + id);
      return mapResume(response.data);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.getResume(id);
      }

      throw error;
    }
  },
  async upload(payload: ResumeUploadPayload): Promise<Resume> {
    const formData = new FormData();
    formData.append('metadata', metadataBlob(payload));
    formData.append('file', payload.file[0]);

    try {
      const response = await apiClient.post<BackendResumeResponse>('/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return mapResume(response.data);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.uploadResume(payload);
      }

      throw error;
    }
  },
  async uploadVersion(payload: ResumeVersionUploadPayload): Promise<ResumeVersion> {
    const formData = new FormData();
    formData.append('file', payload.file);

    try {
      const response = await apiClient.post<BackendResumeVersionResponse>('/resumes/' + payload.resumeId + '/versions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return mapVersion(response.data);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.uploadResumeVersion(payload.resumeId, payload.file);
      }

      throw error;
    }
  },
  async downloadVersion(versionId: string): Promise<void> {
    try {
      const response = await apiClient.get<Blob>('/resumes/versions/' + versionId + '/download', { responseType: 'blob' });
      const disposition = response.headers['content-disposition'];
      const filename = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition ?? '')?.[1] ?? 'resume.pdf';
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = decodeURIComponent(filename.replace(/"/g, ''));
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        throw new Error('Local resume records keep metadata only, so there is no PDF file to download.');
      }

      throw error;
    }
  },
  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete('/resumes/' + id);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        localDataStore.removeResume(id);
        return;
      }

      throw error;
    }
  }
};
