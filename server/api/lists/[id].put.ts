import { z } from 'zod'

const updateListSchema = z.object({
  name: z.string().trim().min(1, 'List name is required'),
})

export default defineEventHandler(async (event) => {
  const list = await requireListAccess(event, 'write')
  const input = await readValidatedBody(event, zodValidator(updateListSchema))

  const updated = await prisma.list.update({
    where: { id: list.id },
    data: { name: input.name },
  })

  return updated
})
