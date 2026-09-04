import { useMemo, useState } from 'react'

type SelectableItem = {
  id: number | string
}

export function useBulkSelect<TItem extends SelectableItem>(items: TItem[]) {
  const [selected, setSelected] = useState<string[]>([])
  const itemIds = useMemo(
    () => items.map((item) => String(item.id)),
    [items],
  )

  const toggle = (id: string | number) => {
    const value = String(id)

    setSelected((current) =>
      current.includes(value)
        ? current.filter((selectedId) => selectedId !== value)
        : [...current, value],
    )
  }

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? itemIds : [])
  }

  const clear = () => setSelected([])
  const isSelected = (id: string | number) => selected.includes(String(id))
  const isAllSelected = itemIds.length > 0 && selected.length === itemIds.length

  return {
    clear,
    isAllSelected,
    isSelected,
    selected,
    toggle,
    toggleAll,
  }
}
