import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Dumbbell } from 'lucide-react';
import { useProgramStore } from '../../../store/programStore';
import { useClientStore } from '../../../store/clientStore';
import { useProfileTerms } from '../../../hooks/useProfileTerms';
import { useToastStore } from '../../../store/toastStore';
import { useConfirmStore } from '../../../store/confirmStore';
import ProgramCard from '../components/ProgramCard';
import DumbbellAnimation from '../components/DumbbellAnimation';

export default function ProgramsPage() {
  const initializePrograms = useProgramStore((s) => s.initializeFromDB);
  const programs = useProgramStore((s) => s.programs);
  const isLoaded = useProgramStore((s) => s.isLoaded);
  const deleteProgram = useProgramStore((s) => s.deleteProgram);

  const initializeClients = useClientStore((s) => s.initializeFromDB);
  const clients = useClientStore((s) => s.clients);
  const terms = useProfileTerms();
  const showToast = useToastStore((s) => s.showToast);
  const showConfirm = useConfirmStore((s) => s.showConfirm);

  useEffect(() => {
    initializePrograms();
    initializeClients();
  }, [initializePrograms, initializeClients]);

  const sorted = [...programs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="relative flex flex-col gap-4 min-h-screen">
      <DumbbellAnimation count={18} />
      <div className="relative z-10 flex flex-col gap-4">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
              <ClipboardList size={20} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{terms.programLabel}s</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Build and manage programs for your clients.</p>
            </div>
          </div>
          <Link to="/programs/new" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0">
            + New {terms.programLabel}
          </Link>
        </div>

      {!isLoaded ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-sm">Loading programs…</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
            <Dumbbell size={32} className="text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No {terms.programLabel.toLowerCase()}s yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Build your first {terms.programLabel.toLowerCase()} and start training your clients.</p>
          </div>
          <Link to="/programs/new" className="mt-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + Create First {terms.programLabel}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              clients={clients}
              onDelete={() => showConfirm({
                title: 'Delete Program',
                message: `Are you sure you want to delete "${program.name}"? This cannot be undone.`,
                variant: 'danger',
                onConfirm: async () => {
                  try {
                    await deleteProgram(program.id);
                  } catch {
                    showToast('Failed to delete program. Please try again.', 'error');
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
