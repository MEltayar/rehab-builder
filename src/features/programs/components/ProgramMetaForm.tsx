import type { Client, Program } from '../../../types';

interface ProgramMetaFormProps {
  draft: Program;
  clients: Client[];
  errors: Record<string, string>;
  onChange: (field: string, value: string | number) => void;
}

const inputClass =
  'w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300';

export default function ProgramMetaForm({ draft, clients, errors, onChange }: ProgramMetaFormProps) {
  const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-4">
      {/* Client */}
      <div className="flex flex-col gap-1">
        <label className={labelClass}>
          Client <span className="text-red-500">*</span>
        </label>
        <select
          value={draft.clientId}
          onChange={(e) => onChange('clientId', e.target.value)}
          disabled={clients.length === 0}
          className={inputClass}
        >
          <option value="">
            {clients.length === 0 ? 'Add a client first' : 'Select a client…'}
          </option>
          {sortedClients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.clientId && <p className="text-xs text-red-500">{errors.clientId}</p>}
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className={labelClass}>
          Program Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. ACL Recovery Phase 1"
          className={inputClass}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Condition */}
      <div className="flex flex-col gap-1">
        <label className={labelClass}>
          Condition <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={draft.condition}
          onChange={(e) => onChange('condition', e.target.value)}
          placeholder="e.g. ACL Tear"
          className={inputClass}
        />
        {errors.condition && <p className="text-xs text-red-500">{errors.condition}</p>}
      </div>

      {/* Goal */}
      <div className="flex flex-col gap-1">
        <label className={labelClass}>
          Goal <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={draft.goal}
          onChange={(e) => onChange('goal', e.target.value)}
          placeholder="e.g. Return to sport"
          className={inputClass}
        />
        {errors.goal && <p className="text-xs text-red-500">{errors.goal}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Duration */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>
            Duration (weeks) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={draft.durationWeeks}
            onChange={(e) => onChange('durationWeeks', Number(e.target.value))}
            min={1}
            max={52}
            step={1}
            className={inputClass}
          />
          {errors.durationWeeks && <p className="text-xs text-red-500">{errors.durationWeeks}</p>}
        </div>

        {/* Start Date */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={draft.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            className={inputClass}
          />
          {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
        </div>
      </div>
    </div>
  );
}
