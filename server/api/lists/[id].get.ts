export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  const list = await prisma.list.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, username: true } },
      items: {
        where: { checked: false },
        orderBy: { name: 'asc' },
      },
      shares: {
        include: { user: { select: { id: true, username: true } } },
      },
    },
  })

  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  // Check access
  const hasAccess =
    list.ownerId === user.id ||
    list.sharedWithAll ||
    list.shares.some((s: any) => s.userId === user.id)

  if (!hasAccess) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  return list
})
