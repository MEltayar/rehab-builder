import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Pencil, Trash2, TrendingDown, TrendingUp, Minus,
  ClipboardList, Utensils, Activity, StickyNote, User, Plus, X, Check,
  CheckCircle, PauseCircle, Scale, Gauge, UserPlus, CalendarDays,
  Ban, AlertTriangle, FileText, Ruler, Mail, Phone, Target,
  HeartPulse, ArrowDownRight, ArrowUpRight,
} from 'lucide-react';
import { useClientStore } from '../../../store/clientStore';
import { useProgramStore } from '../../../store/programStore';
import { useDietPlanStore } from '../../../store/dietPlanStore';
import { useClientCheckInStore } from '../../../store/clientCheckInStore';
import { usePlanStore } from '../../../store/planStore';
import { useToastStore } from '../../../store/toastStore';
import { useConfirmStore } from '../../../store/confirmStore';
import { LockedSection } from '../../../components/UpgradeLock';
import { supabase } from '../../../lib/supabase';
import { dbRowToProgram, dbRowToDietPlan } from '../../../lib/mappers';
import type { Program, DietPlan, ClientCheckIn, PlanItemStatus, FitnessGoal } from '../../../types';
import ClientModal from '../components/ClientModal';
import type { Client } from '../../../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain', rehab: 'Rehabilitation',
  endurance: 'Endurance', flexibility: 'Flexibility', general: 'General Fitness',
};

const STATUS_STYLES: Record<PlanItemStatus, string> = {
  active:    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  completed: 'bg-gray-100    dark:bg-gray-700         text-gray-500   dark:text-gray-400',
  paused:    'bg-amber-100   dark:bg-amber-900/40     text-amber-700  dark:text-amber-300',
};

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return fmtDate(iso);
}

// ── Status badge + picker ─────────────────────────────────────────────────────

