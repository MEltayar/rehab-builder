import { useToastStore } from '../../store/toastStore';

const TYPE_CLASSES: Record<string, string> = {
  error:   'bg-red-600 text-white',
  success: 'bg-green-600 text-white',
  info:    'bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900',
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start justify-between gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in ${TYPE_CLASSES[toast.type]}`}
          role="alert"
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
