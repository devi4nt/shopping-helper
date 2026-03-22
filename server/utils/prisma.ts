import { resolve } from 'node:path'
import { PrismaClient } from '../../generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function getDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL
  if (envUrl) {
    // If it's a relative file: URL, resolve it against CWD
    if (envUrl.startsWith('file:./') || envUrl.startsWith('file:../')) {
      const relativePath = envUrl.replace('file:', '')
      const absolutePath = resolve(process.cwd(), relativePath)
      return `file:${absolutePath}`
    }
    return envUrl
  }
  return `file:${resolve(process.cwd(), 'prisma', 'dev.db')}`
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: getDatabaseUrl() })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
