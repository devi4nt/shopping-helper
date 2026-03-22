interface ListOwner {
  id: string
  username: string
}

export interface ListShare {
  id: string
  user: ListOwner
}

export interface ShoppingList {
  id: string
  name: string
  type: string
  sharedWithAll: boolean
  ownerId: string
  owner: ListOwner
  shares?: ListShare[]
  createdAt: string
  updatedAt: string
  _count?: { items: number }
}

export function useLists() {
  const lists = useState<ShoppingList[]>('lists', () => [])

  async function fetchLists() {
    const data = await $fetch<ShoppingList[]>('/api/lists')
    lists.value = data
    return data
  }

  async function createList(name: string, type: 'personal' | 'shared', sharedWithAll = false) {
    const list = await $fetch<ShoppingList>('/api/lists', {
      method: 'POST',
      body: { name, type, sharedWithAll },
    })
    lists.value.unshift(list)
    return list
  }

  async function renameList(id: string, name: string) {
    const updated = await $fetch<ShoppingList>(`/api/lists/${id}`, {
      method: 'PUT',
      body: { name },
    })
    const idx = lists.value.findIndex((l) => l.id === id)
    if (idx !== -1) lists.value[idx] = { ...lists.value[idx], ...updated }
    return updated
  }

  async function deleteList(id: string) {
    await $fetch(`/api/lists/${id}`, { method: 'DELETE' })
    lists.value = lists.value.filter((l) => l.id !== id)
  }

  return { lists, fetchLists, createList, renameList, deleteList }
}
