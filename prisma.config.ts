import path from 'node:path'
import { defineConfig } from 'prisma/config'

const defaultUrl = `file:${path.join(import.meta.dirname, 'prisma', 'dev.db')}`

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL || defaultUrl,
  },
})
