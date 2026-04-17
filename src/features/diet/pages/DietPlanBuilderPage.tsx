import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Save, ChevronLeft } from 'lucide-react';
import { useToastStore } from '../../../store/toastStore';
import { useDietPlanStore } from '../../../store/dietPlanStore';
import { useClientStore } from '../../../store/clientStore';
import { useFoodStore } from '../../../store/foodStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { usePlanStore } from '../../../store/planStore';
import { getCombinedTemplate } from '../../config/data/exportTemplates';
import { sumMacros, calcItemMacros } from '../utils/macros';
import DietMetaForm from '../components/DietMetaForm';
import DietDayCard from '../components/DietDayCard';
import ExportDropdown from '../../pdf/components/ExportDropdown';
import SendPanel from '../../pdf/components/SendPanel';
import { generateDietPlanPDFBlob, downloadDietPlanPDF, exportDietPlanExcel } from '../services/dietExportService';
import { shareFile } from '../../pdf/services/shareService';

export default function DietPlanBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const showToast = useToastStore((s) => s.showToast);
  const planLimits = usePlanStore((s) => s.limits)();
  const planLoaded = usePlanStore((s) => s.isLoaded);
  useEffect(() => {
    if (planLoaded && !planLimits.canAccessDietPlans) navigate('/pricing', { replace: true });
  }, [planLoaded, planLimits.canAccessDietPlans, navigate]);

  const plans = useDietPlanStore((s) => s.plans);
  const isLoaded = useDietPlanStore((s) => s.isLoaded);
  const draft = useDietPlanStore((s) => s.draft);
  const initializePlans = useDietPlanStore((s) => s.initializeFromDB);
  const startNewDraft = useDietPlanStore((s) => s.startNewDraft);
  const loadDraftFromPlan = useDietPlanStore((s) => s.loadDraftFromPlan);
  const clearDraft = useDietPlanStore((s) => s.clearDraft);
  const saveDraft = useDietPlanStore((s) => s.saveDraft);
  const setDraftField = useDietPlanStore((s) => s.setDraftField);
  const addDay = useDietPlanStore((s) => s.addDay);
  const updateDayLabel = useDietPlanStore((s) => s.updateDayLabel);
  const deleteDay = useDietPlanStore((s) => s.deleteDay);
  const addMeal = useDietPlanStore((s) => s.addMeal);
  const updateMealLabel = useDietPlanStore((s) => s.updateMealLabel);
  const deleteMeal = useDietPlanStore((s) => s.deleteMeal);
  const addFoodToMeal = useDietPlanStore((s) => s.addFoodToMeal);
  const updateMealItemQuantity = useDietPlanStore((s) => s.updateMealItemQuantity);
  const removeFoodFromMeal = useDietPlanStore((s) => s.removeFoodFromMeal);

  const clients = useClientStore((s) => s.clients);
  const clientsLoaded = useClientStore((s) => s.isLoaded);
  const initializeClients = useClientStore((s) => s.initializeFromDB);

  const foods = useFoodStore((s) => s.foods);
  const foodsLoaded = useFoodStore((s) => s.isLoaded);
  const initializeFoods = useFoodStore((s) => s.initializeFromDB);

  const clinicName       = useSettingsStore((s) => s.clinicName);
  const clinicLogo       = useSettingsStore((s) => s.clinicLogo);
  const clinicPhone      = useSettingsStore((s) => s.clinicPhone);
  const clinicEmail      = useSettingsStore((s) => s.clinicEmail);
  const clinicAddress    = useSettingsStore((s) => s.clinicAddress);
  const clinicWebsite    = useSettingsStore((s) => s.clinicWebsite);
  const therapistName    = useSettingsStore((s) => s.therapistName);
  const clinicInstagram  = useSettingsStore((s) => s.clinicInstagram);
  const clinicFacebook   = useSettingsStore((s) => s.clinicFacebook);
  const clinicGmail      = useSettingsStore((s) => s.clinicGmail);
  const clinicWhatsApp   = useSettingsStore((s) => s.clinicWhatsApp);
  const exportTemplateId = useSettingsStore((s) => s.exportTemplateId);
  const exportPaletteId  = useSettingsStore((s) => s.exportPaletteId);
  const exportTemplate   = getCombinedTemplate(exportTemplateId, exportPaletteId);
  const clinic = { clinicName, clinicLogo, clinicPhone, clinicEmail, clinicAddress, clinicWebsite, therapistName, clinicInstagram, clinicFacebook, clinicGmail, clinicWhatsApp };

  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [saving, setSaving]       = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notFound, setNotFound]   = useState(false);
  const [sendOption, setSendOption] = useState<'email' | 'whatsapp' | null>(null);

  // Build a map for O(1) food lookups
  const foodMap = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods]);

  useEffect(() => {
    if (!clientsLoaded) initializeClients();
    if (!foodsLoaded) initializeFoods();
  }, [clientsLoaded, foodsLoaded, initializeClients, initializeFoods]);

  useEffect(() => {
    if (!id) {
      startNewDraft('');
      return;
    }
    if (!isLoaded) {
      initializePlans().then(() => {
        const plan = useDietPlanStore.getState().plans.find((p) => p.id === id);
        if (plan) loadDraftFromPlan(plan);
        else setNotFound(true);
      });
    } else {
      const plan = plans.find((p) => p.id === id);
      if (plan) loadDraftFromPlan(plan);
      else setNotFound(true);
    }
    return () => clearDraft();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!draft?.clientId) errs.clientId = 'Select a client';
    if (!draft?.name?.trim()) errs.name = 'Plan name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await saveDraft();
      showToast('Diet plan saved successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save diet plan. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Export helpers
  const clientName = useMemo(() => {
    if (!draft?.clientId) return '';
    return clients.find((c) => c.id === draft.clientId)?.name ?? '';
  }, [draft?.clientId, clients]);

  const handleExportPDF = async () => {
    if (!draft) return;
    setExporting(true);
    try { await downloadDietPlanPDF(draft, clientName, foodMap, clinic, exportTemplate); }
    catch (e) { console.error(e); showToast('PDF export failed. Please try again.', 'error'); }
    finally { setExporting(false); }
  };

  const handleExportExcel = async () => {
    if (!draft) return;
    setExporting(true);
    try { await exportDietPlanExcel(draft, clientName, foodMap, clinic, exportTemplate); }
    catch (e) { console.error(e); showToast('Excel export failed. Please try again.', 'error'); }
    finally { setExporting(false); }
  };

  const handleSendShare = async (channel: 'email' | 'whatsapp', text: string, subject?: string) => {
    if (!draft) return;
    setExporting(true);
    try {
      const { blob, filename } = await generateDietPlanPDFBlob(draft, clientName, foodMap, clinic, exportTemplate);
      const client = clients.find((c) => c.id === draft.clientId);
      await shareFile({
        channel,
        blob,
        filename,
        title: subject ?? draft.name,
        text,
        recipientPhone: client?.phone,
      });
    } catch (e) { console.error(e); showToast('Failed to prepare file. Please try again.', 'error'); }
    finally { setExporting(false); setSendOption(null); }
  };

  const defaultEmailBody = draft
    ? `Hi ${clientName || 'there'},\n\nPlease find your diet plan "${draft.name}" attached.\n\nGoal: ${draft.goal || '—'}\n\nBest regards,\n${therapistName || clinicName || ''}`
    : '';
  const defaultWhatsAppBody = draft
    ? `Hi ${clientName || 'there'}! 🥗 Your diet plan "${draft.name}" is ready. Goal: ${draft.goal || '—'}. Please check the attached PDF. — ${therapistName || clinicName || ''}`
    : '';

  // Plan-wide macro totals
  const planTotals = useMemo(() => {
    if (!draft) return null;
    const allItems = draft.days.flatMap((d) => d.meals.flatMap((m) => m.items));
    const macros = allItems.map((item) => {
      const food = foodMap.get(item.foodItemId);
      return food ? calcItemMacros(item, food) : null;
    }).filter(Boolean) as ReturnType<typeof calcItemMacros>[];
    if (macros.length === 0) return null;
    const totals = sumMacros(macros);
    const days = draft.days.length || 1;
    return {
      perDay: {
        calories: Math.round(totals.calories / days),
        protein:  Math.round(totals.protein  / days * 10) / 10,
        carbs:    Math.round(totals.carbs    / days * 10) / 10,
        fat:      Math.round(totals.fat      / days * 10) / 10,
      },
    };
  }, [draft, foodMap]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-gray-500 dark:text-gray-400">Diet plan not found.</p>
        <button onClick={() => navigate('/diet-plans')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shadow-sm">
          <ChevronLeft size={15} /> Back to Diet Plans
        </button>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {id ? 'Edit Diet Plan' : 'New Diet Plan'}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <ExportDropdown
            disabled={exporting || !draft?.days.length}
            loading={exporting}
            onSelectPDF={handleExportPDF}
            onSelectExcel={handleExportExcel}
            onSelectEmail={() => setSendOption('email')}
            onSelectWhatsApp={() => setSendOption('whatsapp')}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Save size={15} />
            {saving ? 'Saving…' : 'Save Plan'}
          </button>
        </div>
      </div>

      {/* Send panel */}
      {sendOption && draft && (
        <SendPanel
          option={sendOption}
          clientEmail={clients.find((c) => c.id === draft.clientId)?.email}
          clientPhone={clients.find((c) => c.id === draft.clientId)?.phone}
          clientId={draft.clientId || undefined}
          defaultEmailSubject={`Diet Plan: ${draft.name}`}
          defaultEmailBody={defaultEmailBody}
          defaultWhatsAppBody={defaultWhatsAppBody}
          isSending={exporting}
          onSendEmail={(subject, body) => handleSendShare('email', body, subject)}
          onSendWhatsApp={(body) => handleSendShare('whatsapp', body)}
          onClose={() => setSendOption(null)}
        />
      )}

      {/* Meta form */}
      <DietMetaForm
        draft={draft}
        clients={clients}
        errors={errors}
        onChange={setDraftField}
      />

      {/* Avg daily macros summary */}
      {planTotals && (
        <div className="flex flex-wrap gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Avg per day:</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">{planTotals.perDay.calories} kcal</span>
          <span className="text-red-600 dark:text-red-400">Protein {planTotals.perDay.protein}g</span>
          <span className="text-yellow-600 dark:text-yellow-400">Carbs {planTotals.perDay.carbs}g</span>
          <span className="text-purple-600 dark:text-purple-400">Fat {planTotals.perDay.fat}g</span>
          {draft.targetCalories && (
            <span className="text-gray-400 dark:text-gray-500 ml-auto text-xs">
              Target: {draft.targetCalories} kcal
            </span>
          )}
        </div>
      )}

      {/* Days */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Days <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">({draft.days.length})</span>
          </h2>
          <button
            onClick={addDay}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-md transition-colors border border-green-200 dark:border-green-800"
          >
            <Plus size={14} />
            Add Day
          </button>
        </div>

        {draft.days.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl gap-3">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No days yet.</p>
            <button
              onClick={addDay}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
            >
              <Plus size={14} />
              Add First Day
            </button>
          </div>
        ) : (
          draft.days.map((day) => (
            <DietDayCard
              key={day.id}
              day={day}
              foodMap={foodMap}
              onLabelChange={(label) => updateDayLabel(day.id, label)}
              onDelete={() => deleteDay(day.id)}
              onAddMeal={() => addMeal(day.id)}
              onMealLabelChange={(mealId, label) => updateMealLabel(day.id, mealId, label)}
              onDeleteMeal={(mealId) => deleteMeal(day.id, mealId)}
              onAddFood={(mealId, food, qty, multiplier, label) => addFoodToMeal(day.id, mealId, food.id, qty, multiplier, label)}
              onUpdateQuantity={(mealId, itemId, qty) => updateMealItemQuantity(day.id, mealId, itemId, qty)}
              onRemoveItem={(mealId, itemId) => removeFoodFromMeal(day.id, mealId, itemId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
