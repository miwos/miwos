import { useItems } from '@/stores/items'
import type { ConnectionPoint, Module } from '@/types'

export const getConnectionPoint = (
  itemId: Module['id'],
  index: number,
  direction: 'in' | 'out',
): ConnectionPoint | undefined => {
  const items = useItems()
  const item = items.instances.get(itemId)
  if (!item) return

  const definition = items.definitions.get(item.type)
  if (!definition) return

  const { signal, positions, angle } =
    items.getConnector(item.type, index, direction) ?? {}
  if (!signal || !positions || !angle) return

  const { inset, outline } = positions
  const offset = signal === 'midi' ? inset : outline ?? inset
  const position = {
    x: offset.x + item.position.x,
    y: offset.y + item.position.y,
  }

  const id = `${itemId}-${index}` as const
  return {
    id,
    signal,
    itemId,
    direction,
    index,
    offset,
    angle,
    position,
  }
}
