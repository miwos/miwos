import { useItems } from '@/stores/items'
import type { ConnectionPoint, Item, Optional } from '@/types'
import Vec from 'tiny-vec'

export const getConnectionPoint = (
  itemId: Item['id'],
  index: number,
  direction: 'in' | 'out',
): ConnectionPoint | undefined => {
  const items = useItems()
  const item = items.instances.get(itemId)
  if (!item) return

  const definition = items.definitions.get(item.type)
  if (!definition) return

  const shape = items.shapes.get(definition.shape ?? definition.id)

  const directionCategory = direction === 'in' ? 'inputs' : 'outputs'
  const id = `${itemId}-${index}` as const

  const connectionPoint: Optional<ConnectionPoint, 'absolutePosition'> = {
    id,
    itemId,
    index,
    direction,

    angle: 90,
    position: { x: 0, y: 0 },

    ...shape?.[directionCategory]?.[index],
    ...definition[directionCategory]?.[index],
    ...item[directionCategory]?.[index],
  }

  if (connectionPoint.signal === 'midi' && !connectionPoint.thru) {
    const vec = new Vec(1, 0)
      .rotate(connectionPoint.angle * (Math.PI / 180))
      .multiply(14)
    const { x, y } = new Vec(connectionPoint.position).add(vec)
    connectionPoint.position = { x, y }
  }

  connectionPoint.absolutePosition = {
    x: connectionPoint.position.x + item.position.x,
    y: connectionPoint.position.y + item.position.y,
  }

  return connectionPoint as ConnectionPoint
}
