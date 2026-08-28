export interface InterviewNote {
  id: string;
  applicationId: string;
  roundNumber: number;
  interviewDate?: string | null;
  questionsAsked?: string | null;
  notes?: string | null;
  outcome?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewNotePayload {
  roundNumber: number;
  interviewDate?: string;
  questionsAsked?: string;
  notes?: string;
  outcome?: string;
}
