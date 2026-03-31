import { Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export default function ThemeToggle() {
  const { darkMode, setDarkMode } = useSettingsStore();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      {darkMode ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
