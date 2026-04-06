import { z } from 'zod'

const createListSchema = z.object({
  name: z.string().trim().min(1, 'List name is required'),
  type: z.enum(['personal', 'shared']).default('personal'),
  sharedWithAll: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const input = await readValidatedBody(event, zodValidator(createListSchema))

  const list = await prisma.list.create({
    data: {
      name: input.name,
      type: input.type,
      sharedWithAll: input.sharedWithAll,
      ownerId: user.id,
    },
    include: {
      owner: { select: { id: true, username: true } },
    },
  })

  return list
})