function StatusBadge({ status, onChange }: { status: PlanItemStatus; onChange: (s: PlanItemStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold cursor-pointer ${STATUS_STYLES[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[120px]">
          {(['active', 'paused', 'completed'] as PlanItemStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${status === s ? 'font-bold' : ''}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ values, goodDir, width = 72, height = 28 }: {
  values: number[];
  goodDir: 'up' | 'down' | 'neutral';
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 3;
  const pts = values.map((v, i) => {
    const x = ((i / (values.length - 1)) * (width - pad * 2) + pad).toFixed(1);
    const y = ((height - pad * 2) - ((v - min) / range) * (height - pad * 2) + pad).toFixed(1);
    return `${x},${y}`;
  });
  const overall = values[values.length - 1] - values[0];
  let stroke = '#9ca3af';
  if (goodDir === 'down') stroke = overall < 0 ? '#10b981' : overall > 0 ? '#ef4444' : '#9ca3af';
  if (goodDir === 'up')   stroke = overall > 0 ? '#10b981' : overall < 0 ? '#ef4444' : '#9ca3af';
  const [lx, ly] = pts[pts.length - 1].split(',');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <polyline points={pts.join(' ')} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle cx={lx} cy={ly} r="2.5" fill={stroke} />
    </svg>
  );
}

// ── Check-in form ─────────────────────────────────────────────────────────────

function CheckInForm({ clientId, onSave, onCancel }: {
  clientId: string;
  onSave: (data: Omit<ClientCheckIn, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight]         = useState('');
  const [bodyFat, setBodyFat]       = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [waist, setWaist]           = useState('');
  const [chest, setChest]           = useState('');
  const [hip, setHip]               = useState('');
  const [notes, setNotes]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [emptyError, setEmptyError] = useState(false);
  const [saveError, setSaveError]   = useState('');

  async function handleSave() {
    if (!weight && !bodyFat && !muscleMass && !waist && !chest && !hip && !notes) {
      setEmptyError(true);
      return;
    }
    setEmptyError(false);
    setSaveError('');
    setSaving(true);
    try {
      await onSave({
        clientId,
        date,
        weightKg:      weight     ? Number(weight)     : undefined,
        bodyFatPct:    bodyFat    ? Number(bodyFat)    : undefined,
        muscleMassPct: muscleMass ? Number(muscleMass) : undefined,
        waistCm:       waist      ? Number(waist)      : undefined,
        chestCm:       chest      ? Number(chest)      : undefined,
        hipCm:         hip        ? Number(hip)        : undefined,
        notes:         notes.trim() || undefined,
      });
      onCancel();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const inp = 'px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-800/60">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Log Check-in</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inp} placeholder="89.2" step="0.1" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Body Fat (%)</label>
          <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className={inp} placeholder="18.5" step="0.1" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Muscle Mass (%)</label>
          <input type="number" value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)} className={inp} placeholder="42.0" step="0.1" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Waist (cm)</label>
          <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className={inp} placeholder="85" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Chest (cm)</label>
          <input type="number" value={chest} onChange={(e) => setChest(e.target.value)} className={inp} placeholder="100" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Hip (cm)</label>
          <input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className={inp} placeholder="95" />
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Notes</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inp} placeholder="Any observations..." />
        </div>
      </div>
      {emptyError && (
        <p className="text-xs text-red-500">Please enter at least one measurement or note.</p>
      )}
      {saveError && (
        <p className="text-xs text-red-500">{saveError}</p>
      )}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="text-sm px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ── Inline note editor ────────────────────────────────────────────────────────

function NoteField({ label, icon, value, placeholder, onSave, colorClass }: {
  label: string; icon: ReactNode; value?: string; placeholder: string;
  onSave: (val: string) => void;
  colorClass: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');

  useEffect(() => { setDraft(value ?? ''); }, [value]);

  return (
    <div className="flex items-start gap-3 px-4 py-2.5">
      <span className={`${colorClass} shrink-0 mt-0.5`}>{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0 w-full">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${colorClass}`}>{label}</p>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-[10px] text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 shrink-0">
              <Pencil size={10} /> Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="flex flex-col gap-2 mt-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              rows={2}
              className="px-3 py-2 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full"
              placeholder={placeholder}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { onSave(draft); setEditing(false); }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                <Check size={11} /> Save
              </button>
              <button
                onClick={() => { setDraft(value ?? ''); setEditing(false); }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={11} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-sm leading-snug ${value ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500 italic'}`}>
            {value || placeholder}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'from-blue-500 to-indigo-600', 'from-violet-500 to-purple-600',
  'from-teal-500 to-cyan-600',   'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600','from-emerald-500 to-green-600',
];

function ClientAvatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  const cls = size === 'lg'
    ? 'w-16 h-16 text-2xl font-bold rounded-2xl'
    : 'w-8 h-8 text-xs font-bold rounded-full';
  return (
    <div className={`bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0 ${cls}`}>
      {initials}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const clients         = useClientStore((s) => s.clients);
  const updateClient    = useClientStore((s) => s.updateClient);
  const initClients     = useClientStore((s) => s.initializeFromDB);
  const isClientLoaded  = useClientStore((s) => s.isLoaded);
  const canAccessClientAnalytics = usePlanStore((s) => s.limits().canAccessClientAnalytics);

  const updateProgramStatus = useProgramStore((s) => s.updateProgramStatus);
  const updatePlanStatus    = useDietPlanStore((s) => s.updatePlanStatus);

  const { checkIns, isLoaded: checkInsLoaded, loadForClient, addCheckIn, deleteCheckIn } = useClientCheckInStore();
  const showToast = useToastStore((s) => s.showToast);
  const showConfirm = useConfirmStore((s) => s.showConfirm);

  const [programs, setPrograms]     = useState<Program[]>([]);
  const [dietPlans, setDietPlans]   = useState<DietPlan[]>([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showAllTimeline, setShowAllTimeline] = useState(false);

  useEffect(() => { if (!isClientLoaded) initClients(); }, [isClientLoaded, initClients]);

  useEffect(() => {
    if (!id) return;
    supabase.from('programs').select('*').eq('client_id', id)
      .then(({ data, error }) => {
        if (error) console.error('Failed to load programs:', error);
        else setPrograms((data ?? []).map(dbRowToProgram));
      });
    supabase.from('diet_plans').select('*').eq('client_id', id)
      .then(({ data, error }) => {
        if (error) console.error('Failed to load diet plans:', error);
        else setDietPlans((data ?? []).map(dbRowToDietPlan));
      });
    loadForClient(id);
  }, [id, loadForClient]);

  const client = clients.find((c) => c.id === id);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const sortedPrograms  = useMemo(() => [...programs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [programs]);
  const sortedDietPlans = useMemo(() => [...dietPlans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [dietPlans]);

  const activeProgram  = sortedPrograms.find((p) => p.status === 'active') ?? sortedPrograms[0];
  const activeDietPlan = sortedDietPlans.find((p) => p.status === 'active') ?? sortedDietPlans[0];

  // Rich metric data per field — newest first in checkIns, oldest first in .values (for sparkline)
  function buildMetric(key: 'weightKg' | 'bodyFatPct' | 'muscleMassPct' | 'waistCm' | 'chestCm' | 'hipCm') {
    const pts = checkIns.filter(c => c[key] !== undefined).map(c => c[key] as number);
    if (pts.length === 0) return null;
    const latest   = pts[0];
    const diffLast  = pts.length >= 2 ? latest - pts[1] : null;
    const diffTotal = pts.length >= 2 ? latest - pts[pts.length - 1] : null;
    const dir = diffLast === null ? 'same' : diffLast < 0 ? 'down' : diffLast > 0 ? 'up' : 'same';
    return { latest, diffLast, diffTotal, dir, count: pts.length, values: [...pts].reverse() };
  }
  const weightMetric  = useMemo(() => buildMetric('weightKg'),     [checkIns]); // eslint-disable-line react-hooks/exhaustive-deps
  const fatMetric     = useMemo(() => buildMetric('bodyFatPct'),    [checkIns]); // eslint-disable-line react-hooks/exhaustive-deps
  const muscleMetric  = useMemo(() => buildMetric('muscleMassPct'), [checkIns]); // eslint-disable-line react-hooks/exhaustive-deps
  const waistMetric   = useMemo(() => buildMetric('waistCm'),       [checkIns]); // eslint-disable-line react-hooks/exhaustive-deps
  const chestMetric   = useMemo(() => buildMetric('chestCm'),       [checkIns]); // eslint-disable-line react-hooks/exhaustive-deps
  const hipMetric     = useMemo(() => buildMetric('hipCm'),         [checkIns]); // eslint-disable-line react-hooks/exhaustive-deps

  // Activity timeline: merge programs, diet plans, check-ins, client join
  const timeline = useMemo(() => {
    type TimelineEntry = { date: string; icon: ReactNode; text: string; color: string };
    const entries: TimelineEntry[] = [];

    sortedPrograms.forEach((p) => {
      entries.push({ date: p.createdAt, icon: <ClipboardList size={14} />, text: `Program started: "${p.name}"`, color: 'text-teal-600 dark:text-teal-400' });
      if (p.status === 'completed') entries.push({ date: p.updatedAt, icon: <CheckCircle size={14} />, text: `Completed: "${p.name}"`, color: 'text-green-600 dark:text-green-400' });
      if (p.status === 'paused')   entries.push({ date: p.updatedAt, icon: <PauseCircle size={14} />, text: `Paused: "${p.name}"`, color: 'text-amber-600 dark:text-amber-400' });
    });

    sortedDietPlans.forEach((p) => {
      entries.push({ date: p.createdAt, icon: <Utensils size={14} />, text: `Diet plan assigned: "${p.name}"`, color: 'text-emerald-600 dark:text-emerald-400' });
      if (p.status === 'completed') entries.push({ date: p.updatedAt, icon: <CheckCircle size={14} />, text: `Diet plan completed: "${p.name}"`, color: 'text-green-600 dark:text-green-400' });
    });

    checkIns.forEach((c) => {
      const parts: string[] = [];
      if (c.weightKg) parts.push(`${c.weightKg} kg`);
      if (c.bodyFatPct) parts.push(`${c.bodyFatPct}% fat`);
      if (c.notes) parts.push(c.notes);
      entries.push({ date: c.createdAt, icon: <Scale size={14} />, text: `Check-in: ${parts.join(' · ') || 'logged'}`, color: 'text-blue-600 dark:text-blue-400' });
    });

    if (client) entries.push({ date: client.createdAt, icon: <UserPlus size={14} />, text: 'Client joined', color: 'text-violet-600 dark:text-violet-400' });

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);
  }, [sortedPrograms, sortedDietPlans, checkIns, client]);

  // ── Loading / not found ───────────────────────────────────────────────────────

  if (!isClientLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-gray-700 dark:text-gray-300 font-medium">Client not found</p>
        <Link to="/clients" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shadow-sm">
          <ChevronLeft size={15} /> Back to Clients
        </Link>
      </div>
    );
  }

  async function handleSave(data: Omit<Client, 'id' | 'createdAt'>) {
    if (!client) return;
    try {
      await updateClient(client.id, data);
      setModalOpen(false);
    } catch {
      showToast('Failed to update client. Please try again.', 'error');
    }
  }

  async function handleProgramStatusChange(programId: string, status: PlanItemStatus) {
    try {
      await updateProgramStatus(programId, status);
      setPrograms((prev) => prev.map((p) => p.id === programId ? { ...p, status } : p));
    } catch {
      showToast('Failed to update program status.', 'error');
    }
  }

  async function handleDietStatusChange(planId: string, status: PlanItemStatus) {
    try {
      await updatePlanStatus(planId, status);
      setDietPlans((prev) => prev.map((p) => p.id === planId ? { ...p, status } : p));
    } catch {
      showToast('Failed to update diet plan status.', 'error');
    }
  }

  function handleDeleteProgram(programId: string, name: string) {
    showConfirm({
      title: 'Delete Program',
      message: `Are you sure you want to delete "${name}"? This cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        const { error } = await supabase.from('programs').delete().eq('id', programId);
        if (error) { showToast('Failed to delete program. Please try again.', 'error'); return; }
        setPrograms((prev) => prev.filter((p) => p.id !== programId));
      },
    });
  }

  function handleDeleteDietPlan(planId: string, name: string) {
    showConfirm({
      title: 'Delete Diet Plan',
      message: `Are you sure you want to delete "${name}"? This cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        const { error } = await supabase.from('diet_plans').delete().eq('id', planId);
        if (error) { showToast('Failed to delete diet plan. Please try again.', 'error'); return; }
        setDietPlans((prev) => prev.filter((p) => p.id !== planId));
      },
    });
  }

  const daysSinceJoin = Math.floor((Date.now() - new Date(client.createdAt).getTime()) / 86_400_000);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* Back button */}
      <Link
        to="/clients"
        className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shadow-sm"
      >
        <ChevronLeft size={15} /> Back to Clients
      </Link>

      {/* ── Profile header card ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-5 shadow-sm flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <ClientAvatar name={client.name} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {client.age   && <span className="text-sm text-gray-500 dark:text-gray-400">Age: {client.age}</span>}
              {client.email && (
                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Mail size={13} /> {client.email}
                </span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Phone size={13} /> {client.phone}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {client.fitnessGoal && (
                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 rounded-full font-medium">
                  {FITNESS_GOAL_LABELS[client.fitnessGoal]}
                </span>
              )}
              {client.heightCm && (
                <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full font-medium">
                  <Ruler size={11} /> {client.heightCm} cm
                </span>
              )}
              {client.weightKg && (
                <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full font-medium">
                  <Scale size={11} /> {client.weightKg} kg
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500">Member since {fmtDate(client.createdAt)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors"
        >
          <Pencil size={13} /> Edit
        </button>
      </div>

      {/* ── Stat strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Training Plans', value: programs.length,  icon: <ClipboardList size={18} />, color: 'from-teal-500 to-cyan-600' },
          { label: 'Diet Plans',     value: dietPlans.length, icon: <Utensils size={18} />,      color: 'from-emerald-500 to-green-600' },
          { label: 'Check-ins',      value: checkIns.length,  icon: <Scale size={18} />,         color: 'from-blue-500 to-indigo-600' },
          { label: 'Days as client', value: daysSinceJoin,    icon: <CalendarDays size={18} />,  color: 'from-violet-500 to-purple-600' },
        ].map((s) => (
          <div key={s.label} className={`relative rounded-xl bg-gradient-to-br ${s.color} px-4 py-3 text-white shadow-sm overflow-hidden`}>
            <div className="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="opacity-80">{s.icon}</span>
              <p className="text-2xl font-extrabold">{s.value}</p>
            </div>
            <p className="text-xs text-white/75 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT (1/3): Coaching reference panel ── */}
        <div className="flex flex-col gap-6">

          {/* Physical Profile */}
          {(client.heightCm || client.weightKg || client.fitnessGoal) && (
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-600 dark:text-slate-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">Physical Profile</h2>
                </div>
                <button onClick={() => setModalOpen(true)} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  <Pencil size={11} /> Edit
                </button>
              </div>
              <div className="px-5 py-4">
                <div className="grid grid-cols-3 gap-3">
                  {client.heightCm && (
                    <div className="flex flex-col items-center gap-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-2 text-center">
                      <Ruler size={15} className="text-slate-400 dark:text-slate-500" />
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">{client.heightCm}</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">cm</p>
                      <p className="text-[10px] text-gray-400">Height</p>
                    </div>
                  )}
                  {client.weightKg && (
                    <div className="flex flex-col items-center gap-1 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/40 rounded-xl py-3 px-2 text-center">
                      <Gauge size={15} className="text-teal-500 dark:text-teal-400" />
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">{client.weightKg}</p>
                      <p className="text-[10px] text-teal-500 font-medium uppercase tracking-wide">kg</p>
                      <p className="text-[10px] text-gray-400">Starting weight</p>
                    </div>
                  )}
                  {client.fitnessGoal && (
                    <div className="flex flex-col items-center gap-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/40 rounded-xl py-3 px-2 text-center">
                      <Target size={15} className="text-orange-500 dark:text-orange-400" />
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-snug mt-0.5">{FITNESS_GOAL_LABELS[client.fitnessGoal]}</p>
                      <p className="text-[10px] invisible">—</p>
                      <p className="text-[10px] text-gray-400">Goal</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Trainer Notes */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <StickyNote size={16} className="text-amber-600 dark:text-amber-400" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Trainer Notes</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
              <NoteField label="Medical History"  icon={<HeartPulse size={14}   />} value={client.medicalHistory}  placeholder="Injuries, past surgeries, conditions…"   onSave={(v) => updateClient(client.id, { medicalHistory:  v || undefined })} colorClass="text-red-400 dark:text-red-500" />
              <NoteField label="Food Preferences" icon={<Utensils size={14}     />} value={client.foodPreferences} placeholder="What the client likes to eat…"            onSave={(v) => updateClient(client.id, { foodPreferences: v || undefined })} colorClass="text-emerald-500 dark:text-emerald-400" />
              <NoteField label="Food Dislikes"    icon={<Ban size={14}           />} value={client.foodDislikes}    placeholder="Foods to avoid…"                         onSave={(v) => updateClient(client.id, { foodDislikes:    v || undefined })} colorClass="text-amber-500 dark:text-amber-400" />
              <NoteField label="Health Alerts"    icon={<AlertTriangle size={14} />} value={client.healthAlerts}    placeholder="Injuries, conditions, important flags…"  onSave={(v) => updateClient(client.id, { healthAlerts:    v || undefined })} colorClass="text-orange-500 dark:text-orange-400" />
              <NoteField label="General Notes"    icon={<FileText size={14}      />} value={client.generalNotes}    placeholder="Observations, motivations, misc…"        onSave={(v) => updateClient(client.id, { generalNotes:    v || undefined })} colorClass="text-violet-500 dark:text-violet-400" />
            </div>
          </section>

        </div>

        {/* ── RIGHT (2/3): Working area ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Body Metrics */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-blue-600 dark:text-blue-400" />
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Body Metrics</h2>
              </div>
              {canAccessClientAnalytics && !showCheckInForm && (
                <button onClick={() => setShowCheckInForm(true)} className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  <Plus size={13} /> Log
                </button>
              )}
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              <LockedSection locked={!canAccessClientAnalytics} feature="Client Analytics" tier="yearly">
                {(() => {
                  const goal = client.fitnessGoal;
                  const weightGoodDir: 'up' | 'down' | 'neutral' =
                    goal === 'weight_loss' ? 'down' : goal === 'muscle_gain' ? 'up' : 'neutral';

                  function deltaColor(diff: number | null, goodDir: 'up' | 'down' | 'neutral') {
                    if (diff === null || diff === 0) return 'text-gray-400 dark:text-gray-500';
                    if (goodDir === 'neutral') return 'text-gray-500 dark:text-gray-400';
                    if (goodDir === 'down') return diff < 0 ? 'text-emerald-500' : 'text-red-500';
                    return diff > 0 ? 'text-emerald-500' : 'text-red-500';
                  }

                  function DeltaBadge({ diff, goodDir, unit }: { diff: number | null; goodDir: 'up'|'down'|'neutral'; unit: string }) {
                    if (diff === null) return <span className="text-[10px] text-gray-400 italic">first entry</span>;
                    if (diff === 0)   return <span className="text-[10px] text-gray-400">no change</span>;
                    return (
                      <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${deltaColor(diff, goodDir)}`}>
                        {diff < 0 ? <ArrowDownRight size={11}/> : <ArrowUpRight size={11}/>}
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit} vs last
                      </span>
                    );
                  }

                  // Sample data for locked teaser
                  const SAMPLE_METRICS = {
                    weight: { latest: 82.0, diffLast: -1.5, diffTotal: -4.0, dir: 'down', count: 5, values: [86, 84.5, 83.5, 83, 82] },
                    fat:    { latest: 18.5, diffLast: -0.5, diffTotal: -1.5, dir: 'down', count: 5, values: [20, 19.5, 19.0, 19, 18.5] },
                    muscle: { latest: 42.3, diffLast:  1.2, diffTotal:  2.3, dir: 'up',   count: 5, values: [40, 40.5, 41, 41.5, 42.3] },
                  };
                  const wt  = canAccessClientAnalytics ? weightMetric : SAMPLE_METRICS.weight as typeof weightMetric;
                  const fat = canAccessClientAnalytics ? fatMetric    : SAMPLE_METRICS.fat    as typeof fatMetric;
                  const mus = canAccessClientAnalytics ? muscleMetric : SAMPLE_METRICS.muscle as typeof muscleMetric;

                  // Columns to show in history table
                  const hasWeight  = checkIns.some(c => c.weightKg      !== undefined);
                  const hasFat     = checkIns.some(c => c.bodyFatPct    !== undefined);
                  const hasMuscle  = checkIns.some(c => c.muscleMassPct !== undefined);
                  const hasWaist   = checkIns.some(c => c.waistCm       !== undefined);
                  const hasChest   = checkIns.some(c => c.chestCm       !== undefined);
                  const hasHip     = checkIns.some(c => c.hipCm         !== undefined);

                  return (
                    <div className="flex flex-col gap-4">

                      {/* ── Sparkline metric cards ── */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Weight */}
                        <div className="flex flex-col gap-1 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 pt-3 pb-2 overflow-hidden">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <Gauge size={12} className="text-blue-400 shrink-0" />
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Weight</p>
                            </div>
                            {wt && wt.values.length >= 2 && <Sparkline values={wt.values} goodDir={weightGoodDir} width={48} height={20} />}
                          </div>
                          <p className="text-base font-extrabold text-gray-900 dark:text-gray-100 leading-none mt-0.5">
                            {wt ? wt.latest : '—'}<span className="text-[10px] font-medium text-gray-400 ml-0.5">kg</span>
                          </p>
                          {wt ? <DeltaBadge diff={wt.diffLast} goodDir={weightGoodDir} unit=" kg" /> : <span className="text-[10px] text-gray-400 italic">No data</span>}
                          {wt?.diffTotal !== null && wt?.diffTotal !== undefined && wt.count >= 2 && (
                            <span className={`text-[10px] font-medium ${deltaColor(wt.diffTotal, weightGoodDir)}`}>
                              {wt.diffTotal > 0 ? '+' : ''}{wt.diffTotal.toFixed(1)} kg total
                            </span>
                          )}
                        </div>

                        {/* Body Fat */}
                        <div className="flex flex-col gap-1 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 pt-3 pb-2 overflow-hidden">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <Activity size={12} className="text-orange-400 shrink-0" />
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Body Fat</p>
                            </div>
                            {fat && fat.values.length >= 2 && <Sparkline values={fat.values} goodDir="down" width={48} height={20} />}
                          </div>
                          <p className="text-base font-extrabold text-gray-900 dark:text-gray-100 leading-none mt-0.5">
                            {fat ? fat.latest : '—'}<span className="text-[10px] font-medium text-gray-400 ml-0.5">%</span>
                          </p>
                          {fat ? <DeltaBadge diff={fat.diffLast} goodDir="down" unit="%" /> : <span className="text-[10px] text-gray-400 italic">No data</span>}
                          {fat?.diffTotal !== null && fat?.diffTotal !== undefined && fat.count >= 2 && (
                            <span className={`text-[10px] font-medium ${deltaColor(fat.diffTotal, 'down')}`}>
                              {fat.diffTotal > 0 ? '+' : ''}{fat.diffTotal.toFixed(1)}% total
                            </span>
                          )}
                        </div>

                        {/* Muscle */}
                        <div className="flex flex-col gap-1 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 pt-3 pb-2 overflow-hidden">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <TrendingUp size={12} className="text-violet-400 shrink-0" />
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Muscle</p>
                            </div>
                            {mus && mus.values.length >= 2 && <Sparkline values={mus.values} goodDir="up" width={48} height={20} />}
                          </div>
                          <p className="text-base font-extrabold text-gray-900 dark:text-gray-100 leading-none mt-0.5">
                            {mus ? mus.latest : '—'}<span className="text-[10px] font-medium text-gray-400 ml-0.5">%</span>
                          </p>
                          {mus ? <DeltaBadge diff={mus.diffLast} goodDir="up" unit="%" /> : <span className="text-[10px] text-gray-400 italic">No data</span>}
                          {mus?.diffTotal !== null && mus?.diffTotal !== undefined && mus.count >= 2 && (
                            <span className={`text-[10px] font-medium ${deltaColor(mus.diffTotal, 'up')}`}>
                              {mus.diffTotal > 0 ? '+' : ''}{mus.diffTotal.toFixed(1)}% total
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── Measurements summary chips ── */}
                      {(waistMetric || chestMetric || hipMetric) && (
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Waist', m: waistMetric },
                            { label: 'Chest', m: chestMetric },
                            { label: 'Hip',   m: hipMetric   },
                          ].filter(x => x.m).map(({ label, m }) => (
                            <div key={label} className="flex flex-col gap-0.5 rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{m!.latest}<span className="text-[10px] text-gray-400 ml-0.5">cm</span></p>
                              {m!.diffLast !== null && (
                                <p className={`text-[10px] font-medium flex items-center gap-0.5 ${deltaColor(m!.diffLast, 'down')}`}>
                                  {m!.diffLast < 0 ? <TrendingDown size={9}/> : m!.diffLast > 0 ? <TrendingUp size={9}/> : <Minus size={9}/>}
                                  {m!.diffLast !== 0 ? `${m!.diffLast > 0 ? '+' : ''}${m!.diffLast.toFixed(1)}` : '—'}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Check-in form ── */}
                      {showCheckInForm && (
                        <CheckInForm
                          clientId={client.id}
                          onSave={addCheckIn}
                          onCancel={() => setShowCheckInForm(false)}
                        />
                      )}

                      {/* ── History table ── */}
                      {canAccessClientAnalytics && (
                        !checkInsLoaded ? (
                          <p className="text-xs text-gray-400">Loading…</p>
                        ) : checkIns.length === 0 ? (
                          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">No check-ins yet — tap Log to start tracking.</p>
                        ) : (
                          <div className="overflow-x-auto overflow-y-auto max-h-56 rounded-lg border border-gray-100 dark:border-gray-700/50">
                            <table className="w-full text-xs border-collapse tabular-nums">
                              <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                  <th className="text-left py-2 pl-1 pr-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 whitespace-nowrap w-20">Date</th>
                                  {hasWeight && <th className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 w-14">Wt kg</th>}
                                  {hasFat    && <th className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 w-14">Fat %</th>}
                                  {hasMuscle && <th className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 w-14">Mus %</th>}
                                  {hasWaist  && <th className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 w-12">Waist</th>}
                                  {hasChest  && <th className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 w-12">Chest</th>}
                                  {hasHip    && <th className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 w-12">Hip</th>}
                                  <th className="w-5" />
                                </tr>
                              </thead>
                              <tbody>
                                {checkIns.map((c, i) => {
                                  const prev = checkIns[i + 1];
                                  function cellCls(val: number | undefined, prevVal: number | undefined, goodDir: 'up'|'down'|'neutral') {
                                    if (val === undefined || prevVal === undefined || goodDir === 'neutral') return 'text-gray-700 dark:text-gray-300';
                                    const d = val - prevVal;
                                    if (d === 0) return 'text-gray-700 dark:text-gray-300';
                                    if (goodDir === 'down') return d < 0 ? 'text-emerald-500 font-semibold' : 'text-red-400 font-semibold';
                                    return d > 0 ? 'text-emerald-500 font-semibold' : 'text-red-400 font-semibold';
                                  }
                                  function arrowIcon(val: number | undefined, prevVal: number | undefined, goodDir: 'up'|'down'|'neutral') {
                                    if (val === undefined || prevVal === undefined || goodDir === 'neutral') return null;
                                    const d = val - prevVal;
                                    if (d === 0) return null;
                                    return d < 0
                                      ? <TrendingDown size={8} className="shrink-0" />
                                      : <TrendingUp   size={8} className="shrink-0" />;
                                  }
                                  function Cell({ val, prevVal, goodDir }: { val?: number; prevVal?: number; goodDir: 'up'|'down'|'neutral' }) {
                                    return (
                                      <td className="py-2 px-2 text-right whitespace-nowrap align-middle">
                                        <span className={`inline-flex items-center justify-end ${cellCls(val, prevVal, goodDir)}`}>
                                          <span className="w-3 shrink-0 inline-flex items-center justify-center">
                                            {arrowIcon(val, prevVal, goodDir)}
                                          </span>
                                          {val !== undefined ? val : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </span>
                                      </td>
                                    );
                                  }
                                  return (
                                    <tr key={c.id} className="group border-b border-gray-100 dark:border-gray-700/40 hover:bg-gray-50/60 dark:hover:bg-gray-700/20">
                                      <td className="py-2 pl-1 pr-2 text-gray-500 dark:text-gray-400 whitespace-nowrap align-middle">{fmtDate(c.date)}</td>
                                      {hasWeight && <Cell val={c.weightKg}      prevVal={prev?.weightKg}      goodDir={weightGoodDir} />}
                                      {hasFat    && <Cell val={c.bodyFatPct}    prevVal={prev?.bodyFatPct}    goodDir="down" />}
                                      {hasMuscle && <Cell val={c.muscleMassPct} prevVal={prev?.muscleMassPct} goodDir="up" />}
                                      {hasWaist  && <Cell val={c.waistCm}       prevVal={prev?.waistCm}       goodDir="down" />}
                                      {hasChest  && <Cell val={c.chestCm}       prevVal={prev?.chestCm}       goodDir="down" />}
                                      {hasHip    && <Cell val={c.hipCm}         prevVal={prev?.hipCm}         goodDir="down" />}
                                      <td className="py-2 px-1 text-right">
                                        <button onClick={async () => { try { await deleteCheckIn(c.id); } catch { showToast('Failed to delete check-in.', 'error'); } }} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity">
                                          <Trash2 size={11} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )
                      )}

                    </div>
                  );
                })()}
              </LockedSection>
            </div>
          </section>

          {/* Plans row — Training + Diet side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Training Plans */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-teal-600 dark:text-teal-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">Training Plans</h2>
                  {activeProgram && (
                    <span className="text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-medium">
                      {programs.filter((p) => p.status === 'active').length} active
                    </span>
                  )}
                </div>
                <Link to={`/programs/new?clientId=${id}`} className="flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline">
                  <Plus size={13} /> New
                </Link>
              </div>
              {sortedPrograms.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">No programs yet</p>
                  <Link to={`/programs/new?clientId=${id}`} className="mt-1 inline-block text-sm text-teal-600 dark:text-teal-400 hover:underline">Create first →</Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50 dark:divide-gray-700/50 max-h-52 overflow-y-auto">
                  {sortedPrograms.map((program) => (
                    <li key={program.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <StatusBadge status={program.status ?? 'active'} onChange={(s) => handleProgramStatusChange(program.id, s)} />
                      <div className="flex-1 min-w-0">
                        <Link to={`/programs/${program.id}/preview`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-teal-600 dark:hover:text-teal-400 truncate block">
                          {program.name || 'Untitled'}
                        </Link>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{program.sessions.length} sessions · {fmtDate(program.startDate)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleDeleteProgram(program.id, program.name || 'Untitled')} className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 rounded transition-colors"><Trash2 size={13} /></button>
                        <Link to={`/programs/${program.id}/edit`} className="p-1 text-gray-300 dark:text-gray-600 hover:text-blue-500 rounded transition-colors"><ChevronRight size={15} /></Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Diet Plans */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Utensils size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">Diet Plans</h2>
                  {activeDietPlan && (
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                      {dietPlans.filter((p) => p.status === 'active').length} active
                    </span>
                  )}
                </div>
                <Link to={`/diet-plans/new?clientId=${id}`} className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                  <Plus size={13} /> New
                </Link>
              </div>
              {sortedDietPlans.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">No diet plans yet</p>
                  <Link to={`/diet-plans/new?clientId=${id}`} className="mt-1 inline-block text-sm text-emerald-600 dark:text-emerald-400 hover:underline">Create first →</Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50 dark:divide-gray-700/50 max-h-52 overflow-y-auto">
                  {sortedDietPlans.map((plan) => (
                    <li key={plan.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <StatusBadge status={plan.status ?? 'active'} onChange={(s) => handleDietStatusChange(plan.id, s)} />
                      <div className="flex-1 min-w-0">
                        <Link to={`/diet-plans/${plan.id}/edit`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 truncate block">
                          {plan.name || 'Untitled'}
                        </Link>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{plan.goal}{plan.targetCalories ? ` · ${plan.targetCalories} kcal` : ''} · {fmtDate(plan.startDate)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleDeleteDietPlan(plan.id, plan.name || 'Untitled')} className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 rounded transition-colors"><Trash2 size={13} /></button>
                        <Link to={`/diet-plans/${plan.id}/edit`} className="p-1 text-gray-300 dark:text-gray-600 hover:text-blue-500 rounded transition-colors"><ChevronRight size={15} /></Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

          </div>{/* end plans row */}

        </div>{/* end right column */}
      </div>{/* end main grid */}

      {/* ── Activity Timeline — full width, compact ── */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-violet-600 dark:text-violet-400" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Activity Timeline</h2>
          </div>
          {timeline.length > 5 && (
            <button onClick={() => setShowAllTimeline((v) => !v)} className="text-xs text-violet-500 hover:underline">
              {showAllTimeline ? 'Show less' : `Show all ${timeline.length}`}
            </button>
          )}
        </div>
        {timeline.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">No activity recorded yet</p>
          </div>
        ) : (
          <ul className="px-5 py-1 divide-y divide-gray-50 dark:divide-gray-700/40">
            {(showAllTimeline ? timeline : timeline.slice(0, 5)).map((entry, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5">
                <span className={`shrink-0 ${entry.color}`}>{entry.icon}</span>
                <p className={`flex-1 min-w-0 text-sm font-medium ${entry.color}`}>{entry.text}</p>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 whitespace-nowrap">{timeAgo(entry.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ClientModal
        client={client}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
