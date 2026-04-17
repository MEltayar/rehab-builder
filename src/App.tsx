import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import NotFoundPage from './components/layout/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PricingPage from './pages/PricingPage';
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
import HelpPage from './features/help/pages/HelpPage';
import AdminPage from './features/admin/pages/AdminPage';
import FoodLibraryPage from './features/diet/pages/FoodLibraryPage';
import DietPlansPage from './features/diet/pages/DietPlansPage';
import DietPlanBuilderPage from './features/diet/pages/DietPlanBuilderPage';
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';
import { useTemplateStore } from './store/templateStore';
import { usePlanStore } from './store/planStore';
import { useUserStore } from './store/userStore';
import { useClientStore } from './store/clientStore';
import { useProgramStore } from './store/programStore';
import { seedDatabase } from './db/seed';
import ErrorBoundary from './components/ErrorBoundary';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/pricing', element: <PricingPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
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
      { path: 'food-library', element: <FoodLibraryPage /> },
      { path: 'diet-plans', element: <DietPlansPage /> },
      { path: 'diet-plans/new', element: <DietPlanBuilderPage /> },
      { path: 'diet-plans/:id/edit', element: <DietPlanBuilderPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const initializeSettings = useSettingsStore((s) => s.initializeFromDB);
  const initializeTemplates = useTemplateStore((s) => s.initializeFromDB);
  const fetchSubscription = usePlanStore((s) => s.fetchSubscription);
  const resetPlan = usePlanStore((s) => s.reset);
  const initializeUser = useUserStore((s) => s.initialize);
  const resetUser = useUserStore((s) => s.reset);
  const resetSettings = useSettingsStore((s) => s.reset);
  const initializeClients = useClientStore((s) => s.initializeFromDB);
  const initializePrograms = useProgramStore((s) => s.initializeFromDB);

  // Initialize auth once on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // When user signs out (user → null), reset all user-specific stores so the
  // next sign-in starts fresh and doesn't flash the previous user's UI.
  useEffect(() => {
    if (user) return;
    resetUser();
    resetPlan();
    resetSettings();
  }, [user, resetUser, resetPlan, resetSettings]);

  // Initialize all stores + seed as soon as the user is known — all in parallel
  // so the dashboard has its data ready by the time the gate opens.
  useEffect(() => {
    if (!user) return;
    initializeSettings();
    initializeTemplates();
    initializeUser();
    fetchSubscription();
    initializeClients();
    initializePrograms();
    seedDatabase().catch((err) => console.error('[seed] Failed:', err));
  }, [user, initializeSettings, initializeTemplates, initializeUser, fetchSubscription,
      initializeClients, initializePrograms]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
