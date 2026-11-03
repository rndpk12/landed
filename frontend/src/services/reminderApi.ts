import axios from 'axios';
import { TOKEN_KEY } from '../lib/apiClient';
import type { Reminder, ReminderPayload } from '../types/reminder';

const reminderClient = axios.create({
  baseURL: (import.meta.env.VITE_REMINDER_API_BASE_URL as string | undefined)?.trim() || 'http://localhost:3001/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' }
});

reminderClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

reminderClient.interceptors.response.use(undefined, (error) => {
  const message = error.response?.data?.error?.message ?? error.response?.data?.message ?? error.message;
  return Promise.reject(new Error(message || 'Could not reach the reminder service.'));
});

export const reminderApi = {
  async list(): Promise<Reminder[]> {
    const response = await reminderClient.get<Reminder[]>('/reminders');
    return response.data;
  },
  async create(payload: ReminderPayload): Promise<Reminder> {
    const response = await reminderClient.post<Reminder>('/reminders', { reminder: {
      job_application_id: payload.jobApplicationId,
      message: payload.message,
      scheduled_at: payload.scheduledAt
    } });
    return response.data;
  },
  async update(id: string, payload: Partial<ReminderPayload>): Promise<Reminder> {
    const response = await reminderClient.patch<Reminder>('/reminders/' + id, { reminder: {
      message: payload.message,
      scheduled_at: payload.scheduledAt
    } });
    return response.data;
  },
  async remove(id: string): Promise<void> {
    await reminderClient.delete('/reminders/' + id);
  }
};
