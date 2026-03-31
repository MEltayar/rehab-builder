import type { ColorPalette } from '../../../types';

export const colorPalettes: ColorPalette[] = [
  {
    id: 'palette-teal',
    name: 'Teal',
    colorScheme: { primary: '#0f766e', secondary: '#0d9488', light: '#ccfbf1', text: '#ffffff', darkText: '#134e4a' },
  },
  {
    id: 'palette-sky',
    name: 'Sky',
    colorScheme: { primary: '#0369a1', secondary: '#0284c7', light: '#e0f2fe', text: '#ffffff', darkText: '#0c4a6e' },
  },
  {
    id: 'palette-indigo',
    name: 'Indigo',
    colorScheme: { primary: '#4338ca', secondary: '#6366f1', light: '#e0e7ff', text: '#ffffff', darkText: '#1e1b4b' },
  },
  {
    id: 'palette-violet',
    name: 'Violet',
    colorScheme: { primary: '#7c3aed', secondary: '#8b5cf6', light: '#ede9fe', text: '#ffffff', darkText: '#2e1065' },
  },
  {
    id: 'palette-rose',
    name: 'Rose',
    colorScheme: { primary: '#e11d48', secondary: '#f43f5e', light: '#ffe4e6', text: '#ffffff', darkText: '#881337' },
  },
  {
    id: 'palette-amber',
    name: 'Amber',
    colorScheme: { primary: '#b45309', secondary: '#d97706', light: '#fef3c7', text: '#ffffff', darkText: '#78350f' },
  },
  {
    id: 'palette-emerald',
    name: 'Emerald',
    colorScheme: { primary: '#059669', secondary: '#10b981', light: '#d1fae5', text: '#ffffff', darkText: '#064e3b' },
  },
  {
    id: 'palette-orange',
    name: 'Orange',
    colorScheme: { primary: '#c2410c', secondary: '#ea580c', light: '#ffedd5', text: '#ffffff', darkText: '#7c2d12' },
  },
  {
    id: 'palette-slate',
    name: 'Slate',
    colorScheme: { primary: '#475569', secondary: '#64748b', light: '#f1f5f9', text: '#ffffff', darkText: '#1e293b' },
  },
  {
    id: 'palette-stone',
    name: 'Stone',
    colorScheme: { primary: '#57534e', secondary: '#78716c', light: '#f5f5f4', text: '#ffffff', darkText: '#1c1917' },
  },
  {
    id: 'palette-crimson',
    name: 'Crimson',
    colorScheme: { primary: '#9f1239', secondary: '#be123c', light: '#fce7f3', text: '#ffffff', darkText: '#500724' },
  },
  {
    id: 'palette-forest',
    name: 'Forest',
    colorScheme: { primary: '#166534', secondary: '#15803d', light: '#dcfce7', text: '#ffffff', darkText: '#052e16' },
  },
];

export function getEffectivePalette(id: string | undefined): ColorPalette {
  if (!id) return colorPalettes[0];
  return colorPalettes.find((p) => p.id === id) ?? colorPalettes[0];
}
