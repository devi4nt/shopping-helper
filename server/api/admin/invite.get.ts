export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const invites = await prisma.inviteCode.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return invites
})
