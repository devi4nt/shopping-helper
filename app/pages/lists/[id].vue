<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const route = useRoute()
const listId = route.params.id as string
const { items, setItems, uncheckItem } = useItems(listId)
const { user } = useAuth()

const { data: list, error } = await useFetch(`/api/lists/${listId}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'List not found' })
}

// Initialize items from the list data
if (list.value) {
  setItems((list.value as any).items || [])
}

const isOwner = computed(() => (list.value as any)?.ownerId === user.value?.id)

// Real-time sync
const { connected } = useListSync(listId)

function handleItemChecked(itemId: string) {
  toast('Item completed', {
    duration: 5000,
    action: {
      label: 'Undo',
      onClick: async () => {
        try {
          await uncheckItem(itemId)
        } catch {
          toast.error('Failed to undo')
        }
      },
    },
  })
}
</script>

<template>
  <div v-if="list" class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/">
        <Button variant="ghost" size="icon">
          <ArrowLeft class="h-5 w-5" />
        </Button>
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold truncate">{{ (list as any).name }}</h1>
        <div class="mt-1 flex -space-x-2">
          <UserAvatar
            :username="(list as any).owner.username"
            :is-owner="true"
            size="sm"
          />
          <UserAvatar
            v-for="share in (list as any).shares || []"
            :key="share.id"
            :username="share.user.username"
            size="sm"
          />
        </div>
      </div>
      <ListShareDialog v-if="isOwner" :list-id="listId" />
    </div>

    <ItemAddForm :list-id="listId" />

    <div v-if="items.length" class="space-y-2">
      <ItemRow
        v-for="item in items"
        :key="item.id"
        :item="item"
        :list-id="listId"
        @checked="handleItemChecked"
      />
    </div>
    <div v-else class="py-8 text-center text-muted-foreground">
      <p>No items yet. Add something above!</p>
    </div>
  </div>
</template>
