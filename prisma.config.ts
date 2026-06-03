import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Prisma 7 config — connection URL lives here now (no longer in schema.prisma).
// The SQLite file sits at server/data.db; both the migration engine (this url)
// and the runtime client (server/lib/prisma.js adapter) point at the same file.
export default defineConfig({
  schema: path.join('server', 'prisma', 'schema.prisma'),
  datasource: {
    url: 'file:./server/data.db',
  },
  migrations: {
    seed: 'node server/prisma/seed.js',
  },
})
