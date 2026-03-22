<script setup lang="ts">
const props = withDefaults(defineProps<{
  username: string
  isOwner?: boolean
  size?: 'sm' | 'md'
}>(), {
  isOwner: false,
  size: 'md',
})

const initial = computed(() => props.username[0].toUpperCase())

const sizeClasses = computed(() =>
  props.size === 'sm' ? 'h-6 w-6' : 'h-7 w-7'
)

const textClasses = computed(() =>
  props.size === 'sm' ? 'text-[9px]' : 'text-[10px]'
)

const borderClasses = computed(() =>
  props.isOwner ? 'border-primary' : 'border-background'
)
</script>

<template>
  <Avatar class="border-2" :class="[sizeClasses, borderClasses]">
    <AvatarFallback :class="textClasses">{{ initial }}</AvatarFallback>
  </Avatar>
</template>
