import { useEventListener, type MaybeComputedRef } from '@vueuse/core'
import { computed, ref } from 'vue'

export const useSelection = (
  el: MaybeComputedRef<HTMLElement | null | undefined>
) => {
  let startPoint = { x: 0, y: 0 }
  const rect = ref({ x: 0, y: 0, width: 0, height: 0 })
  const isSelecting = ref(false)

  const style = computed(() => ({
    top: rect.value.y + 'px',
    left: rect.value.x + 'px',
    width: rect.value.width + 'px',
    height: rect.value.height + 'px',
  }))

  const handleMouseMove = (event: MouseEvent) => {
    const point = {
      x: Math.max(0, Math.min(event.clientX, window.innerWidth)),
      // Subtract 1px, otherwise chrome will crop it.
      y: Math.max(0, Math.min(event.clientY, window.innerHeight - 1)),
    }

    rect.value = {
      x: Math.min(startPoint.x, point.x),
      y: Math.min(startPoint.y, point.y),
      width: Math.abs(point.x - startPoint.x),
      height: Math.abs(point.y - startPoint.y),
    }

    isSelecting.value = true
  }

  const cancel = () => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', cancel)
    isSelecting.value = false
  }

  useEventListener<MouseEvent>(el, 'mousedown', (event) => {
    startPoint = { x: event.clientX, y: event.clientY }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', cancel)
  })

  return { rect, style, isSelecting, cancel }
}
