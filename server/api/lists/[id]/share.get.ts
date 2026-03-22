export default defineEventHandler(async (event) => {
  const user = event.context.user
  const listId = getRouterParam(event, 'id')

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      shares: {
        include: { user: { select: { id: true, username: true } } },
      },
    },
  })

  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  if (list.ownerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Only the list owner can view shares' })
  }

  return list.shares
})
