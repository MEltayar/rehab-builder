import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
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
