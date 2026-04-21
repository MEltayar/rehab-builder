import { Stethoscope, Dumbbell } from 'lucide-react';
import type { ProfileType } from '../../../types';

interface Props {
  value: ProfileType;
  onChange: (v: ProfileType) => void;
}

export default function ProfileTypeSection({ value, onChange }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Profile Type</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Sets the terminology and exercise parameters used throughout the app.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('physio')}
          className={[
            'flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-colors',
            value === 'physio'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
          ].join(' ')}
        >
          <Stethoscope
            size={22}
            className={value === 'physio' ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}
          />
          <div>
            <p className={`text-sm font-semibold ${value === 'physio' ? 'text-orange-600 dark:text-orange-300' : 'text-gray-800 dark:text-gray-200'}`}>
              Physiotherapy
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Clinic · Patient · Condition · Hold time</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('gym')}
          className={[
            'flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-colors',
            value === 'gym'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
          ].join(' ')}
        >
          <Dumbbell
            size={22}
            className={value === 'gym' ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}
          />
          <div>
            <p className={`text-sm font-semibold ${value === 'gym' ? 'text-orange-600 dark:text-orange-300' : 'text-gray-800 dark:text-gray-200'}`}>
              Personal Training
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Trainer · Client · Focus Area · Weight (kg)</p>
          </div>
        </button>
      </div>
    </div>
  );
}
