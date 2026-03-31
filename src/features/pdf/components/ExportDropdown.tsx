import { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileText, Mail, MessageCircle, SendHorizontal, Sheet } from 'lucide-react';

interface ExportDropdownProps {
  onSelectPDF: () => void;
  onSelectExcel: () => void;
  onSelectEmail: () => void;
  onSelectWhatsApp: () => void;
  disabled?: boolean;
}

const MENU_ITEMS = [
  { label: 'Export PDF',        Icon: FileText,      key: 'pdf'      },
  { label: 'Export Excel',      Icon: Sheet,         key: 'excel'    },
  { label: 'Send via Email',    Icon: Mail,          key: 'email'    },
  { label: 'Send via WhatsApp', Icon: MessageCircle, key: 'whatsapp' },
] as const;

type MenuKey = typeof MENU_ITEMS[number]['key'];

export default function ExportDropdown({
  onSelectPDF,
  onSelectExcel,
  onSelectEmail,
  onSelectWhatsApp,
  disabled = false,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  function handleSelect(key: MenuKey) {
    setOpen(false);
    if (key === 'pdf')      onSelectPDF();
    if (key === 'excel')    onSelectExcel();
    if (key === 'email')    onSelectEmail();
    if (key === 'whatsapp') onSelectWhatsApp();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen((v) => !v); }}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
          bg-blue-600 hover:bg-blue-700 text-white
          transition-colors shadow-sm
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <SendHorizontal size={15} />
        Send / Export
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="
          absolute right-0 mt-1 w-52 rounded-md shadow-lg
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          z-50 py-1
        ">
          {MENU_ITEMS.map(({ label, Icon, key }, idx) => (
            <>
              {/* Divider before send options */}
              {idx === 2 && (
                <div key="divider" className="my-1 border-t border-gray-100 dark:border-gray-700" />
              )}
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(key)}
                className="
                  w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left
                  text-gray-700 dark:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  transition-colors
                "
              >
                <Icon size={14} className="shrink-0 text-gray-400 dark:text-gray-500" />
                {label}
              </button>
            </>
          ))}
        </div>
      )}
    </div>
  );
}
