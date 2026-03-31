import { Star } from 'lucide-react';

interface Props {
  active: boolean;
  count: number;
  onToggle: () => void;
}

export default function FavouritesFilterButton({ active, count, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors ${
        active
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300'
          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <Star size={14} className={active ? 'fill-yellow-400 text-yellow-400' : ''} />
      Favourites
      {count > 0 && (
        <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300">
          {count}
        </span>
      )}
    </button>
  );
}
