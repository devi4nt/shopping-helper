export default defineEventHandler(async (event) => {
  const user = event.context.user
  const listId = getRouterParam(event, 'id')
  const itemId = getRouterParam(event, 'itemId')
  const body = await readBody(event)

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

  const updateData: Record<string, any> = {}

  if (body.name !== undefined) updateData.name = body.name.trim()
  if (body.quantity !== undefined) updateData.quantity = Math.max(1, parseInt(body.quantity) || 1)
  if (body.checked !== undefined) {
    updateData.checked = body.checked
    updateData.checkedAt = body.checked ? new Date() : null
  }

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: updateData,
  })

  broadcast(listId!, { type: 'item:updated', listId: listId!, data: updated })

  return updated
})
