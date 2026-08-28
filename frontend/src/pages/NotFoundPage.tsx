import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card">
      <p className="text-sm font-semibold text-primary-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Page not found</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">This page wandered off somewhere between an OA invite and a recruiter follow-up.</p>
      <Link className="btn-primary mt-6" to="/dashboard">Go to dashboard</Link>
    </section>
  </main>
);
