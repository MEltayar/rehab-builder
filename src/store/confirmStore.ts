import { create } from 'zustand';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
}

interface ConfirmStore {
  options: ConfirmOptions | null;
  showConfirm: (options: ConfirmOptions) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmStore>((set) => ({
  options: null,
  showConfirm: (options) => set({ options }),
  close: () => set({ options: null }),
}));
