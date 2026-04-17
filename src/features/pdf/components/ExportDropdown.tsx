import { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileText, Loader2, Lock, Mail, MessageCircle, SendHorizontal, Sheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlanStore } from '../../../store/planStore';

interface ExportDropdownProps {
  onSelectPDF: () => void;
  onSelectExcel: () => void;
  onSelectEmail: () => void;
  onSelectWhatsApp: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function ExportDropdown({
  onSelectPDF,
  onSelectExcel,
  onSelectEmail,
  onSelectWhatsApp,
  disabled = false,
  loading = false,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const limits = usePlanStore((s) => s.limits)();

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleSelect(key: string, allowed: boolean) {
    if (!allowed) { navigate('/pricing'); return; }
    setOpen(false);
    if (key === 'pdf')      onSelectPDF();
    if (key === 'excel')    onSelectExcel();
    if (key === 'email')    onSelectEmail();
    if (key === 'whatsapp') onSelectWhatsApp();
  }

  const MENU_ITEMS = [
    { label: 'Export PDF',        Icon: FileText,      key: 'pdf',      allowed: limits.canExportPDF,   lockLabel: 'Pro required'        },
    { label: 'Export Excel',      Icon: Sheet,         key: 'excel',    allowed: limits.canExportExcel, lockLabel: 'Pro Yearly required' },
    { label: 'Send via Email',    Icon: Mail,          key: 'email',    allowed: limits.canShare,        lockLabel: 'Pro Yearly required' },
    { label: 'Send via WhatsApp', Icon: MessageCircle, key: 'whatsapp', allowed: limits.canShare,        lockLabel: 'Pro Yearly required' },
  ] as const;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen((v) => !v); }}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
          bg-orange-500 hover:bg-orange-600 text-white
          transition-colors shadow-sm
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <SendHorizontal size={15} />
        )}
        {loading ? 'Exporting…' : 'Send / Export'}
        {!loading && <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <div className="
          absolute right-0 mt-1 w-56 rounded-md shadow-lg
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          z-50 py-1
        ">
          {MENU_ITEMS.map(({ label, Icon, key, allowed, lockLabel }, idx) => (
            <div key={key}>
              {idx === 2 && (
                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
              )}
              <button
                type="button"
                onClick={() => handleSelect(key, allowed)}
                title={!allowed ? lockLabel : undefined}
                className={`
                  w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left
                  transition-colors
                  ${allowed
                    ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-not-allowed'
                  }
                `}
              >
                <Icon size={14} className="shrink-0 text-gray-400 dark:text-gray-500" />
                <span className="flex-1">{label}</span>
                {!allowed && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">
                    <Lock size={9} />
                    {lockLabel.includes('Yearly') ? 'Yearly' : 'Pro'}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
