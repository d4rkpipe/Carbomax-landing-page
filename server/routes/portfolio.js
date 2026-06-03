// Portfolio routes — public read, protected create/update/delete/reorder.
import { prisma } from '../lib/prisma.js'

function normalize(d = {}) {
  return {
    carName: String(d.carName || '').trim(),
    captionUz: String(d.captionUz || '').trim(),
    captionRu: String(d.captionRu || '').trim(),
    captionEn: String(d.captionEn || '').trim(),
    imageUrl: d.imageUrl ? String(d.imageUrl).trim() : null,
    displayOrder: Number.isFinite(Number(d.displayOrder)) ? Number(d.displayOrder) : 0,
  }
}

function validate(data) {
  if (!data.carName) return 'Avtomobil nomi kerak'
  if (!data.captionUz) return "O'zbekcha izoh kerak"
  return null
}

export default async function portfolioRoutes(app) {
  app.get('/', async () => {
    return prisma.portfolioItem.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })
  })

  app.post('/', { preHandler: [app.auth] }, async (req, reply) => {
    const data = normalize(req.body)
    const err = validate(data)
    if (err) return reply.code(400).send({ error: err })
    reply.code(201)
    return prisma.portfolioItem.create({ data })
  })

  app.put('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    const data = normalize(req.body)
    const err = validate(data)
    if (err) return reply.code(400).send({ error: err })
    try {
      return await prisma.portfolioItem.update({ where: { id }, data })
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Ish topilmadi' })
      throw e
    }
  })

  app.delete('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    try {
      await prisma.portfolioItem.delete({ where: { id } })
      return { ok: true }
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Ish topilmadi' })
      throw e
    }
  })

  app.put('/reorder', { preHandler: [app.auth] }, async (req, reply) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null
    if (!ids) return reply.code(400).send({ error: 'ids массив kerak' })
    await prisma.$transaction(
      ids.map((id, i) => prisma.portfolioItem.update({ where: { id: Number(id) }, data: { displayOrder: i } }))
    )
    return { ok: true }
  })
}
