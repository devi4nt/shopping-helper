import type { Peer } from 'crossws'

interface WsMessage {
  type: string
  listId: string
  data?: any
}

// Map of listId -> Set of connected peers
const listSubscriptions = new Map<string, Set<Peer>>()

export function subscribePeer(peer: Peer, listId: string) {
  if (!listSubscriptions.has(listId)) {
    listSubscriptions.set(listId, new Set())
  }
  listSubscriptions.get(listId)!.add(peer)
}

export function unsubscribePeer(peer: Peer) {
  for (const [listId, peers] of listSubscriptions) {
    peers.delete(peer)
    if (peers.size === 0) {
      listSubscriptions.delete(listId)
    }
  }
}

export function broadcast(listId: string, message: WsMessage, excludePeer?: Peer) {
  const peers = listSubscriptions.get(listId)
  if (!peers) return

  const payload = JSON.stringify(message)
  for (const peer of peers) {
    if (peer !== excludePeer) {
      peer.send(payload)
    }
  }
}
