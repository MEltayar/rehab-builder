import { useState } from 'react';
import { Info } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  infoText: string;
}

export default function SectionHeader({ title, infoText }: SectionHeaderProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center gap-2 mb-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip((v) => !v);
          }}
          onBlur={() => setShowTooltip(false)}
          className="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label={`About ${title}`}
        >
          <Info size={14} />
        </button>
        {showTooltip && (
          <div className="absolute left-6 top-0 z-10 w-64 p-3 text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-md">
            {infoText}
          </div>
        )}
      </div>
    </div>
  );
}
