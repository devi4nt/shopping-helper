const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/auth/me']

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/') || PUBLIC_ROUTES.includes(path)) {
    return
  }

  await requireAuth(event)
})
