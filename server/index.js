// Carbomax API server (Fastify 5).
// Dev:  Vite (5173) proxies /api and /media here (3001).
// Prod: NODE_ENV=production also serves the built SPA from dist/ and /admin.
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import loyaltyRoutes from './routes/loyalty.js'
import portfolioRoutes from './routes/portfolio.js'
import leadRoutes from './routes/leads.js'
import uploadRoutes from './routes/upload.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const UPLOADS_DIR = path.join(__dirname, 'uploads')

// API_PORT lets dev pin the backend to 3001 even when the harness injects
// PORT=5173 for Vite; production hosts that set PORT are still honoured.
const PORT = Number(process.env.API_PORT) || Number(process.env.PORT) || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'carbomax-dev-secret-change-in-production'
const isProd = process.env.NODE_ENV === 'production'

// Ensure the upload target exists before @fastify/static tries to read it.
fs.mkdirSync(path.join(UPLOADS_DIR, 'products'), { recursive: true })

const app = Fastify({ logger: true, bodyLimit: 8 * 1024 * 1024 })

await app.register(cors, { origin: true })
await app.register(jwt, { secret: JWT_SECRET })
await app.register(multipart, { limits: { fileSize: 6 * 1024 * 1024, files: 1 } })

// Auth guard — used as a route preHandler. Defined before route registration so
// the encapsulated route plugins inherit it.
app.decorate('auth', async (req, reply) => {
  try {
    await req.jwtVerify()
  } catch (e) {
    reply.code(401).send({ error: 'Avtorizatsiya talab qilinadi' })
  }
})

// Uploaded product images → /media/products/<file>
await app.register(fastifyStatic, {
  root: UPLOADS_DIR,
  prefix: '/media/',
  decorateReply: false,
})

await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(productRoutes, { prefix: '/api/products' })
await app.register(categoryRoutes, { prefix: '/api/categories' })
await app.register(loyaltyRoutes, { prefix: '/api/loyalty' })
await app.register(portfolioRoutes, { prefix: '/api/portfolio' })
await app.register(leadRoutes, { prefix: '/api/leads' })
await app.register(uploadRoutes, { prefix: '/api/upload' })

app.get('/api/health', async () => ({ ok: true }))

// Production: serve the built front-end + admin from dist/.
if (isProd) {
  const DIST = path.join(ROOT, 'dist')
  await app.register(fastifyStatic, {
    root: DIST,
    prefix: '/',
  })
  // Clean /admin URL → the separately-built admin entry.
  app.get('/admin', (req, reply) => reply.sendFile('admin.html'))
  // Anything else non-API falls back to the SPA shell.
  app.setNotFoundHandler((req, reply) => {
    if (req.raw.url.startsWith('/api') || req.raw.url.startsWith('/media')) {
      return reply.code(404).send({ error: 'Not found' })
    }
    return reply.sendFile('index.html')
  })
}

try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`Carbomax API → http://localhost:${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
