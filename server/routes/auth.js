// Auth routes — admin login (bcrypt + JWT) and token check.
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'

export default async function authRoutes(app) {
  // POST /api/auth/login  { username, password } → { token, username }
  // Rate-limited to blunt password brute-force.
  app.post('/login', { config: { rateLimit: { max: 10, timeWindow: '5 minutes' } } }, async (req, reply) => {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return reply.code(400).send({ error: 'Login va parol kerak' })
    }
    const user = await prisma.adminUser.findUnique({ where: { username: String(username) } })
    // Compare against a dummy hash even when the user is missing so response
    // timing doesn't reveal whether the username exists.
    const hash = user?.passwordHash || '$2b$10$3RjV2eUQ63XZbpMpiIFBP.i1MqVBr2O1WQrmYihdIVOroDL6KZK2G'
    const ok = await bcrypt.compare(String(password), hash)
    if (!user || !ok) {
      return reply.code(401).send({ error: "Login yoki parol noto'g'ri" })
    }
    const token = app.jwt.sign({ id: user.id, username: user.username }, { expiresIn: '7d' })
    return { token, username: user.username }
  })

  // GET /api/auth/me — admin panel calls this on load to validate a stored token.
  app.get('/me', { preHandler: [app.auth] }, async (req) => {
    return { user: { id: req.user.id, username: req.user.username } }
  })
}
