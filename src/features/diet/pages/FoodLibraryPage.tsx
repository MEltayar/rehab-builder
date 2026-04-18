import { useEffect, useMemo, useState } from 'react';
import type { FoodItem } from '../../../types';
import { Salad } from 'lucide-react';
import { useFoodStore } from '../../../store/foodStore';
import { useUserStore } from '../../../store/userStore';
import { usePlanStore } from '../../../store/planStore';
import { useToastStore } from '../../../store/toastStore';
import { useConfirmStore } from '../../../store/confirmStore';
import { LockedSection } from '../../../components/UpgradeLock';
import FoodCategoryTabs from '../components/FoodCategoryTabs';
import FoodSearch from '../components/FoodSearch';
import FoodTable from '../components/FoodTable';
import FoodModal from '../components/FoodModal';
import FoodFallAnimation from '../components/FoodFallAnimation';

export default function FoodLibraryPage() {
  const canAccessDietPlans = usePlanStore((s) => s.limits().canAccessDietPlans);

  const initializeFromDB = useFoodStore((s) => s.initializeFromDB);
  const isLoaded         = useFoodStore((s) => s.isLoaded);
  const allFoods         = useFoodStore((s) => s.foods);
  const searchTerm       = useFoodStore((s) => s.searchTerm);
  const selectedCategory = useFoodStore((s) => s.selectedCategory);
  const addFood          = useFoodStore((s) => s.addFood);
  const updateFood       = useFoodStore((s) => s.updateFood);
  const deleteFood       = useFoodStore((s) => s.deleteFood);

  const canEdit      = useUserStore((s) => s.canEdit);
  const showToast    = useToastStore((s) => s.showToast);
  const showConfirm  = useConfirmStore((s) => s.showConfirm);

  const [modalOpen, setModalOpen]       = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Always load food data — used as teaser content even for locked users
  useEffect(() => { initializeFromDB(); }, [initializeFromDB]);

  const foods = useMemo(() =>
    allFoods.filter((f) => {
      if (selectedCategory !== 'all') {
        if (selectedCategory.startsWith('other:')) {
          const customLabel = selectedCategory.slice(6);
          if (f.category !== 'other' || f.customCategory !== customLabel) return false;
        } else {
          if (f.category !== selectedCategory) return false;
        }
      }
      if (searchTerm && !f.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    }),
  [allFoods, selectedCategory, searchTerm]);

  const handleSave = async (data: Parameters<typeof addFood>[0]) => {
    try {
      if (selectedFood) await updateFood(selectedFood.id, data);
      else await addFood(data);
      setModalOpen(false);
      setSelectedFood(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('Failed to save food:', err);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="relative flex flex-col gap-4 min-h-screen">
      <FoodFallAnimation />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Page header — always visible */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <Salad size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Food Library</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Browse, search and compare nutritional values.</p>
            </div>
          </div>
          {canAccessDietPlans && (
            <button
              onClick={() => { setSelectedFood(null); setModalOpen(true); }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0"
            >
              + Add Food
            </button>
          )}
        </div>

        {/* Category tabs + search — always visible as hints */}
        <FoodCategoryTabs />
        <FoodSearch />

        {/* Food table — teaser-blurred if locked */}
        <LockedSection locked={!canAccessDietPlans} feature="Food Library" tier="pro">
          {!isLoaded ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Loading foods…</p>
            </div>
          ) : (
            <FoodTable
              foods={foods}
              onEdit={(food) => {
                if (!canAccessDietPlans || !canEdit(food.userId)) return undefined;
                return () => { setSelectedFood(food); setModalOpen(true); };
              }}
              onDelete={(food) => {
                if (!canAccessDietPlans || !food.isCustom || !canEdit(food.userId)) return undefined;
                return () => showConfirm({
                  title: 'Delete Food',
                  message: `Are you sure you want to delete "${food.name}"?`,
                  variant: 'danger',
                  onConfirm: async () => {
                    try {
                      await deleteFood(food.id);
                    } catch {
                      showToast('Failed to delete food item. Please try again.', 'error');
                    }
                  },
                });
              }}
            />
          )}
        </LockedSection>
      </div>

      {canAccessDietPlans && (
        <FoodModal
          food={selectedFood}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
