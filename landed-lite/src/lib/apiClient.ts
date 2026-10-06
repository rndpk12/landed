import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message
      ?? (error.code === 'ECONNABORTED' ? 'The import service took too long to respond. Please try again.' : undefined)
      ?? (error.message === 'Network Error' ? 'Could not reach the Lite import service. Please try again in a moment.' : undefined)
      ?? error.message;
    return Promise.reject(new Error(message));
  }
);
