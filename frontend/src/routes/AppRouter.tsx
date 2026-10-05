import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ApplicationDetailsPage } from '../pages/ApplicationDetailsPage';
import { ApplicationsPage } from '../pages/ApplicationsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { InterviewNotesPage } from '../pages/InterviewNotesPage';
import { LandingPage } from '../pages/LandingPage';
import { LiteLandingPage } from '../pages/lite/LiteLandingPage';
import { LiteAppShell } from '../lite/components/LiteAppShell';
import { LiteApplicationFormPage } from '../lite/pages/LiteApplicationFormPage';
import { LiteApplicationsPage } from '../lite/pages/LiteApplicationsPage';
import { LiteAtsMatchPage } from '../lite/pages/LiteAtsMatchPage';
import { LiteDashboardPage } from '../lite/pages/LiteDashboardPage';
import { LiteImportPage } from '../lite/pages/LiteImportPage';
import { LiteSettingsPage } from '../lite/pages/LiteSettingsPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ResumeMatchPage } from '../pages/ResumeMatchPage';
import { ResumeVaultPage } from '../pages/ResumeVaultPage';
import { SettingsPage } from '../pages/SettingsPage';

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/lite', element: <LiteLandingPage /> },
  { path: '/lite/app', element: <LiteAppShell><LiteDashboardPage /></LiteAppShell> },
  { path: '/lite/import', element: <LiteAppShell><LiteImportPage /></LiteAppShell> },
  { path: '/lite/applications', element: <LiteAppShell><LiteApplicationsPage /></LiteAppShell> },
  { path: '/lite/applications/new', element: <LiteAppShell><LiteApplicationFormPage /></LiteAppShell> },
  { path: '/lite/applications/:id/edit', element: <LiteAppShell><LiteApplicationFormPage /></LiteAppShell> },
  { path: '/lite/settings', element: <LiteAppShell><LiteSettingsPage /></LiteAppShell> },
  { path: '/lite/ats', element: <LiteAppShell><LiteAtsMatchPage /></LiteAppShell> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage />, handle: { title: 'Dashboard' } },
          { path: '/applications', element: <ApplicationsPage />, handle: { title: 'Applications' } },
          { path: '/applications/:id', element: <ApplicationDetailsPage />, handle: { title: 'Application Details' } },
          { path: '/resumes', element: <ResumeVaultPage />, handle: { title: 'Resume Vault' } },
          { path: '/resume-match', element: <ResumeMatchPage />, handle: { title: 'Resume Match' } },
          { path: '/interview-notes', element: <InterviewNotesPage />, handle: { title: 'Interview Notes' } },
          { path: '/analytics', element: <AnalyticsPage />, handle: { title: 'Analytics' } },
          { path: '/settings', element: <SettingsPage />, handle: { title: 'Settings' } }
        ]
      }
    ]
  },
  { path: '*', element: <NotFoundPage /> }
]);

export const AppRouter = () => <RouterProvider router={router} />;
