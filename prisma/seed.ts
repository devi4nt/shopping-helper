import path from 'node:path'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || `file:${path.join(import.meta.dirname, 'dev.db')}`,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'changeme'

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    console.log(`Admin user "${username}" already exists, skipping.`)
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const admin = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      isAdmin: true,
    },
  })

  console.log(`Admin user created: "${admin.username}" (id: ${admin.id})`)
  console.log('Remember to change the default password!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
