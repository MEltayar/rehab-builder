import { Link } from 'react-router-dom';
import { usePlanStore } from '../store/planStore';

export default function TrialBanner() {
  const isPro     = usePlanStore((s) => s.isPro());
  const daysLeft  = usePlanStore((s) => s.trialDaysLeft());
  const isLoaded  = usePlanStore((s) => s.isLoaded);

  if (!isLoaded || isPro || daysLeft === 0) return null;

  const urgent = daysLeft === 1;

  return (
    <div className={`shrink-0 flex items-center justify-between px-4 py-2 text-sm border-b ${
      urgent
        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
        : 'border-orange-200 dark:border-orange-800/50'
    }`}
      style={urgent ? undefined : { background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(220,38,38,0.06))' }}>
      <span className={urgent ? '' : 'text-orange-700 dark:text-orange-300'}>
        {urgent
          ? 'Last day of your free trial!'
          : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in your free trial.`}
      </span>
      <Link
        to="/pricing"
        className={`ml-4 font-semibold underline underline-offset-2 shrink-0 ${
          urgent ? 'text-red-700 dark:text-red-300' : 'text-orange-600 dark:text-orange-400'
        }`}
      >
        Upgrade now →
      </Link>
    </div>
  );
}
