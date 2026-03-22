import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const code = randomBytes(16).toString('hex')

  const invite = await prisma.inviteCode.create({
    data: {
      code,
      createdBy: event.context.user.id,
    },
  })

  return invite
})
