import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  Dumbbell,
  Library,
  Plus,
  Settings,
  ChevronRight,
  CalendarDays,
  AlertCircle,
  FileText,
  UserPlus,
} from 'lucide-react';
import { useClientStore } from '../../../store/clientStore';
import { useProgramStore } from '../../../store/programStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { useTemplateStore } from '../../../store/templateStore';

// ── Helpers ───────────────────────────────────────────────

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return fmtDate(iso);
}

// ── Sub-components ────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;       // Tailwind bg class for icon bg
  textColor: string;   // Tailwind text class for icon
  to: string;
}

function StatCard({ label, value, icon: Icon, color, textColor, to }: StatCardProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className={textColor} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function DashboardPage() {
  const { clients, isLoaded: clientsLoaded, initializeFromDB: initClients } = useClientStore();
  const { programs, isLoaded: programsLoaded, initializeFromDB: initPrograms } = useProgramStore();
  const { exercises, isLoaded: exercisesLoaded, initializeFromDB: initExercises } = useExerciseStore();
  const { templates, isLoaded: templatesLoaded, initializeFromDB: initTemplates } = useTemplateStore();
  const { clinicName, therapistName, isLoaded: settingsLoaded } = useSettingsStore();

  useEffect(() => {
    if (!clientsLoaded)   initClients();
    if (!programsLoaded)  initPrograms();
    if (!exercisesLoaded) initExercises();
    if (!templatesLoaded) initTemplates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived ──────────────────────────────────────────────
  const recentPrograms = useMemo(
    () =>
      [...programs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [programs],
  );

  const recentClients = useMemo(
    () =>
      [...clients]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [clients],
  );

  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c.name])), [clients]);

  const programCountByClient = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of programs) {
      map.set(p.clientId, (map.get(p.clientId) ?? 0) + 1);
    }
    return map;
  }, [programs]);

  const isLoading = !clientsLoaded || !programsLoaded || !exercisesLoaded;
  const isSetupIncomplete = settingsLoaded && !clinicName;
  const hasNoData = clientsLoaded && programsLoaded && clients.length === 0 && programs.length === 0;

  const greeting = therapistName ? `Welcome, Dr. ${therapistName.split(' ')[0]}` : 'Welcome back';

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{greeting}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {clinicName || 'Rehab Program Builder'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Setup banner */}
      {isSetupIncomplete && (
        <Link
          to="/config"
          className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-5 py-3 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
        >
          <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Clinic profile is incomplete</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Add your clinic name and logo so exports look professional.</p>
          </div>
          <ChevronRight size={16} className="text-amber-500 shrink-0" />
        </Link>
      )}

      {/* Stats row */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Clients"   value={clients.length}   icon={Users}         color="bg-blue-100 dark:bg-blue-900/30"    textColor="text-blue-600 dark:text-blue-400"    to="/clients" />
          <StatCard label="Programs"  value={programs.length}  icon={ClipboardList} color="bg-teal-100 dark:bg-teal-900/30"    textColor="text-teal-600 dark:text-teal-400"    to="/programs" />
          <StatCard label="Exercises" value={exercises.length} icon={Dumbbell}      color="bg-violet-100 dark:bg-violet-900/30" textColor="text-violet-600 dark:text-violet-400" to="/exercises" />
          <StatCard label="Templates" value={templates.length} icon={Library}       color="bg-amber-100 dark:bg-amber-900/30"  textColor="text-amber-600 dark:text-amber-400"  to="/template-library" />
        </div>
      )}

      {/* Get started — shown only when no data yet */}
      {hasNoData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={28} className="text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Get started</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Add your first client, then build them a rehabilitation program.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/clients"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <UserPlus size={15} />
              Add Client
            </Link>
            <Link
              to="/exercises"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Dumbbell size={15} />
              Browse Exercises
            </Link>
          </div>
        </div>
      )}

      {/* Main content grid */}
      {!hasNoData && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Recent Programs (wider) */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-teal-600 dark:text-teal-400" />
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Programs</h2>
              </div>
              <Link to="/programs" className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">
                View all
              </Link>
            </div>

            {recentPrograms.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400 dark:text-gray-500">No programs yet.</p>
                <Link to="/clients" className="mt-2 inline-block text-sm text-teal-600 dark:text-teal-400 hover:underline">
                  Start by adding a client →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-700">
                {recentPrograms.map((program) => {
                  const clientName = clientMap.get(program.clientId) ?? 'Unknown client';
                  const totalExercises = program.sessions.reduce((sum, s) => sum + s.exercises.length, 0);
                  return (
                    <li key={program.id}>
                      <Link
                        to={`/programs/${program.id}/preview`}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Color dot */}
                        <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />

                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {program.name || 'Untitled program'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {clientName}
                            {program.condition ? ` · ${program.condition}` : ''}
                          </p>
                        </div>

                        {/* Meta pills */}
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {program.sessions.length} session{program.sessions.length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {totalExercises} ex
                          </span>
                        </div>

                        {/* Date + chevron */}
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(program.createdAt)}</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Recent Clients (narrower) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-600 dark:text-blue-400" />
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Clients</h2>
              </div>
              <Link to="/clients" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                View all
              </Link>
            </div>

            {recentClients.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400 dark:text-gray-500">No clients yet.</p>
                <Link to="/clients" className="mt-2 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Add your first client →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-700">
                {recentClients.map((client) => {
                  const programCount = programCountByClient.get(client.id) ?? 0;
                  const initials = client.name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  return (
                    <li key={client.id}>
                      <Link
                        to={`/clients/${client.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{initials}</span>
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{client.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {programCount} program{programCount !== 1 ? 's' : ''}
                            {client.age ? ` · Age ${client.age}` : ''}
                          </p>
                        </div>

                        <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/clients"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <UserPlus size={15} />
            New Client
          </Link>
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            New Program
          </Link>
          <Link
            to="/exercises"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Dumbbell size={15} />
            Exercise Library
          </Link>
          <Link
            to="/template-library"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Library size={15} />
            Template Library
          </Link>
          <Link
            to="/config"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings size={15} />
            Configuration
          </Link>
        </div>
      </div>

      {/* Programs per client summary — shown only when there are clients and programs */}
      {!isLoading && clients.length > 0 && programs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <CalendarDays size={16} className="text-violet-600 dark:text-violet-400" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Program Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Client</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Latest Program</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Condition</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Start Date</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {clients
                  .filter((c) => programCountByClient.has(c.id))
                  .sort((a, b) => {
                    const latestA = programs.filter((p) => p.clientId === a.id).sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())[0]?.createdAt ?? '';
                    const latestB = programs.filter((p) => p.clientId === b.id).sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())[0]?.createdAt ?? '';
                    return latestB.localeCompare(latestA);
                  })
                  .slice(0, 8)
                  .map((client) => {
                    const latestProgram = programs
                      .filter((p) => p.clientId === client.id)
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                    if (!latestProgram) return null;
                    return (
                      <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="px-5 py-3">
                          <Link to={`/clients/${client.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-teal-600 dark:hover:text-teal-400">
                            {client.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                          {latestProgram.name || '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                          {latestProgram.condition || '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {fmtDate(latestProgram.startDate)}
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {latestProgram.durationWeeks}w
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            to={`/programs/${latestProgram.id}/preview`}
                            className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
