import type { H3Event } from 'h3'
import type { Item } from '../../generated/prisma/client'
import type { ItemUpdateInput } from '../../generated/prisma/models'
import {
  createItemSchema,
  updateItemSchema,
  type CreateItemInput,
  type UpdateItemInput,
} from './itemSchemas'

/**
 * Load an item and verify it belongs to the given list. Throws 404
 * if the item is missing or belongs to a different list (this cross-
 * check prevents item-id forgery across lists).
 */
async function loadItemOn(listId: string, itemId: string): Promise<Item> {
  const item = await prisma.item.findUnique({ where: { id: itemId } })
  if (!item || item.listId !== listId) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }
  return item
}

// ---------------------------------------------------------------------------
// Pure-ish primitives (no H3, no auth — take a listId and validated input).
// Usable from scripts, tasks, or other callers.
// ---------------------------------------------------------------------------

export async function createItem(listId: string, input: CreateItemInput): Promise<Item> {
  const item = await prisma.item.create({
    data: {
      name: input.name,
      quantity: input.quantity,
      listId,
    },
  })
  broadcast(listId, { type: 'item:created', listId, data: item })
  return item
}

export async function updateItem(
  listId: string,
  itemId: string,
  input: UpdateItemInput,
): Promise<Item> {
  await loadItemOn(listId, itemId)

  const data: ItemUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  if (input.quantity !== undefined) data.quantity = input.quantity
  if (input.checked !== undefined) {
    data.checked = input.checked
    data.checkedAt = input.checked ? new Date() : null
  }

  const updated = await prisma.item.update({ where: { id: itemId }, data })
  broadcast(listId, { type: 'item:updated', listId, data: updated })
  return updated
}

export async function deleteItem(listId: string, itemId: string): Promise<void> {
  await loadItemOn(listId, itemId)
  await prisma.item.delete({ where: { id: itemId } })
  broadcast(listId, { type: 'item:deleted', listId, data: { id: itemId } })
}

// ---------------------------------------------------------------------------
// H3-coupled wrappers — collapse an endpoint handler to a single call.
// Each one: verifies write access on the :id list, reads+validates body,
// invokes the matching primitive, broadcasts, returns the result.
// ---------------------------------------------------------------------------

function requireItemId(event: H3Event): string {
  const itemId = getRouterParam(event, 'itemId')
  if (!itemId) {
    throw createError({ statusCode: 400, statusMessage: 'Item id is required' })
  }
  return itemId
}

export async function createItemFromEvent(event: H3Event): Promise<Item> {
  const list = await requireListAccess(event, 'write')
  const input = await readValidatedBody(event, zodValidator(createItemSchema))
  return createItem(list.id, input)
}

export async function updateItemFromEvent(event: H3Event): Promise<Item> {
  const list = await requireListAccess(event, 'write')
  const itemId = requireItemId(event)
  const input = await readValidatedBody(event, zodValidator(updateItemSchema))
  return updateItem(list.id, itemId, input)
}

export async function deleteItemFromEvent(event: H3Event): Promise<{ ok: true }> {
  const list = await requireListAccess(event, 'write')
  const itemId = requireItemId(event)
  await deleteItem(list.id, itemId)
  return { ok: true }
}
