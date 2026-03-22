<script setup lang="ts">
const { user } = useAuth()
const { lists, fetchLists } = useLists()

await fetchLists()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">My Lists</h1>
    </div>

    <ListCreateDialog />

    <div v-if="lists.length" class="space-y-3">
      <ListCard v-for="list in lists" :key="list.id" :list="list" />
    </div>
    <div v-else class="py-12 text-center text-muted-foreground">
      <p>No lists yet. Create one to get started!</p>
    </div>
  </div>
</template>
