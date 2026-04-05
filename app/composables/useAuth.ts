interface User {
  id: string
  username: string
  isAdmin: boolean
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)

  async function fetchUser() {
    // Use useRequestFetch so that during SSR the incoming request's
    // session cookie is forwarded to /api/auth/me. Bare $fetch on the
    // server does not forward cookies, which causes login state to be
    // lost on page refresh.
    const request = useRequestFetch()
    try {
      user.value = await request<User | null>('/api/auth/me')
    } catch {
      user.value = null
    }
    return user.value
  }

  async function login(username: string, password: string) {
    const data = await $fetch<User>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    user.value = data
    return data
  }

  async function register(code: string, username: string, password: string) {
    const data = await $fetch<User>('/api/auth/register', {
      method: 'POST',
      body: { code, username, password },
    })
    user.value = data
    return data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  return { user, fetchUser, login, register, logout }
}
