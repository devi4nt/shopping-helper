<script setup lang="ts">
import { Copy, Check } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

interface InviteCode {
  code: string
  usedBy: string | null
  usedAt: string | null
  createdAt: string
}

const open = ref(false)
const invites = ref<InviteCode[]>([])
const loading = ref(false)
const copiedCode = ref<string | null>(null)

async function fetchInvites() {
  invites.value = await $fetch<InviteCode[]>('/api/admin/invite')
}

async function handleGenerate() {
  loading.value = true
  try {
    const invite = await $fetch<InviteCode>('/api/admin/invite', { method: 'POST' })
    invites.value.unshift(invite)
    toast.success('Invite code generated')
  } catch {
    toast.error('Failed to generate invite code')
  } finally {
    loading.value = false
  }
}

function getRegisterUrl(code: string) {
  return `${window.location.origin}/register?code=${code}`
}

async function copyToClipboard(code: string) {
  try {
    await navigator.clipboard.writeText(getRegisterUrl(code))
    copiedCode.value = code
    setTimeout(() => (copiedCode.value = null), 2000)
    toast.success('Link copied!')
  } catch {
    toast.error('Failed to copy')
  }
}

watch(open, (val) => {
  if (val) fetchInvites()
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline" size="sm">Invite</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite Codes</DialogTitle>
        <DialogDescription>Generate invite links to add new users.</DialogDescription>
      </DialogHeader>

      <Button @click="handleGenerate" :disabled="loading" class="w-full">
        {{ loading ? 'Generating...' : 'Generate New Code' }}
      </Button>

      <div class="mt-4 max-h-64 space-y-2 overflow-y-auto">
        <div
          v-for="invite in invites"
          :key="invite.code"
          class="flex items-center justify-between rounded-md border px-3 py-2"
        >
          <div class="min-w-0 flex-1">
            <code class="text-xs">{{ invite.code.slice(0, 12) }}...</code>
            <p v-if="invite.usedBy" class="text-xs text-muted-foreground">Used</p>
            <p v-else class="text-xs text-green-600">Available</p>
          </div>
          <Button
            v-if="!invite.usedBy"
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            @click="copyToClipboard(invite.code)"
          >
            <Check v-if="copiedCode === invite.code" class="h-4 w-4 text-green-600" />
            <Copy v-else class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
