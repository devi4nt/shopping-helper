export default defineEventHandler(async (event) => {
  const user = event.context.user
  const listId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!body?.userId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const list = await prisma.list.findUnique({ where: { id: listId } })

  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  if (list.ownerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Only the list owner can manage shares' })
  }

  await prisma.listShare.deleteMany({
    where: { listId: listId!, userId: body.userId },
  })

  return { ok: true }
})
