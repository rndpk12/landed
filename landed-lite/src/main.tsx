import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { LiteAppShell } from './components/LiteAppShell';
import { LiteApplicationFormPage } from './pages/LiteApplicationFormPage';
import { LiteApplicationsPage } from './pages/LiteApplicationsPage';
import { LiteAtsMatchPage } from './pages/LiteAtsMatchPage';
import { LiteDashboardPage } from './pages/LiteDashboardPage';
import { LiteFeedbackPage } from './pages/LiteFeedbackPage';
import { LiteImportPage } from './pages/LiteImportPage';
import { LiteLandingPage } from './pages/LiteLandingPage';
import { LiteResumeVaultPage } from './pages/LiteResumeVaultPage';
import { LiteSettingsPage } from './pages/LiteSettingsPage';
import './index.css';

const shell = (page: React.ReactNode) => <LiteAppShell>{page}</LiteAppShell>;
const router = createBrowserRouter([
  { path: '/', element: <LiteLandingPage /> },
  { path: '/app', element: shell(<LiteDashboardPage />) },
  { path: '/import', element: shell(<LiteImportPage />) },
  { path: '/applications', element: shell(<LiteApplicationsPage />) },
  { path: '/applications/new', element: shell(<LiteApplicationFormPage />) },
  { path: '/applications/:id/edit', element: shell(<LiteApplicationFormPage />) },
  { path: '/resumes', element: shell(<LiteResumeVaultPage />) },
  { path: '/ats', element: shell(<LiteAtsMatchPage />) },
  { path: '/feedback', element: shell(<LiteFeedbackPage />) },
  { path: '/settings', element: shell(<LiteSettingsPage />) },
  { path: '*', element: <LiteLandingPage /> }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><RouterProvider router={router} /></React.StrictMode>);
