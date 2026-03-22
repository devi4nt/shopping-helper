export default defineEventHandler(async (event) => {
  const user = event.context.user
  const listId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Item name is required' })
  }

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

  const item = await prisma.item.create({
    data: {
      name: body.name.trim(),
      quantity: Math.max(1, parseInt(body.quantity) || 1),
      listId: list.id,
    },
  })

  broadcast(list.id, { type: 'item:created', listId: list.id, data: item })

  return item
})
