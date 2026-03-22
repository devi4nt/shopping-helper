export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  const list = await prisma.list.findUnique({ where: { id } })
  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  if (list.ownerId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Only the list owner can delete this list' })
  }

  await prisma.list.delete({ where: { id } })

  return { ok: true }
})
