import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import { usePlanStore } from '../store/planStore';

const LOAD_TIMEOUT_MS = 10_000;

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user            = useAuthStore((s) => s.user);
  const isLoaded        = useAuthStore((s) => s.isLoaded);
  const profileType     = useSettingsStore((s) => s.profileType);
  const settingsLoaded  = useSettingsStore((s) => s.isLoaded);
  const userStoreLoaded = useUserStore((s) => s.isLoaded);
  const planStoreLoaded = usePlanStore((s) => s.isLoaded);
  const [timedOut, setTimedOut] = useState(false);

  // Wait for all stores that affect feature gating — prevents flash of trial UI for admins
  const fullyLoaded = isLoaded && (
    !user || (settingsLoaded && userStoreLoaded && planStoreLoaded)
  );

  useEffect(() => {
    if (fullyLoaded) return;
    const t = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [fullyLoaded]);

  // Loading — show spinner, or error if it took too long
  if (!fullyLoaded) {
    if (timedOut) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4 bg-gray-50 dark:bg-gray-900">
          <div className="text-4xl">⚡</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Taking too long</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Something went wrong while loading. Please refresh.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  // No user → login
  if (!user) return <Navigate to="/login" replace />;

  // No profile type → onboarding
  if (!profileType) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}
