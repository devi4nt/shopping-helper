export default defineEventHandler(async (event) => {
  const user = event.context.user
  const listId = getRouterParam(event, 'id')
  const itemId = getRouterParam(event, 'itemId')

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { shares: true },
  })

  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const hasAccess =
    list.ownerId === user.id ||
    list.sharedWithAll ||
    list.shares.some((s: any) => s.userId === user.id)

  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } })
  if (!item || item.listId !== listId) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }

  await prisma.item.delete({ where: { id: itemId } })

  broadcast(listId!, { type: 'item:deleted', listId: listId!, data: { id: itemId } })

  return { ok: true }
})
