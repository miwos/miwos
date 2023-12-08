import { useItems } from '@/stores/items'
import type { ConnectionPoint } from '@/types'

export const sortPointsByPosition = (
  a: ConnectionPoint,
  b: ConnectionPoint,
) => {
  const items = useItems()
  const positionA = items.instances.get(a.itemId)?.position
  const positionB = items.instances.get(b.itemId)?.position
  if (!positionA || !positionB) return [a, b]
  return positionA.y < positionB.y ? [a, b] : [b, a]
}
