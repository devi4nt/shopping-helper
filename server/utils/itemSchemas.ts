import { z } from 'zod'

export const createItemSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required'),
  quantity: z.coerce.number().int().min(1).default(1),
})

export const updateItemSchema = z.object({
  name: z.string().trim().min(1).optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  checked: z.boolean().optional(),
})

export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
