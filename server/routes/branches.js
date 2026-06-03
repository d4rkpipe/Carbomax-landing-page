// Branch routes — public read, protected create/update/delete/reorder.
import { prisma } from '../lib/prisma.js'

const clean = (s, max = 300) => String(s ?? '').trim().slice(0, max)
const url = (s) => { const v = clean(s, 400); return v || null }

function normalize(d = {}) {
  return {
    name: clean(d.name, 120),
    addressUz: clean(d.addressUz),
    addressRu: clean(d.addressRu),
    addressEn: clean(d.addressEn),
    phone: clean(d.phone, 60),
    hoursUz: clean(d.hoursUz, 200),
    hoursRu: clean(d.hoursRu, 200),
    hoursEn: clean(d.hoursEn, 200),
    lat: clean(d.lat, 40),
    lng: clean(d.lng, 40),
    telegram: url(d.telegram),
    instagram: url(d.instagram),
    facebook: url(d.facebook),
    youtube: url(d.youtube),
    displayOrder: Number.isFinite(Number(d.displayOrder)) ? Number(d.displayOrder) : 0,
  }
}

function validate(d) {
  if (!d.name) return 'Filial nomi kerak'
  if (!d.addressUz) return "O'zbekcha manzil kerak"
  if (!d.phone) return 'Telefon kerak'
  return null
}

export default async function branchRoutes(app) {
  app.get('/', async () => {
    return prisma.branch.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] })
  })

  app.post('/', { preHandler: [app.auth] }, async (req, reply) => {
    const data = normalize(req.body)
    const err = validate(data)
    if (err) return reply.code(400).send({ error: err })
    reply.code(201)
    return prisma.branch.create({ data })
  })

  app.put('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    const data = normalize(req.body)
    const err = validate(data)
    if (err) return reply.code(400).send({ error: err })
    try {
      return await prisma.branch.update({ where: { id }, data })
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Filial topilmadi' })
      throw e
    }
  })

  app.delete('/:id', { preHandler: [app.auth] }, async (req, reply) => {
    const id = Number(req.params.id)
    try {
      await prisma.branch.delete({ where: { id } })
      return { ok: true }
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Filial topilmadi' })
      throw e
    }
  })

  app.put('/reorder', { preHandler: [app.auth] }, async (req, reply) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null
    if (!ids) return reply.code(400).send({ error: 'ids массив kerak' })
    await prisma.$transaction(
      ids.map((id, i) => prisma.branch.update({ where: { id: Number(id) }, data: { displayOrder: i } }))
    )
    return { ok: true }
  })
}
