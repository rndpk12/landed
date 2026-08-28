export type ApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'OA'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Accepted';

export interface Application {
  id: string;
  company: string;
  role: string;
  jobUrl?: string;
  location?: string;
  jobDescription?: string;
  employmentType?: string;
  resumeVersionId?: string;
  resume: string;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string;
  timeline: ApplicationTimelineEvent[];
  createdAt?: string;
}

export interface ApplicationTimelineEvent {
  id: string;
  label: string;
  status: ApplicationStatus;
  timestamp: string;
}

export interface ApplicationPayload {
  company: string;
  role: string;
  jobUrl?: string;
  location?: string;
  jobDescription?: string;
  employmentType?: string;
  resumeVersionId?: string;
  status: ApplicationStatus;
  notes?: string;
  appliedDate: string;
  resume?: string;
}
