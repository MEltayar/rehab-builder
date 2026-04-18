import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Chunks that must NEVER be preloaded on initial page load — they are only
// needed deep inside specific flows (PDF/Excel export, drag-and-drop in the
// program builder). Preloading them on mobile data stalls first paint.
const DEFERRED_CHUNKS = ['pdf', 'excel', 'dnd']

export default defineConfig({
  plugins: [react()],
  build: {
    modulePreload: {
      // Strip heavy chunks from the HTML modulepreload list so the browser
      // downloads them only when they're actually needed.
      resolveDependencies: (_file, deps) =>
        deps.filter((d) => !DEFERRED_CHUNKS.some((c) => d.includes(`/${c}-`))),
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'pdf':          ['@react-pdf/renderer'],
          'excel':        ['exceljs'],
          'dnd':          ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'supabase':     ['@supabase/supabase-js'],
        },
      },
    },
  },
})
