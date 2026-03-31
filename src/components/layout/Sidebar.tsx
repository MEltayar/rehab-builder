import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  Users,
  ClipboardList,
  Settings,
  Library,
  X,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const navSections = [
  { id: 'dashboard',        label: 'Dashboard',         path: '/',                icon: LayoutDashboard },
  { id: 'exercises',        label: 'Exercise Library',   path: '/exercises',       icon: Dumbbell },
  { id: 'clients',          label: 'Clients',            path: '/clients',         icon: Users },
  { id: 'programs',         label: 'Program Builder',    path: '/programs',        icon: ClipboardList },
  { id: 'template-library', label: 'Template Library',   path: '/template-library',icon: Library },
  { id: 'config',           label: 'Configuration',      path: '/config',          icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={[
        // Base: full-height panel
        'flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-3 py-4',
        // Mobile: fixed slide-in overlay
        'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: static sidebar, always visible
        'md:relative md:translate-x-0 md:w-56 md:shrink-0',
      ].join(' ')}
    >
      {/* Header */}
      <div className="mb-6 px-2 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Rehab Builder
        </span>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navSections.map(({ id, label, path, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={id}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <ThemeToggle />
      </div>
    </aside>
  );
}
