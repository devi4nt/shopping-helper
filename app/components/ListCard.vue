<script setup lang="ts">
import { MoreVertical, Trash2, Pencil } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { ShoppingList } from '@/composables/useLists'

const props = defineProps<{ list: ShoppingList }>()
const { user } = useAuth()
const { deleteList, renameList } = useLists()

const isOwner = computed(() => props.list.ownerId === user.value?.id)
const itemCount = computed(() => props.list._count?.items ?? 0)

const members = computed(() => {
  const owner = { ...props.list.owner, isOwner: true }
  const shared = (props.list.shares || []).map((s) => ({ ...s.user, isOwner: false }))
  return [owner, ...shared]
})

async function handleDelete() {
  if (!confirm(`Delete "${props.list.name}"? This cannot be undone.`)) return
  try {
    await deleteList(props.list.id)
    toast.success('List deleted')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Failed to delete list')
  }
}

async function handleRename() {
  const newName = prompt('Rename list:', props.list.name)
  if (!newName?.trim() || newName.trim() === props.list.name) return
  try {
    await renameList(props.list.id, newName.trim())
    toast.success('List renamed')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Failed to rename list')
  }
}
</script>

<template>
  <NuxtLink :to="`/lists/${list.id}`" class="block">
    <Card class="transition-colors hover:bg-accent/50">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-base">{{ list.name }}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger as-child @click.prevent>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click.prevent="handleRename">
              <Pencil class="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="isOwner"
              class="text-destructive"
              @click.prevent="handleDelete"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted-foreground">
            {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }} remaining
          </p>
          <div class="flex -space-x-2">
            <UserAvatar
              v-for="member in members"
              :key="member.id"
              :username="member.username"
              :is-owner="member.isOwner"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </NuxtLink>
</template>
