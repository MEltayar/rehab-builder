import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import NotFoundPage from './components/layout/NotFoundPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ExercisesPage from './features/exercises/pages/ExercisesPage';
import ClientsPage from './features/clients/pages/ClientsPage';
import ClientProfilePage from './features/clients/pages/ClientProfilePage';
import ProgramsPage from './features/programs/pages/ProgramsPage';
import ProgramBuilderPage from './features/programs/pages/ProgramBuilderPage';
import ProgramPreviewPage from './features/programs/pages/ProgramPreviewPage';
import TemplatesPage from './features/templates/pages/TemplatesPage';
import TemplateEditorPage from './features/templates/pages/TemplateEditorPage';
import ConfigPage from './features/config/pages/ConfigPage';
import TemplateLibraryPage from './features/template-library/pages/TemplateLibraryPage';
import HelpPage from './features/help/pages/HelpPage';
import { useSettingsStore } from './store/settingsStore';
import { useTemplateStore } from './store/templateStore';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'exercises', element: <ExercisesPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'clients/:id', element: <ClientProfilePage /> },
      { path: 'programs', element: <ProgramsPage /> },
      { path: 'programs/new', element: <ProgramBuilderPage /> },
      { path: 'programs/:id/edit', element: <ProgramBuilderPage /> },
      { path: 'programs/:id/preview', element: <ProgramPreviewPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'templates/:id/edit', element: <TemplateEditorPage /> },
      { path: 'config', element: <ConfigPage /> },
      { path: 'template-library', element: <TemplateLibraryPage /> },
      { path: 'help', element: <HelpPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  const initializeFromDB = useSettingsStore((s) => s.initializeFromDB);
  const initializeTemplates = useTemplateStore((s) => s.initializeFromDB);

  useEffect(() => {
    initializeFromDB();
    initializeTemplates();
  }, [initializeFromDB, initializeTemplates]);

  return <RouterProvider router={router} />;
}
