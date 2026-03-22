interface User {
  id: string
  username: string
  isAdmin: boolean
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)

  async function fetchUser() {
    try {
      user.value = await $fetch<User | null>('/api/auth/me')
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
