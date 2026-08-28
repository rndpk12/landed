import { apiClient } from '../lib/apiClient';
import { localDataStore, shouldUseLocalDataFallback } from '../lib/localDataStore';
import type { InterviewNote, InterviewNotePayload } from '../types/interviewNote';

export const interviewNoteApi = {
  async list(applicationId: string): Promise<InterviewNote[]> {
    try {
      const response = await apiClient.get<InterviewNote[]>('/applications/' + applicationId + '/interview-notes');
      return response.data;
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.listNotes(applicationId);
      }

      throw error;
    }
  },
  async create(applicationId: string, payload: InterviewNotePayload): Promise<InterviewNote> {
    try {
      const response = await apiClient.post<InterviewNote>('/applications/' + applicationId + '/interview-notes', payload);
      return response.data;
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.createNote(applicationId, payload);
      }

      throw error;
    }
  },
  async update(id: string, payload: InterviewNotePayload): Promise<InterviewNote> {
    try {
      const response = await apiClient.put<InterviewNote>('/interview-notes/' + id, payload);
      return response.data;
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        return localDataStore.updateNote(id, payload);
      }

      throw error;
    }
  },
  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete('/interview-notes/' + id);
    } catch (error) {
      if (shouldUseLocalDataFallback(error)) {
        localDataStore.removeNote(id);
        return;
      }

      throw error;
    }
  }
};
