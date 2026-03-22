import type { Item } from './useItems'

interface WsMessage {
  type: string
  listId: string
  data?: any
}

export function useListSync(listId: string) {
  const { items } = useItems(listId)
  const connected = ref(false)
  let ws: WebSocket | null = null

  function connect() {
    if (import.meta.server) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/_ws`

    ws = new WebSocket(url)

    ws.onopen = () => {
      connected.value = true
      ws?.send(JSON.stringify({ type: 'subscribe', listId }))
    }

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data)
        if (msg.listId !== listId) return

        switch (msg.type) {
          case 'item:created': {
            const exists = items.value.some((i) => i.id === msg.data.id)
            if (!exists) {
              items.value.push(msg.data as Item)
              items.value.sort((a, b) => a.name.localeCompare(b.name))
            }
            break
          }
          case 'item:updated': {
            if (msg.data.checked) {
              items.value = items.value.filter((i) => i.id !== msg.data.id)
            } else {
              const idx = items.value.findIndex((i) => i.id === msg.data.id)
              if (idx !== -1) {
                items.value[idx] = msg.data as Item
              } else {
                items.value.push(msg.data as Item)
                items.value.sort((a, b) => a.name.localeCompare(b.name))
              }
            }
            break
          }
          case 'item:deleted': {
            items.value = items.value.filter((i) => i.id !== msg.data.id)
            break
          }
          case 'list:updated': {
            // Could update list name etc — handled by parent
            break
          }
        }
      } catch {
        // Ignore malformed messages
      }
    }

    ws.onclose = () => {
      connected.value = false
      // Reconnect after 3 seconds
      setTimeout(connect, 3000)
    }
  }

  function disconnect() {
    ws?.close()
    ws = null
    connected.value = false
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return { connected }
}
