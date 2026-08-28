export interface ResumeMatchAnalyzePayload {
  resumeId: string;
  jobDescription: string;
}

export interface ResumeMatchAnalyzeResponse {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}
