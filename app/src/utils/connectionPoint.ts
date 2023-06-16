import { useModuleDefinitions } from '@/stores/moduleDefinitions'
import { useModules } from '@/stores/modules'
import { useModuleShapes } from '@/stores/moduleShapes'
import type { ConnectionPoint, Module, Point } from '@/types'

export const getConnectionPoint = (
  moduleId: Module['id'],
  index: number,
  direction: 'in' | 'out'
): ConnectionPoint | undefined => {
  const definitions = useModuleDefinitions()
  const shapes = useModuleShapes()
  const modules = useModules()

  const module = modules.get(moduleId)
  if (!module) return

  const definition = definitions.get(module.type)
  if (!definition) return

  const { signal } =
    definitions.getConnector(module.type, index, direction) ?? {}
  if (!signal) return

  const { positions, angle } =
    shapes.getConnector(definition.shape, index, direction) ?? {}
  if (!positions || !angle) return

  const { inset, outline } = positions
  const offset = signal === 'midi' ? inset : outline ?? inset
  const position = {
    x: offset.x + module.position.x,
    y: offset.y + module.position.y,
  }

  const id = `${moduleId}-${index}` as const
  return { id, signal, moduleId, direction, index, offset, angle, position }
}
