// Product routes — public read, protected create/update/delete/reorder.
import { prisma } from '../lib/prisma.js'

// Shape the incoming body into a clean, typed Product record. Used by both
// create and update so validation stays in one place. `category` is a free
// slug now (categories are managed in the DB), stored as-is.
function normalize(d = {}) {
  return {
    sku: String(d.sku || '').trim(),
    category: String(d.category || '').trim(),
    carName: String(d.carName || '').trim(),
    price: Math.max(0, Math.round(Number(d.price) || 0)),
    nameUz: String(d.nameUz || '').trim(),
    nameRu: String(d.nameRu || '').trim(),
    nameEn: String(d.nameEn || '').trim(),
    imageUrl: d.imageUrl ? String(d.imageUrl).trim() : null,
    displayOrder: Number.isFinite(Number(d.displayOrder)) ? Number(d.displayOrder) : 0,
  }
}

function validate(data) {
  if (!data.sku) return 'SKU (artikul) kerak'
  if (!data.nameUz) return "O'zbekcha nomi kerak"
  if (!data.carName) return 'Avtomobil modeli kerak'
  if (!data.category) return 'Kategoriya kerak'
  return null
}

export default async function productRoutes(app) {
  // GET /api/products — public, ordered for display.
  app.get('/', async () => {
    return prisma.product.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })
  })

  // POST /api/products — create.
  app.post('/', { preHandler: [app.auth] }, async (req, reply) => {
    const data = normalize(req.body)
    const err = validate(data)
    if (err) return reply.code(400).send({ error: err })
    try {
      const created = await prisma.product.create({ data })
      reply.code(201)
      return created
    } catch (e) {
      if (e.code === 'P2002') return reply.code(409).send({ error: 'Bu SKU allaqachon mavjud' })
      throw e
    }
  })

  // PUT /api/products/:id — full update.
  app.put('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    const data = normalize(req.body)
    const err = validate(data)
    if (err) return reply.code(400).send({ error: err })
    try {
      return await prisma.product.update({ where: { id }, data })
    } catch (e) {
      if (e.code === 'P2002') return reply.code(409).send({ error: 'Bu SKU allaqachon mavjud' })
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Mahsulot topilmadi' })
      throw e
    }
  })

  // DELETE /api/products/:id
  app.delete('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    try {
      await prisma.product.delete({ where: { id } })
      return { ok: true }
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Mahsulot topilmadi' })
      throw e
    }
  })

  // PUT /api/products/reorder — body { ids: [...] }; sets displayOrder by position.
  app.put('/reorder', { preHandler: [app.auth] }, async (req, reply) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null
    if (!ids) return reply.code(400).send({ error: 'ids массив kerak' })
    await prisma.$transaction(
      ids.map((id, i) => prisma.product.update({ where: { id: Number(id) }, data: { displayOrder: i } }))
    )
    return { ok: true }
  })
}
