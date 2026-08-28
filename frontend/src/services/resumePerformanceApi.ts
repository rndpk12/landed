import { apiClient } from '../lib/apiClient';
import type { ResumePerformance } from '../types/resumePerformance';

export const resumePerformanceApi = {
  async list(): Promise<ResumePerformance[]> {
    const response = await apiClient.get<ResumePerformance[]>('/resume-performance');
    return response.data;
  }
};
