import type { H3Event } from 'h3'

const SESSION_CONFIG = {
  password: process.env.NUXT_SESSION_PASSWORD || 'change-me-to-a-random-string-at-least-32-chars-long!!',
  name: 'shopping-helper-session',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  cookie: {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    // h3's default is secure: true, which prevents the cookie from being
    // stored over plain HTTP (including localhost in Safari). Only require
    // secure transport in production deploys.
    secure: process.env.NODE_ENV === 'production',
  },
}

interface SessionData {
  userId?: string
}

export async function getSessionData(event: H3Event): Promise<SessionData> {
  const session = await useSession<SessionData>(event, SESSION_CONFIG)
  return session.data
}

export async function createSession(event: H3Event, userId: string) {
  const session = await useSession<SessionData>(event, SESSION_CONFIG)
  await session.update({ userId })
}

export async function destroySession(event: H3Event) {
  const session = await useSession<SessionData>(event, SESSION_CONFIG)
  await session.clear()
}

export async function requireAuth(event: H3Event) {
  const { userId } = await getSessionData(event)
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, isAdmin: true },
  })

  if (!user) {
    await destroySession(event)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  event.context.user = user
  return user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)
  if (!user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}
