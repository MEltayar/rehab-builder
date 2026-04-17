import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Salad } from 'lucide-react';
import { useDietPlanStore } from '../../../store/dietPlanStore';
import { useClientStore } from '../../../store/clientStore';
import { usePlanStore } from '../../../store/planStore';
import { useToastStore } from '../../../store/toastStore';
import { useConfirmStore } from '../../../store/confirmStore';
import { LockedSection } from '../../../components/UpgradeLock';
import DietPlanCard from '../components/DietPlanCard';
import FoodFallAnimation from '../components/FoodFallAnimation';

const SAMPLE_PLANS = [
  { id: 's1', name: 'Ahmed — Weight Loss Plan',    goal: 'Lose 5kg in 8 weeks',    durationWeeks: 8,  targetCalories: 1800 },
  { id: 's2', name: 'Sara — Muscle Gain Diet',     goal: 'Build lean muscle mass',  durationWeeks: 12, targetCalories: 2600 },
  { id: 's3', name: 'Omar — Maintenance Nutrition', goal: 'Balanced macros',         durationWeeks: 4,  targetCalories: 2200 },
];

export default function DietPlansPage() {
  const canAccessDietPlans = usePlanStore((s) => s.limits().canAccessDietPlans);

  const initializePlans = useDietPlanStore((s) => s.initializeFromDB);
  const plans = useDietPlanStore((s) => s.plans);
  const plansLoaded = useDietPlanStore((s) => s.isLoaded);
  const deletePlan = useDietPlanStore((s) => s.deletePlan);

  const initializeClients = useClientStore((s) => s.initializeFromDB);
  const clients = useClientStore((s) => s.clients);
  const showToast = useToastStore((s) => s.showToast);
  const showConfirm = useConfirmStore((s) => s.showConfirm);

  useEffect(() => {
    if (!canAccessDietPlans) return; // Don't fetch if locked
    initializePlans();
    initializeClients();
  }, [canAccessDietPlans, initializePlans, initializeClients]);

  return (
    <div className="relative flex flex-col gap-4 min-h-screen">
      <FoodFallAnimation />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Page header — always visible */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <UtensilsCrossed size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Diet Plans</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage personalised nutrition plans for your clients.</p>
            </div>
          </div>
          {canAccessDietPlans && (
            <Link to="/diet-plans/new" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0">
              + New Diet Plan
            </Link>
          )}
        </div>

        {/* Content — locked or live */}
        {!canAccessDietPlans ? (
          <LockedSection locked feature="Diet Plans" tier="pro">
            {/* Sample teaser content */}
            <div className="flex flex-col gap-2">
              {SAMPLE_PLANS.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.goal} · {p.durationWeeks} weeks · {p.targetCalories} kcal/day</p>
                  </div>
                  <div className="w-16 h-7 rounded-md bg-emerald-100 dark:bg-emerald-900/30" />
                </div>
              ))}
            </div>
          </LockedSection>
        ) : !plansLoaded ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-400 dark:text-gray-500 text-sm">Loading diet plans…</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <Salad size={32} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No diet plans yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create a personalised nutrition plan for your first client.</p>
            </div>
            <Link
              to="/diet-plans/new"
              className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + Create First Diet Plan
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {plans.map((plan) => (
              <DietPlanCard
                key={plan.id}
                plan={plan}
                clients={clients}
                onDelete={() => showConfirm({
                  title: 'Delete Diet Plan',
                  message: `Are you sure you want to delete "${plan.name}"?`,
                  variant: 'danger',
                  onConfirm: async () => {
                    try {
                      await deletePlan(plan.id);
                    } catch {
                      showToast('Failed to delete diet plan. Please try again.', 'error');
                    }
                  },
                })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
