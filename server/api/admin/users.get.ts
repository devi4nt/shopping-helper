export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      isAdmin: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return users
})
