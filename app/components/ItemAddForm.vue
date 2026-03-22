<script setup lang="ts">
import { Plus, Minus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{ listId: string }>()
const { addItem } = useItems(props.listId)

const name = ref('')
const quantity = ref(1)
const loading = ref(false)

async function handleAdd() {
  if (!name.value.trim()) return
  loading.value = true
  try {
    await addItem(name.value.trim(), quantity.value)
    name.value = ''
    quantity.value = 1
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Failed to add item')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="flex items-center gap-2" @submit.prevent="handleAdd">
    <Input
      v-model="name"
      placeholder="Add an item..."
      class="flex-1"
      :disabled="loading"
    />
    <div class="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        class="h-9 w-9"
        :disabled="quantity <= 1"
        @click="quantity = Math.max(1, quantity - 1)"
      >
        <Minus class="h-4 w-4" />
      </Button>
      <span class="w-6 text-center text-sm">{{ quantity }}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        class="h-9 w-9"
        @click="quantity++"
      >
        <Plus class="h-4 w-4" />
      </Button>
    </div>
    <Button type="submit" size="sm" :disabled="loading || !name.trim()">
      Add
    </Button>
  </form>
</template>
