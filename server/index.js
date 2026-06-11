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
import rateLimit from '@fastify/rate-limit'
import fastifyStatic from '@fastify/static'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import loyaltyRoutes from './routes/loyalty.js'
import portfolioRoutes from './routes/portfolio.js'
import leadRoutes from './routes/leads.js'
import branchRoutes from './routes/branches.js'
import uploadRoutes from './routes/upload.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const UPLOADS_DIR = path.join(__dirname, 'uploads')

// API_PORT lets dev pin the backend to 3001 even when the harness injects
// PORT=5173 for Vite; production hosts that set PORT are still honoured.
const PORT = Number(process.env.API_PORT) || Number(process.env.PORT) || 3001
const isProd = process.env.NODE_ENV === 'production'

// In production a real JWT_SECRET is mandatory. Never sign admin tokens with the
// committed dev default — anyone with the repo could otherwise forge a 7-day
// admin token. Fail fast instead of silently falling back.
const DEV_JWT_SECRET = 'carbomax-dev-secret-change-in-production'
if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEV_JWT_SECRET)) {
  console.error('FATAL: a unique JWT_SECRET must be set in production (the dev default is not allowed). Refusing to start.')
  process.exit(1)
}
const JWT_SECRET = process.env.JWT_SECRET || DEV_JWT_SECRET

// In production, bind to localhost so only the local reverse proxy (Nginx) can
// reach the API — not the public internet directly. Override with HOST if your
// setup needs it (e.g. HOST=0.0.0.0 when there is no local proxy).
const HOST = process.env.HOST || (isProd ? '127.0.0.1' : '0.0.0.0')

// Ensure the upload target exists before @fastify/static tries to read it.
fs.mkdirSync(path.join(UPLOADS_DIR, 'products'), { recursive: true })

// trustProxy: behind Nginx, read the real client IP from X-Forwarded-For so
// rate-limiting works per-visitor (not per-proxy).
// trustProxy: in prod trust exactly one hop (the local Nginx) so X-Forwarded-For
// can't be spoofed to bypass per-IP rate limits; in dev trust all (no proxy).
const app = Fastify({ logger: true, bodyLimit: 8 * 1024 * 1024, trustProxy: isProd ? 1 : true })

await app.register(cors, { origin: true })
await app.register(jwt, { secret: JWT_SECRET })
await app.register(multipart, { limits: { fileSize: 6 * 1024 * 1024, files: 1 } })
// Opt-in rate limiting (global: false) — applied per-route on login + leads.
await app.register(rateLimit, { global: false })

// Auth guard — used as a route preHandler. Defined before route registration so
// the encapsulated route plugins inherit it.
app.decorate('auth', async (req, reply) => {
  try {
    await req.jwtVerify()
  } catch (e) {
    reply.code(401).send({ error: 'Avtorizatsiya talab qilinadi' })
  }
})

// Hide internal error details (e.g. Prisma's argument dump on a NaN :id) from
// clients: validation errors → clean 400, everything unexpected → generic 500.
app.setErrorHandler((err, req, reply) => {
  if (err?.name === 'PrismaClientValidationError') {
    return reply.code(400).send({ error: "Noto'g'ri so'rov" })
  }
  const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500
  if (status >= 500) {
    req.log.error(err)
    return reply.code(500).send({ error: 'Server xatosi' })
  }
  return reply.code(status).send({ error: err.message || 'Xatolik' })
})

// Baseline security headers on every response.
app.addHook('onRequest', async (req, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff')
  reply.header('X-Frame-Options', 'SAMEORIGIN')
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
})

// Uploaded product images → /media/products/<file> (cached a week — filenames
// are random UUIDs, so a replaced image gets a brand-new URL anyway).
await app.register(fastifyStatic, {
  root: UPLOADS_DIR,
  prefix: '/media/',
  decorateReply: false,
  maxAge: '7d',
})

await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(productRoutes, { prefix: '/api/products' })
await app.register(categoryRoutes, { prefix: '/api/categories' })
await app.register(loyaltyRoutes, { prefix: '/api/loyalty' })
await app.register(portfolioRoutes, { prefix: '/api/portfolio' })
await app.register(leadRoutes, { prefix: '/api/leads' })
await app.register(branchRoutes, { prefix: '/api/branches' })
await app.register(uploadRoutes, { prefix: '/api/upload' })

app.get('/api/health', async () => ({ ok: true }))

// Production: serve the built front-end + admin from dist/.
if (isProd) {
  const DIST = path.join(ROOT, 'dist')
  await app.register(fastifyStatic, {
    root: DIST,
    prefix: '/',
    cacheControl: false,
    setHeaders: (res, filePath) => {
      // Content-hashed bundles (/assets/*) never change under the same name →
      // cache forever; HTML and other files must revalidate so updates show.
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
      }
    },
  })
  // Clean /admin URL → the separately-built admin entry (with or without slash).
  const sendAdmin = (req, reply) => reply.sendFile('admin.html')
  app.get('/admin', sendAdmin)
  app.get('/admin/', sendAdmin)
  // Anything else non-API falls back to the SPA shell — but a missing static
  // file (one with an extension) returns a real 404, not a soft-200 of index.html.
  app.setNotFoundHandler((req, reply) => {
    const url = req.raw.url
    if (url.startsWith('/api') || url.startsWith('/media') || url.startsWith('/assets/') || /\.[a-zA-Z0-9]+(\?|$)/.test(url)) {
      return reply.code(404).send({ error: 'Not found' })
    }
    return reply.sendFile('index.html')
  })
}

try {
  await app.listen({ port: PORT, host: HOST })
  console.log(`Carbomax API → http://${HOST}:${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

// Graceful shutdown — let in-flight requests finish and close cleanly on deploy.
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.once(sig, async () => {
    app.log.info(`${sig} received — shutting down`)
    try { await app.close() } catch (e) { app.log.error(e) }
    process.exit(0)
  })
}
