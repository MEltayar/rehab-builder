import { useConfirmStore } from '../../store/confirmStore';

export default function ConfirmDialog() {
  const options = useConfirmStore((s) => s.options);
  const close = useConfirmStore((s) => s.close);

  if (!options) return null;

  const isDanger = options.variant === 'danger';

  function handleConfirm() {
    options!.onConfirm();
    close();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {options.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {options.message}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {options.confirmLabel ?? (isDanger ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
