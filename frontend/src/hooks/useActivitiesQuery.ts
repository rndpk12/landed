import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../services/activityApi';

export const activitiesQueryKey = ['activities'] as const;

export const useActivitiesQuery = () => (
  useQuery({
    queryKey: activitiesQueryKey,
    queryFn: activityApi.list
  })
);
