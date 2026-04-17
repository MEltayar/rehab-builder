import { Search } from 'lucide-react';
import { useFoodStore } from '../../../store/foodStore';

export default function FoodSearch() {
  const searchTerm = useFoodStore((s) => s.searchTerm);
  const setSearchTerm = useFoodStore((s) => s.setSearchTerm);

  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search foods…"
        className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
