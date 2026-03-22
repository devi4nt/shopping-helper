<script setup lang="ts">
import { toast } from 'vue-sonner'

const { createList } = useLists()
const open = ref(false)
const name = ref('')
const type = ref<'personal' | 'shared'>('personal')
const sharedWithAll = ref(false)
const loading = ref(false)

async function handleCreate() {
  if (!name.value.trim()) return
  loading.value = true
  try {
    const list = await createList(name.value.trim(), type.value, sharedWithAll.value)
    toast.success(`List "${list.name}" created`)
    open.value = false
    name.value = ''
    type.value = 'personal'
    sharedWithAll.value = false
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Failed to create list')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button class="w-full">New List</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a new list</DialogTitle>
        <DialogDescription>Add a shopping list for yourself or share it with others.</DialogDescription>
      </DialogHeader>
      <form class="space-y-4" @submit.prevent="handleCreate">
        <div class="space-y-2">
          <Label for="list-name">Name</Label>
          <Input id="list-name" v-model="name" placeholder="e.g. Weekly Groceries" required />
        </div>
        <div class="flex gap-2">
          <Button
            type="button"
            :variant="type === 'personal' ? 'default' : 'outline'"
            size="sm"
            @click="type = 'personal'; sharedWithAll = false"
          >
            Personal
          </Button>
          <Button
            type="button"
            :variant="type === 'shared' ? 'default' : 'outline'"
            size="sm"
            @click="type = 'shared'"
          >
            Shared
          </Button>
        </div>
        <div v-if="type === 'shared'" class="flex items-center gap-2">
          <input
            id="shared-all"
            v-model="sharedWithAll"
            type="checkbox"
            class="h-4 w-4 rounded border"
          />
          <Label for="shared-all" class="text-sm">Share with all users</Label>
        </div>
        <DialogFooter>
          <Button type="submit" :disabled="loading || !name.trim()">
            {{ loading ? 'Creating...' : 'Create List' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
