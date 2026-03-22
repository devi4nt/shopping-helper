<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const route = useRoute()
const code = ref((route.query.code as string) || '')
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await register(code.value, username.value, password.value)
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Register</CardTitle>
      <CardDescription>Create your account with an invite code</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="code">Invite Code</Label>
          <Input
            id="code"
            v-model="code"
            placeholder="Enter your invite code"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="username">Username</Label>
          <Input
            id="username"
            v-model="username"
            placeholder="Choose a username"
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
            placeholder="Choose a password (min 6 characters)"
            required
            minlength="6"
            autocomplete="new-password"
          />
        </div>
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </Button>
      </form>
    </CardContent>
    <CardFooter class="justify-center">
      <p class="text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink to="/login" class="text-primary underline">Sign in</NuxtLink>
      </p>
    </CardFooter>
  </Card>
</template>
