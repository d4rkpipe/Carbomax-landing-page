// Prisma client (Prisma 7) — better-sqlite3 driver adapter.
// The DB file lives at server/data.db; the path is resolved absolutely so the
// server works regardless of the cwd it's launched from.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'data.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })

export const prisma = new PrismaClient({ adapter })
