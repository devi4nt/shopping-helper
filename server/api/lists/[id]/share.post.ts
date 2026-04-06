import { z } from 'zod'

const shareListSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
})

export default defineEventHandler(async (event) => {
  const list = await requireListAccess(event, 'admin')
  const input = await readValidatedBody(event, zodValidator(shareListSchema))

  const targetUser = await prisma.user.findUnique({
    where: { username: input.username },
    select: { id: true, username: true },
  })

  if (!targetUser) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  if (targetUser.id === list.ownerId) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot share with yourself' })
  }

  const existingShare = await prisma.listShare.findUnique({
    where: { listId_userId: { listId: list.id, userId: targetUser.id } },
  })

  if (existingShare) {
    throw createError({ statusCode: 400, statusMessage: 'List already shared with this user' })
  }

  const share = await prisma.listShare.create({
    data: { listId: list.id, userId: targetUser.id },
    include: { user: { select: { id: true, username: true } } },
  })

  // Promote personal list to shared on first share.
  if (list.type === 'personal') {
    await prisma.list.update({ where: { id: list.id }, data: { type: 'shared' } })
  }

  return share
})
