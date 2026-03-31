import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, BookTemplate } from 'lucide-react';
import { useToastStore } from '../../../store/toastStore';
import { useProgramStore } from '../../../store/programStore';
import { useClientStore } from '../../../store/clientStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useTemplateStore } from '../../../store/templateStore';
import ProgramMetaForm from '../components/ProgramMetaForm';
import SessionList from '../components/SessionList';
import ExercisePicker from '../components/ExercisePicker';
import SaveAsTemplateModal from '../../templates/components/SaveAsTemplateModal';

export default function ProgramBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const programs = useProgramStore((s) => s.programs);
  const isLoaded = useProgramStore((s) => s.isLoaded);
  const draft = useProgramStore((s) => s.draft);
  const initializePrograms = useProgramStore((s) => s.initializeFromDB);
  const startNewDraft = useProgramStore((s) => s.startNewDraft);
  const loadDraftFromProgram = useProgramStore((s) => s.loadDraftFromProgram);
  const loadDraftFromTemplate = useProgramStore((s) => s.loadDraftFromTemplate);
  const clearDraft = useProgramStore((s) => s.clearDraft);

  const templatesList = useTemplateStore((s) => s.templates);
  const saveDraft = useProgramStore((s) => s.saveDraft);
  const setDraftField = useProgramStore((s) => s.setDraftField);
  const addSession = useProgramStore((s) => s.addSession);
  const updateSessionLabel = useProgramStore((s) => s.updateSessionLabel);
  const deleteSession = useProgramStore((s) => s.deleteSession);
  const addExerciseToSession = useProgramStore((s) => s.addExerciseToSession);
  const updateExerciseParams = useProgramStore((s) => s.updateExerciseParams);
  const removeExerciseFromSession = useProgramStore((s) => s.removeExerciseFromSession);
  const reorderExercisesInSession = useProgramStore((s) => s.reorderExercisesInSession);
  const deleteProgramAction = useProgramStore((s) => s.deleteProgram);

  const clients = useClientStore((s) => s.clients);
  const clientsLoaded = useClientStore((s) => s.isLoaded);
  const initializeClients = useClientStore((s) => s.initializeFromDB);

  const exercisesLoaded = useExerciseStore((s) => s.isLoaded);
  const initializeExercises = useExerciseStore((s) => s.initializeFromDB);

  const showToast = useToastStore((s) => s.showToast);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);

  useEffect(() => {
    if (!clientsLoaded) initializeClients();
    if (!exercisesLoaded) initializeExercises();
  }, [clientsLoaded, exercisesLoaded, initializeClients, initializeExercises]);

  useEffect(() => {
    if (!id) {
      const templateId = searchParams.get('template');
      if (templateId) {
        const template = templatesList.find((t) => t.id === templateId);
        if (template) {
          loadDraftFromTemplate(template);
        } else {
          startNewDraft('');
        }
      } else {
        startNewDraft('');
      }
    } else {
      if (!isLoaded) {
        initializePrograms();
      }
    }
    return () => clearDraft();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (id && isLoaded) {
      const program = programs.find((p) => p.id === id);
      if (program) {
        loadDraftFromProgram(program);
      } else {
        setNotFound(true);
      }
    }
  }, [id, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-gray-700 dark:text-gray-300 font-medium">Program not found</p>
        <Link to="/programs" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Programs
        </Link>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  function validate(): boolean {
    if (!draft) return false;
    const e: Record<string, string> = {};
    if (!draft.clientId) e.clientId = 'Please select a client.';
    if (!draft.name.trim()) e.name = 'Program name is required.';
    if (!draft.condition.trim()) e.condition = 'Condition is required.';
    if (!draft.goal.trim()) e.goal = 'Goal is required.';
    if (
      !Number.isInteger(draft.durationWeeks) ||
      draft.durationWeeks < 1 ||
      draft.durationWeeks > 52
    ) {
      e.durationWeeks = 'Duration must be a whole number between 1 and 52.';
    }
    if (!draft.startDate) e.startDate = 'Start date is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!draft || !validate()) return;
    setSaving(true);
    try {
      const savedId = draft.id;
      await saveDraft();
      if (!id) {
        navigate(`/programs/${savedId}/edit`, { replace: true });
      }
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Failed to save program. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !draft) return;
    if (window.confirm(`Delete "${draft.name}"?`)) {
      await deleteProgramAction(id);
      navigate('/programs');
    }
  }

  const isEditMode = Boolean(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEditMode ? 'Edit Program' : 'New Program'}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSaveAsTemplateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <BookTemplate size={14} />
            Save as Template
          </button>
          {isEditMode && (
            <Link
              to={`/programs/${id}/preview`}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Preview
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
        <ProgramMetaForm
          draft={draft}
          clients={clients}
          errors={errors}
          onChange={(field, value) =>
            setDraftField(
              field as Parameters<typeof setDraftField>[0],
              value
            )
          }
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sessions</h2>
          <button
            onClick={addSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Plus size={15} />
            Add Session
          </button>
        </div>

        <SessionList
          sessions={draft.sessions}
          onUpdateLabel={updateSessionLabel}
          onDeleteSession={deleteSession}
          onAddExercise={(sessionId) => {
            setActiveSessionId(sessionId);
            setPickerOpen(true);
          }}
          onUpdateParams={updateExerciseParams}
          onRemoveExercise={removeExerciseFromSession}
          onReorder={reorderExercisesInSession}
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          <Link
            to="/programs"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          {isEditMode && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete Program
            </button>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); setActiveSessionId(null); }}
        onSelect={(exerciseId) => {
          if (activeSessionId) addExerciseToSession(activeSessionId, exerciseId);
        }}
      />

      <SaveAsTemplateModal
        isOpen={saveAsTemplateOpen}
        onClose={() => setSaveAsTemplateOpen(false)}
        sessions={draft.sessions}
        defaultName={draft.name}
        defaultCondition={draft.condition}
      />
    </div>
  );
}
