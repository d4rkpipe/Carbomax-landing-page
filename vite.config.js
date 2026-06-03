import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

// Serve the admin bundle at the clean /admin URL in dev (Vite would otherwise
// need /admin.html). Production serves the same clean URL via Fastify.
function adminCleanUrl() {
  return {
    name: 'admin-clean-url',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/admin' || req.url === '/admin/') req.url = '/admin.html'
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), adminCleanUrl()],
  server: {
    proxy: {
      // API + uploaded media are served by the Fastify backend (port 3001).
      '/api': 'http://localhost:3001',
      '/media': 'http://localhost:3001',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: r('./index.html'),
        admin: r('./admin.html'),
      },
    },
  },
})
