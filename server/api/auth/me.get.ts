export default defineEventHandler(async (event) => {
  const { userId } = await getSessionData(event)
  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, isAdmin: true },
  })

  return user
})
