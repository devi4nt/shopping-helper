<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'

const { user, logout } = useAuth()
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="flex h-14 items-center justify-between px-4">
        <NuxtLink to="/" class="text-lg font-semibold">
          Shopping Helper
        </NuxtLink>
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="icon" class="h-9 w-9" @click="toggleColorMode">
            <Sun class="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon class="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span class="sr-only">Toggle theme</span>
          </Button>
          <template v-if="user">
            <InviteCodeDialog v-if="user.isAdmin" />
            <span class="text-sm text-muted-foreground">{{ user.username }}</span>
            <Button variant="ghost" size="sm" @click="logout">
              Logout
            </Button>
          </template>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-lg px-4 py-6">
      <slot />
    </main>
  </div>
</template>
