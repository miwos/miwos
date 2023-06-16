import { useModules } from '@/stores/modules'
import type { ConnectionPoint } from '@/types'

export const sortPointsByPosition = (
  a: ConnectionPoint,
  b: ConnectionPoint
) => {
  const modules = useModules()
  const positionA = modules.items.get(a.moduleId)?.position
  const positionB = modules.items.get(b.moduleId)?.position
  if (!positionA || !positionB) return [a, b]
  return positionA.y < positionB.y ? [a, b] : [b, a]
}
