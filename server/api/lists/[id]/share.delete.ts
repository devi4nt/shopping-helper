import { z } from 'zod'

const unshareSchema = z.object({
  userId: z.string().min(1, 'User id is required'),
})

export default defineEventHandler(async (event) => {
  const list = await requireListAccess(event, 'admin')
  const input = await readValidatedBody(event, zodValidator(unshareSchema))

  await prisma.listShare.deleteMany({
    where: { listId: list.id, userId: input.userId },
  })

  return { ok: true }
})
