export interface Item {
  id: string
  name: string
  quantity: number
  checked: boolean
  checkedAt: string | null
  category: string | null
  listId: string
  createdAt: string
  updatedAt: string
}

export function useItems(listId: string) {
  const items = useState<Item[]>(`items-${listId}`, () => [])

  function setItems(newItems: Item[]) {
    items.value = newItems
  }

  async function addItem(name: string, quantity: number = 1) {
    const item = await $fetch<Item>(`/api/lists/${listId}/items`, {
      method: 'POST',
      body: { name, quantity },
    })
    // Only add if not already present (WebSocket may have already added it)
    if (!items.value.some((i) => i.id === item.id)) {
      items.value.push(item)
      items.value.sort((a, b) => a.name.localeCompare(b.name))
    }
    return item
  }

  async function updateItem(itemId: string, data: Partial<Pick<Item, 'name' | 'quantity' | 'checked'>>) {
    const updated = await $fetch<Item>(`/api/lists/${listId}/items/${itemId}`, {
      method: 'PUT',
      body: data,
    })
    if (!data.checked) {
      const idx = items.value.findIndex((i) => i.id === itemId)
      if (idx !== -1) items.value[idx] = updated
    }
    return updated
  }

  function hideItem(itemId: string) {
    items.value = items.value.filter((i) => i.id !== itemId)
  }

  async function deleteItem(itemId: string) {
    await $fetch(`/api/lists/${listId}/items/${itemId}`, { method: 'DELETE' })
    items.value = items.value.filter((i) => i.id !== itemId)
  }

  async function uncheckItem(itemId: string) {
    const updated = await $fetch<Item>(`/api/lists/${listId}/items/${itemId}`, {
      method: 'PUT',
      body: { checked: false },
    })
    if (!items.value.some((i) => i.id === updated.id)) {
      items.value.push(updated)
      items.value.sort((a, b) => a.name.localeCompare(b.name))
    }
    return updated
  }

  return { items, setItems, addItem, updateItem, deleteItem, uncheckItem, hideItem }
}
