<script setup lang="ts">
import { UserPlus, Check } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{ listId: string }>()

interface AppUser {
  id: string
  username: string
}

interface Share {
  id: string
  user: AppUser
}

const open = ref(false)
const allUsers = ref<AppUser[]>([])
const sharedUserIds = ref<Set<string>>(new Set())
const loading = ref<string | null>(null) // userId currently being toggled
const { user: currentUser } = useAuth()

async function fetchData() {
  const [shares, users] = await Promise.all([
    $fetch<Share[]>(`/api/lists/${props.listId}/share`),
    $fetch<AppUser[]>('/api/users'),
  ])
  sharedUserIds.value = new Set(shares.map((s) => s.user.id))
  // Exclude the current user (owner) from the list
  allUsers.value = users.filter((u) => u.id !== currentUser.value?.id)
}

async function toggleShare(user: AppUser) {
  loading.value = user.id
  const isShared = sharedUserIds.value.has(user.id)

  try {
    if (isShared) {
      await $fetch(`/api/lists/${props.listId}/share`, {
        method: 'DELETE',
        body: { userId: user.id },
      })
      sharedUserIds.value.delete(user.id)
      sharedUserIds.value = new Set(sharedUserIds.value)
      toast.success(`Removed ${user.username}`)
    } else {
      await $fetch(`/api/lists/${props.listId}/share`, {
        method: 'POST',
        body: { username: user.username },
      })
      sharedUserIds.value.add(user.id)
      sharedUserIds.value = new Set(sharedUserIds.value)
      toast.success(`Shared with ${user.username}`)
    }
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Failed to update sharing')
  } finally {
    loading.value = null
  }
}

watch(open, (val) => {
  if (val) fetchData()
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline" size="sm">
        <UserPlus class="mr-2 h-4 w-4" />
        Share
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Share list</DialogTitle>
        <DialogDescription>Select users who can view and edit this list.</DialogDescription>
      </DialogHeader>

      <div v-if="allUsers.length" class="space-y-1">
        <button
          v-for="user in allUsers"
          :key="user.id"
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent"
          :disabled="loading === user.id"
          @click="toggleShare(user)"
        >
          <UserAvatar :username="user.username" size="md" />
          <span class="flex-1 text-sm">{{ user.username }}</span>
          <div
            class="flex h-5 w-5 items-center justify-center rounded-full border transition-colors"
            :class="sharedUserIds.has(user.id)
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/30'"
          >
            <Check v-if="sharedUserIds.has(user.id)" class="h-3 w-3" />
          </div>
        </button>
      </div>
      <p v-else class="py-4 text-center text-sm text-muted-foreground">
        No other users yet. Invite someone first!
      </p>
    </DialogContent>
  </Dialog>
</template>
