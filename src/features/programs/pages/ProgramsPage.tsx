import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useProgramStore } from '../../../store/programStore';
import { useClientStore } from '../../../store/clientStore';
import ProgramCard from '../components/ProgramCard';

export default function ProgramsPage() {
  const initializePrograms = useProgramStore((s) => s.initializeFromDB);
  const programs = useProgramStore((s) => s.programs);
  const isLoaded = useProgramStore((s) => s.isLoaded);
  const deleteProgram = useProgramStore((s) => s.deleteProgram);

  const initializeClients = useClientStore((s) => s.initializeFromDB);
  const clients = useClientStore((s) => s.clients);

  useEffect(() => {
    initializePrograms();
    initializeClients();
  }, [initializePrograms, initializeClients]);

  const sorted = [...programs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Programs</h1>
        <Link
          to="/programs/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          New Program
        </Link>
      </div>

      {!isLoaded ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-sm">Loading programs…</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <ClipboardList size={40} className="text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No programs yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Create your first program to get started
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              clients={clients}
              onDelete={() => {
                if (window.confirm(`Delete "${program.name}"?`)) {
                  deleteProgram(program.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
