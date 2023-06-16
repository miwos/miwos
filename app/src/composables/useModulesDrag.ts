import { useModules } from '@/stores/modules'
import type { Module, Point, Rect } from '@/types'
import { getCombinedRect } from '@/utils'
import { useEventListener } from '@vueuse/core'
import type { Ref } from 'vue'

export const useModulesDrag = (
  el: Ref<HTMLElement | undefined>,
  module: Module
) => {
  const modules = useModules()
  const dragThreshold = 5 // px
  let positionMouseDown = { x: 0, y: 0 }
  let groupRect: Rect | undefined
  let groupDelta: Point | undefined
  let group: Module[] = []
  const prevModulePositions = new Map<Module['id'], Point>()
  const modulePositions = new Map<Module['id'], Point>()
  const moduleDeltas = new Map<Module['id'], Point>()

  const startDrag = (modules: Module[], point: Point) => {
    group = modules

    // Conceptually we do not move the individual modules but the whole group. So
    // we use the groups rectangle and it's corresponding delta.
    groupRect = getCombinedRect(
      Array.from(group.values()).map(({ position, size }) => ({
        ...position,
        ...size!,
      }))
    )
    groupDelta = { x: point.x - groupRect.x, y: point.y - groupRect.y }

    modulePositions.clear()
    moduleDeltas.clear()
    for (const { id, position } of group) {
      // Store the original positions, so we can cancel the drag.
      prevModulePositions.set(id, { x: position.x, y: position.y })
      // Store individual deltas relative to the group's rectangle, so we can
      // figure out the individual positions while dragging.
      moduleDeltas.set(id, {
        x: position.x - groupRect.x,
        y: position.y - groupRect.y,
      })
    }
  }

  const drag = (point: Point) => {
    if (!groupRect || !groupDelta) return

    let x = point.x - groupDelta.x
    let y = point.y - groupDelta.y
    const { width, height } = groupRect

    // Subtract 1px to prevent any overflow (might be caused be rounding errors).
    const windowWidth = window.innerWidth - 1
    const windowHeight = window.innerHeight - 1

    // Make sure the group won't leave the window.
    if (x < 0) x = 0
    else if (x + width > windowWidth) x = windowWidth - width

    if (y < 0) y = 0
    else if (y + height > windowHeight) y = windowHeight - height

    for (const module of group) {
      const delta = moduleDeltas.get(module.id)
      if (!delta) continue
      module.position = { x: x + delta.x, y: y + delta.y }
      modulePositions.set(module.id, { ...module.position })
    }
  }

  const cancelDrag = () => {
    group = []
    const modules = useModules()
    for (const [id, { x, y }] of prevModulePositions) {
      const module = modules.get(id)
      if (module) module.position = { x, y }
    }
  }

  const endDrag = () => (group = [])

  const handleMouseMove = (event: MouseEvent) => {
    event.preventDefault()
    const { clientX, clientY } = event

    if (modules.isDragging) {
      drag({ x: clientX, y: clientY })
    } else {
      const { x, y } = positionMouseDown
      const distance = Math.hypot(clientX - x, clientY - y)

      if (distance > dragThreshold) {
        // Even if the drag is started on the module, we want to move the whole
        // group of selected modules if there are some.
        const group = modules.selectedItems.size
          ? Array.from(modules.selectedItems.values())
          : [module]

        startDrag(group, positionMouseDown)
        modules.isDragging = true
      }
    }
  }

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    endDrag()
    modules.isDragging = false
  }

  useEventListener<MouseEvent>(el, 'mousedown', (event) => {
    positionMouseDown = { x: event.clientX, y: event.clientY }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  })
}
