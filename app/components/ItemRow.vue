<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Item } from '@/composables/useItems'

const props = defineProps<{
  item: Item
  listId: string
}>()

const emit = defineEmits<{
  checked: [itemId: string]
}>()

const { updateItem, deleteItem } = useItems(props.listId)

async function handleCheck() {
  try {
    await updateItem(props.item.id, { checked: true })
    emit('checked', props.item.id)
  } catch (e: any) {
    toast.error('Failed to check item')
  }
}

async function handleDelete() {
  try {
    await deleteItem(props.item.id)
  } catch (e: any) {
    toast.error('Failed to delete item')
  }
}
</script>

<template>
  <div class="flex items-center gap-3 rounded-lg border px-3 py-2">
    <Checkbox @update:checked="handleCheck" />
    <div class="flex-1 min-w-0">
      <span class="text-sm">{{ item.name }}</span>
      <Badge v-if="item.quantity > 1" variant="secondary" class="ml-2 text-xs">
        x{{ item.quantity }}
      </Badge>
    </div>
    <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" @click="handleDelete">
      <Trash2 class="h-4 w-4 text-muted-foreground" />
    </Button>
  </div>
</template>
