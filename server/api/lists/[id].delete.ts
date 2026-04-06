export default defineEventHandler(async (event) => {
  const list = await requireListAccess(event, 'admin')
  await prisma.list.delete({ where: { id: list.id } })
  return { ok: true }
})
