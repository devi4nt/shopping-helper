export default defineNuxtRouteMiddleware(async (to) => {
  const publicPages = ['/login', '/register']

  if (publicPages.includes(to.path)) {
    return
  }

  const { user, fetchUser } = useAuth()

  if (!user.value) {
    await fetchUser()
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
