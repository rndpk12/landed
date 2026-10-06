import type { LiteApplication, LiteApplicationInput } from '../types/application';
import { formatCompanyName } from './format';

const STORE_KEY = 'landed-lite.applications.v1';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `lite_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const read = (): LiteApplication[] => {
  try {
    const value = window.localStorage.getItem(STORE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.map((application) => ({ ...application, company: formatCompanyName(application.company ?? '') }))
      : [];
  } catch {
    return [];
  }
};

const write = (applications: LiteApplication[]) => {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(applications));
};

export const liteStore = {
  list: () => [...read()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
  get: (id: string) => read().find((application) => application.id === id),
  create: (input: LiteApplicationInput) => {
    const timestamp = new Date().toISOString();
    const application: LiteApplication = { ...input, company: formatCompanyName(input.company), id: createId(), createdAt: timestamp, updatedAt: timestamp };
    write([application, ...read()]);
    return application;
  },
  update: (id: string, input: LiteApplicationInput) => {
    const applications = read();
    const existing = applications.find((application) => application.id === id);
    if (!existing) return undefined;
    const updated = { ...existing, ...input, company: formatCompanyName(input.company), updatedAt: new Date().toISOString() };
    write(applications.map((application) => (application.id === id ? updated : application)));
    return updated;
  },
  remove: (id: string) => write(read().filter((application) => application.id !== id)),
  export: () => JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), applications: read() }, null, 2),
  import: (value: string) => {
    const parsed = JSON.parse(value) as { applications?: LiteApplication[] } | LiteApplication[];
    const applications = Array.isArray(parsed) ? parsed : parsed.applications;
    if (!Array.isArray(applications)) throw new Error('This backup does not contain applications.');
    write(applications);
    return applications.length;
  },
  clear: () => window.localStorage.removeItem(STORE_KEY)
};
