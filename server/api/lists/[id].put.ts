export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const list = await prisma.list.findUnique({ where: { id } })
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  // Check access (shared members can rename)
  const hasAccess =
    list.ownerId === user.id ||
    list.sharedWithAll ||
    (await prisma.listShare.findUnique({
      where: { listId_userId: { listId: id!, userId: user.id } },
    }))

  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'List name is required' })
  }

  const updated = await prisma.list.update({
    where: { id },
    data: { name: body.name.trim() },
  })

  return updated
})
