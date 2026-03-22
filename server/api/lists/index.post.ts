export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'List name is required' })
  }

  const list = await prisma.list.create({
    data: {
      name: body.name.trim(),
      type: body.type === 'shared' ? 'shared' : 'personal',
      sharedWithAll: body.sharedWithAll === true,
      ownerId: user.id,
    },
    include: {
      owner: { select: { id: true, username: true } },
    },
  })

  return list
})
