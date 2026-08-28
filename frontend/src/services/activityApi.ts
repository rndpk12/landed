import { apiClient } from '../lib/apiClient';
import { localDataStore, shouldUseLocalDataFallback } from '../lib/localDataStore';
import type { Activity } from '../types/activity';

interface BackendActivityResponse {
  id: string;
  type: Activity['type'];
  title: string;
  description: string;
  entityId?: string | null;
  occurredAt: string;
}

const mapActivity = (activity: BackendActivityResponse): Activity => ({
  id: activity.id,
  type: activity.type,
  title: activity.title,
  description: activity.description,
  entityId: activity.entityId ?? null,
  occurredAt: activity.occurredAt
});

export const activityApi = {
  async list(): Promise<Activity[]> {
    try {
      const response = await apiClient.get<BackendActivityResponse[]>('/activities');
      return response.data
        .map(mapActivity)
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.listActivities();
      }

      throw error;
    }
  }
};
