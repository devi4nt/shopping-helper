export default defineEventHandler(async (event) => {
  const list = await requireListAccess(event, 'admin', {
    include: {
      shares: {
        include: { user: { select: { id: true, username: true } } },
      },
    },
  })

  // The richer shares shape was attached at runtime via opts.include.
  return (list as { shares: unknown }).shares
})
