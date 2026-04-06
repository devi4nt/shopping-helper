import type { H3Event } from 'h3'
import type { List, ListShare } from '../../generated/prisma/client'
import type { ListInclude } from '../../generated/prisma/models'

export type AccessLevel = 'read' | 'write' | 'admin'
export type ListWithShares = List & { shares: ListShare[] }

/**
 * Pure predicate — decide whether a user has the requested access level
 * to a list, given the list's ownership/share data.
 *
 * Rules:
 *   - owner   → any level
 *   - admin   → owner only
 *   - read/write → owner OR sharedWithAll OR explicit share member
 */
export function canAccess(
  list: Pick<List, 'ownerId' | 'sharedWithAll'> & { shares: Pick<ListShare, 'userId'>[] },
  userId: string,
  level: AccessLevel,
): boolean {
  if (list.ownerId === userId) return true
  if (level === 'admin') return false
  return list.sharedWithAll || list.shares.some((s) => s.userId === userId)
}

/**
 * Build a Prisma `where` clause for "lists visible to userId" — for use
 * in collection queries (e.g. GET /api/lists). Read-level visibility.
 */
export function visibleListsWhere(userId: string) {
  return {
    OR: [
      { ownerId: userId },
      { sharedWithAll: true },
      { shares: { some: { userId } } },
    ],
  }
}

/**
 * Load a list by id (from :id route param unless overridden), enforce
 * the requested access level for the session user, and return the list
 * with its shares. Throws:
 *   - 401 if no authenticated user on the event
 *   - 400 if the list id is missing
 *   - 404 if the list does not exist
 *   - 403 if the user lacks the requested level
 *
 * Callers that need additional relations in the response can pass
 * `opts.include`; it is merged with `{ shares: true }`. The TS return
 * type stays `ListWithShares`, but at runtime the returned object
 * contains the extra relations.
 */
export async function requireListAccess(
  event: H3Event,
  level: AccessLevel,
  opts?: { listId?: string; include?: ListInclude },
): Promise<ListWithShares> {
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const listId = opts?.listId ?? getRouterParam(event, 'id')
  if (!listId) {
    throw createError({ statusCode: 400, statusMessage: 'List id is required' })
  }

  // Ensure shares are always loaded (needed for the access decision).
  // Callers can override the shares shape (e.g. to nest user data) by
  // providing their own `shares` key in `opts.include`.
  const include: ListInclude = { shares: true, ...opts?.include }

  const list = (await prisma.list.findUnique({
    where: { id: listId },
    include,
  })) as ListWithShares | null

  if (!list) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  if (!canAccess(list, user.id, level)) {
    const statusMessage =
      level === 'admin' ? 'Only the list owner can do this' : 'Access denied'
    throw createError({ statusCode: 403, statusMessage })
  }

  return list
}
