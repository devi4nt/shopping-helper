export default defineWebSocketHandler({
  open(peer) {
    // Peer connected — they'll send subscribe messages
  },

  message(peer, message) {
    try {
      const data = JSON.parse(message.text())

      if (data.type === 'subscribe' && data.listId) {
        // Unsubscribe from any previous list
        unsubscribePeer(peer)
        // Subscribe to the new list
        subscribePeer(peer, data.listId)
      }
    } catch {
      // Ignore malformed messages
    }
  },

  close(peer) {
    unsubscribePeer(peer)
  },
})
