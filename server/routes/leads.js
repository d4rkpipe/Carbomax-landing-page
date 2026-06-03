// Lead routes — public submit (quote/booking), protected list/delete for admin.
// Each submission is stored in the DB and pushed to Telegram (best-effort).
import { prisma } from '../lib/prisma.js'
import { sendTelegram } from '../lib/telegram.js'

const clean = (s, max = 500) => String(s ?? '').trim().slice(0, max)

export default async function leadRoutes(app) {
  // POST /api/leads — public submission from the site forms (rate-limited vs spam).
  app.post('/', { config: { rateLimit: { max: 6, timeWindow: '1 minute' } } }, async (req, reply) => {
    const b = req.body || {}
    // Honeypot: real users never fill the hidden "company" field. Pretend
    // success so bots get no signal, but don't store or notify.
    if (clean(b.company)) return { ok: true }

    const type = b.type === 'booking' ? 'booking' : 'quote'
    const name = clean(b.name, 120)
    const phone = clean(b.phone, 40)
    if (!name || !phone) return reply.code(400).send({ error: 'Ism va telefon kerak' })

    const lead = await prisma.lead.create({
      data: {
        type, name, phone,
        topic: clean(b.topic, 160) || null,
        schedule: clean(b.schedule, 80) || null,
        notes: clean(b.notes, 1500) || null,
      },
    })

    // Best-effort Telegram notification — never fail the request on it.
    const lines = type === 'booking'
      ? ['🆕 Yangi vaqt belgilash', `👤 ${name}`, `📞 ${phone}`,
         lead.topic && `🛠 Xizmat: ${lead.topic}`, lead.schedule && `📅 ${lead.schedule}`, lead.notes && `📝 ${lead.notes}`]
      : ['🆕 Yangi murojaat', `👤 ${name}`, `📞 ${phone}`,
         lead.topic && `🏷 Yo‘nalish: ${lead.topic}`, lead.notes && `📝 ${lead.notes}`]
    await sendTelegram(lines.filter(Boolean).join('\n'))

    reply.code(201)
    return { ok: true }
  })

  // GET /api/leads — admin only, newest first.
  app.get('/', { preHandler: [app.auth] }, async () => {
    return prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })
  })

  // DELETE /api/leads/:id — admin only.
  app.delete('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    try {
      await prisma.lead.delete({ where: { id } })
      return { ok: true }
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Murojaat topilmadi' })
      throw e
    }
  })
}
