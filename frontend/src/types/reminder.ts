import type { Application } from './application';

export type ReminderStatus = 'scheduled' | 'processing' | 'processed' | 'failed' | 'cancelled';

export interface Reminder {
  id: string;
  jobApplicationId: string;
  userId: string;
  message: string;
  scheduledAt: string;
  status: ReminderStatus;
  processedAt?: string | null;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
  application?: Pick<Application, 'id' | 'company' | 'role' | 'location'> | null;
}

export interface ReminderPayload {
  jobApplicationId: string;
  message: string;
  scheduledAt: string;
}
