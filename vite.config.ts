import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Chunks that must NEVER be preloaded on initial page load — they are only
// needed deep inside specific flows (PDF/Excel export, drag-and-drop in the
// program builder). Preloading them on mobile data stalls first paint.
const DEFERRED_CHUNKS = ['pdf', 'excel', 'dnd']

// Dashboard is the default route — preload it so the browser starts
// downloading it in parallel with the main bundle instead of waiting for
// React to boot and the router to request it.
function preloadRoutePlugin(chunkName: string): Plugin {
  return {
    name: 'preload-default-route',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html
        const chunk = Object.values(bundle).find(
          (c) => c.type === 'chunk' && c.name === chunkName,
        )
        if (!chunk || chunk.type !== 'chunk') return html
        const tag = `    <link rel="modulepreload" crossorigin href="/${chunk.fileName}">\n  `
        return html.replace('</head>', `${tag}</head>`)
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), preloadRoutePlugin('DashboardPage')],
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
