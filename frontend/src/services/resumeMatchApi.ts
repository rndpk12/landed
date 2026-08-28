import { apiClient } from '../lib/apiClient';
import type { ResumeMatchAnalyzePayload, ResumeMatchAnalyzeResponse } from '../types/resumeMatch';

export const resumeMatchApi = {
  async analyze(payload: ResumeMatchAnalyzePayload): Promise<ResumeMatchAnalyzeResponse> {
    const response = await apiClient.post<ResumeMatchAnalyzeResponse>('/resume-match/analyze', payload);
    return response.data;
  }
};
