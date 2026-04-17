import type { Client, DietPlan } from '../../../types';

type DraftField = 'name' | 'goal' | 'durationWeeks' | 'startDate' | 'clientId' | 'notes' | 'targetCalories' | 'targetProtein' | 'targetCarbs' | 'targetFat';

interface MetaFormProps {
  draft: DietPlan;
  clients: Client[];
  errors: Record<string, string>;
  onChange: (field: DraftField, value: string | number | undefined) => void;
}

const inputCls = 'px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
const labelCls = 'text-sm font-medium text-gray-700 dark:text-gray-300';

function optNum(v: string): number | undefined {
  if (v.trim() === '') return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
}

export default function DietMetaForm({ draft, clients, errors, onChange }: MetaFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Plan Details</h2>

      {/* Client */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Client <span className="text-red-500">*</span></label>
        <select
          value={draft.clientId}
          onChange={(e) => onChange('clientId', e.target.value)}
          className={inputCls}
        >
          <option value="">— Select client —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.clientId && <p className="text-xs text-red-500">{errors.clientId}</p>}
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Plan name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. Muscle Gain Plan — Week 1-4"
          className={inputCls}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Goal */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Goal</label>
        <input
          type="text"
          value={draft.goal}
          onChange={(e) => onChange('goal', e.target.value)}
          placeholder="e.g. Increase lean muscle mass"
          className={inputCls}
        />
      </div>

      {/* Duration + Start */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Duration (weeks)</label>
          <input
            type="number"
            min="1"
            max="52"
            step="1"
            value={draft.durationWeeks}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              if (e.target.value === '') return;
              if (!isNaN(n)) onChange('durationWeeks', n);
            }}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Start date</label>
          <input
            type="date"
            value={draft.startDate}
            min="2000-01-01"
            max="2099-12-31"
            onChange={(e) => onChange('startDate', e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Macro targets */}
      <div>
        <p className={`${labelCls} mb-2`}>Daily targets <span className="text-xs font-normal text-gray-400">(optional)</span></p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { field: 'targetCalories', label: 'Calories', unit: 'kcal' },
            { field: 'targetProtein',  label: 'Protein',  unit: 'g' },
            { field: 'targetCarbs',    label: 'Carbs',    unit: 'g' },
            { field: 'targetFat',      label: 'Fat',      unit: 'g' },
          ] as const).map(({ field, label, unit }) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">{label} ({unit})</label>
              <input
                type="number"
                min="0"
                step="any"
                value={draft[field] ?? ''}
                onChange={(e) => onChange(field, optNum(e.target.value))}
                placeholder="—"
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Notes</label>
        <textarea
          value={draft.notes ?? ''}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={2}
          placeholder="Optional notes…"
          className={`${inputCls} resize-none`}
        />
      </div>
    </div>
  );
}
