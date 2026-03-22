export default defineEventHandler(async (event) => {
  const user = event.context.user

  const lists = await prisma.list.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { sharedWithAll: true },
        { shares: { some: { userId: user.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, username: true } },
      shares: {
        include: { user: { select: { id: true, username: true } } },
      },
      _count: { select: { items: { where: { checked: false } } } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return lists
})
