import { Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export default function ThemeToggle() {
  const { darkMode, setDarkMode } = useSettingsStore();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-white/65 hover:bg-white/10 hover:text-white transition-all"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      {darkMode ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
