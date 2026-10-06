export const LITE_STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'] as const;

export type LiteStatus = (typeof LITE_STATUSES)[number];

export type LiteApplication = {
  id: string;
  company: string;
  role: string;
  jobUrl: string;
  location: string;
  description?: string;
  resumeId?: string;
  status: LiteStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type LiteApplicationInput = Omit<LiteApplication, 'id' | 'createdAt' | 'updatedAt'>;
