// Loyalty-tier routes — public read, protected create/update/delete/reorder.
import { prisma } from '../lib/prisma.js'

function normalize(d = {}) {
  const accent = String(d.accent || '').trim()
  return {
    name: String(d.name || '').trim(),
    percent: String(d.percent || '').trim(),
    accent: /^#[0-9a-fA-F]{3,8}$/.test(accent) ? accent : '#45b958',
    descUz: String(d.descUz || '').trim(),
    descRu: String(d.descRu || '').trim(),
    descEn: String(d.descEn || '').trim(),
    thresholdUz: String(d.thresholdUz || '').trim(),
    thresholdRu: String(d.thresholdRu || '').trim(),
    thresholdEn: String(d.thresholdEn || '').trim(),
    displayOrder: Number.isFinite(Number(d.displayOrder)) ? Number(d.displayOrder) : 0,
  }
}

function validate(data) {
  if (!data.name) return 'Nom kerak (masalan: Regular)'
  if (!data.percent) return 'Foiz kerak (masalan: 5%)'
  if (!data.descUz) return "O'zbekcha tavsif kerak"
  return null
}

export default async function loyaltyRoutes(app) {
  app.get('/', async () => {
    return prisma.loyaltyTier.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })
  })

  app.post('/', { preHandler: [app.auth] }, async (req, reply) => {
    const data = normalize(req.body)
    const err = validate(data)
    if (err) return reply.code(400).send({ error: err })
    reply.code(201)
    return prisma.loyaltyTier.create({ data })
  })

  app.put('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    const data = normalize(req.body)
    const err = validate(data)
    if (err) return reply.code(400).send({ error: err })
    try {
      return await prisma.loyaltyTier.update({ where: { id }, data })
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Pog\'ona topilmadi' })
      throw e
    }
  })

  app.delete('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    try {
      await prisma.loyaltyTier.delete({ where: { id } })
      return { ok: true }
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Pog\'ona topilmadi' })
      throw e
    }
  })

  app.put('/reorder', { preHandler: [app.auth] }, async (req, reply) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null
    if (!ids) return reply.code(400).send({ error: 'ids массив kerak' })
    await prisma.$transaction(
      ids.map((id, i) => prisma.loyaltyTier.update({ where: { id: Number(id) }, data: { displayOrder: i } }))
    )
    return { ok: true }
  })
}
