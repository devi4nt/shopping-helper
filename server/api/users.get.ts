export default defineEventHandler(async (event) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
    },
    orderBy: { username: 'asc' },
  })

  return users
})
