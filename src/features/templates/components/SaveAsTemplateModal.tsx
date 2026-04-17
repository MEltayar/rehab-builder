import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useTemplateStore } from '../../../store/templateStore';
import { useToastStore } from '../../../store/toastStore';
import type { Session } from '../../../types';

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  defaultName: string;
  defaultCondition: string;
}

export default function SaveAsTemplateModal({
  isOpen,
  onClose,
  sessions,
  defaultName,
  defaultCondition,
}: SaveAsTemplateModalProps) {
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const templates = useTemplateStore((s) => s.templates);
  const showToast = useToastStore((s) => s.showToast);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(defaultName);
    setCondition(defaultCondition);
    setDescription('');
    setNameError('');
    setTimeout(() => nameRef.current?.focus(), 50);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, defaultName, defaultCondition, onClose]);

  if (!isOpen) return null;

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Template name is required.');
      nameRef.current?.focus();
      return;
    }
    const duplicate = templates.some(
      (t) => t.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (duplicate) {
      setNameError('A template with this name already exists. Please choose a different name.');
      nameRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      await addTemplate({
        id: crypto.randomUUID(),
        name: trimmedName,
        description: description.trim() || undefined,
        condition: condition.trim(),
        tags: [],
        sessions: JSON.parse(JSON.stringify(sessions)),
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save template:', err);
      showToast('Failed to save template. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Save as Template
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              placeholder="e.g. ACL Recovery Phase 1"
              className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {nameError && (
              <p className="text-xs text-red-600 dark:text-red-400">{nameError}</p>
            )}
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Condition (optional)
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. ACL reconstruction"
              className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template's purpose…"
              rows={3}
              className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Session summary */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} and{' '}
            {sessions.reduce((s, sess) => s + sess.exercises.length, 0)} exercise
            {sessions.reduce((s, sess) => s + sess.exercises.length, 0) !== 1 ? 's' : ''} will be saved.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-md transition-colors"
          >
            {saving ? 'Saving…' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
