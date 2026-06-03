// Category routes — public read, protected create/update/delete/reorder.
// Product.category stores a category `slug`; slugs are immutable once created so
// existing products never get orphaned. Deleting a category that still has
// products is blocked.
import { prisma } from '../lib/prisma.js'

function slugify(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cat'
}

async function uniqueSlug(base) {
  let slug = base
  let i = 1
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.category.findUnique({ where: { slug } })) {
    i += 1
    slug = `${base}-${i}`
  }
  return slug
}

function normalizeNames(d = {}) {
  return {
    nameUz: String(d.nameUz || '').trim(),
    nameRu: String(d.nameRu || '').trim(),
    nameEn: String(d.nameEn || '').trim(),
    displayOrder: Number.isFinite(Number(d.displayOrder)) ? Number(d.displayOrder) : 0,
  }
}

function validate(names) {
  if (!names.nameUz) return "O'zbekcha nom kerak"
  return null
}

export default async function categoryRoutes(app) {
  app.get('/', async () => {
    return prisma.category.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] })
  })

  app.post('/', { preHandler: [app.auth] }, async (req, reply) => {
    const names = normalizeNames(req.body)
    const err = validate(names)
    if (err) return reply.code(400).send({ error: err })
    const slug = await uniqueSlug(slugify(req.body?.slug || names.nameEn || names.nameUz))
    reply.code(201)
    return prisma.category.create({ data: { ...names, slug } })
  })

  // Update names/order only — slug stays fixed so products keep matching.
  app.put('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    const names = normalizeNames(req.body)
    const err = validate(names)
    if (err) return reply.code(400).send({ error: err })
    try {
      return await prisma.category.update({ where: { id }, data: names })
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Kategoriya topilmadi' })
      throw e
    }
  })

  app.delete('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    const cat = await prisma.category.findUnique({ where: { id } })
    if (!cat) return reply.code(404).send({ error: 'Kategoriya topilmadi' })
    const inUse = await prisma.product.count({ where: { category: cat.slug } })
    if (inUse > 0) {
      return reply.code(409).send({ error: `Bu kategoriyada ${inUse} ta mahsulot bor. Avval ularni boshqa kategoriyaga o'tkazing yoki o'chiring.` })
    }
    await prisma.category.delete({ where: { id } })
    return { ok: true }
  })

  app.put('/reorder', { preHandler: [app.auth] }, async (req, reply) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null
    if (!ids) return reply.code(400).send({ error: 'ids массив kerak' })
    await prisma.$transaction(
      ids.map((id, i) => prisma.category.update({ where: { id: Number(id) }, data: { displayOrder: i } }))
    )
    return { ok: true }
  })
}
