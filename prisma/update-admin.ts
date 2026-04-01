import path from 'node:path'
import { createInterface } from 'node:readline'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || `file:${path.join(import.meta.dirname, 'dev.db')}`,
})
const prisma = new PrismaClient({ adapter })

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { isAdmin: true } })
  if (!admin) {
    console.error('No admin user found. Run db:seed first.')
    process.exit(1)
  }

  console.log(`Current admin username: "${admin.username}"`)

  const username = (await prompt('New username (enter to keep current): ')) || admin.username
  const password = await prompt('New password: ')

  if (!password) {
    console.error('Password cannot be empty.')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: admin.id },
    data: { username, password: hashedPassword },
  })

  console.log(`Admin updated: "${admin.username}" → "${username}"`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
