<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login } = useAuth()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Login</CardTitle>
      <CardDescription>Sign in to your account</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="username">Username</Label>
          <Input
            id="username"
            v-model="username"
            placeholder="Username"
            required
            autocomplete="username"
          />
        </div>
        <div class="space-y-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="Password"
            required
            autocomplete="current-password"
          />
        </div>
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </Button>
      </form>
    </CardContent>
    <CardFooter class="justify-center">
      <p class="text-sm text-muted-foreground">
        Have an invite code?
        <NuxtLink to="/register" class="text-primary underline">Register</NuxtLink>
      </p>
    </CardFooter>
  </Card>
</template>
