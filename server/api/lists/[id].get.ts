export default defineEventHandler(async (event) => {
  return await requireListAccess(event, 'read', {
    include: {
      owner: { select: { id: true, username: true } },
      items: { where: { checked: false }, orderBy: { name: 'asc' } },
      shares: { include: { user: { select: { id: true, username: true } } } },
    },
  })
})
