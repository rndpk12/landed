import { apiClient } from '../lib/apiClient';
import type { JobImportPayload, JobImportResponse } from '../types/jobImport';

export const jobImportApi = {
  async importJob(payload: JobImportPayload): Promise<JobImportResponse> {
    const response = await apiClient.post<JobImportResponse>('/job-import', payload);
    return response.data;
  }
};
