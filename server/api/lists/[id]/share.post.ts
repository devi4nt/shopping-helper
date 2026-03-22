export default defineEventHandler(async (event) => {
  const user = event.context.user
  const listId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!body?.username?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Username is required' })
  }

  const list = await prisma.list.findUnique({ where: { id: listId } })

  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  if (list.ownerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Only the list owner can share this list' })
  }

  const targetUser = await prisma.user.findUnique({
    where: { username: body.username.trim() },
    select: { id: true, username: true },
  })

  if (!targetUser) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  if (targetUser.id === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot share with yourself' })
  }

  const existingShare = await prisma.listShare.findUnique({
    where: { listId_userId: { listId: listId!, userId: targetUser.id } },
  })

  if (existingShare) {
    throw createError({ statusCode: 400, statusMessage: 'List already shared with this user' })
  }

  const share = await prisma.listShare.create({
    data: { listId: listId!, userId: targetUser.id },
    include: { user: { select: { id: true, username: true } } },
  })

  // Update list type to shared if it was personal
  if (list.type === 'personal') {
    await prisma.list.update({ where: { id: listId }, data: { type: 'shared' } })
  }

  return share
})
