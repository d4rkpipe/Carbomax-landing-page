// Image upload — protected. Streams the uploaded file to server/uploads/products/
// under a random filename and returns its public /media URL.
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { pipeline } from 'node:stream/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PRODUCTS_DIR = path.join(__dirname, '..', 'uploads', 'products')

const EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
}

export default async function uploadRoutes(app) {
  // POST /api/upload  (multipart, field name doesn't matter — first file is used)
  app.post('/', { preHandler: [app.auth] }, async (req, reply) => {
    const file = await req.file()
    if (!file) return reply.code(400).send({ error: 'Fayl topilmadi' })

    const ext = EXT[file.mimetype]
    if (!ext) return reply.code(415).send({ error: 'Faqat JPG, PNG, WebP yoki AVIF rasm' })

    fs.mkdirSync(PRODUCTS_DIR, { recursive: true })
    const name = randomUUID() + ext
    const dest = path.join(PRODUCTS_DIR, name)

    await pipeline(file.file, fs.createWriteStream(dest))

    // @fastify/multipart flags the stream truncated when it hits the size limit.
    if (file.file.truncated) {
      fs.rmSync(dest, { force: true })
      return reply.code(413).send({ error: "Rasm hajmi 6MB dan oshmasligi kerak" })
    }

    return { url: `/media/products/${name}` }
  })
}
