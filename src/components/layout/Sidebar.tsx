import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  Users,
  ClipboardList,
  Settings,
  Library,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const navSections = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'exercises', label: 'Exercise Library', path: '/exercises', icon: Dumbbell },
  { id: 'clients', label: 'Clients', path: '/clients', icon: Users },
  { id: 'programs', label: 'Program Builder', path: '/programs', icon: ClipboardList },
  { id: 'template-library', label: 'Template Library', path: '/template-library', icon: Library },
  { id: 'config', label: 'Configuration', path: '/config', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-56 shrink-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-3 py-4">
      <div className="mb-6 px-2">
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Rehab Builder
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navSections.map(({ id, label, path, icon: Icon }) => (
          <NavLink
            key={id}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <ThemeToggle />
      </div>
    </aside>
  );
}
