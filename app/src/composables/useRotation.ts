import { useEventListener, type MaybeElementRef } from '@vueuse/core'
import { ref, unref } from 'vue'

export interface UseRotationOptions {
  onRotate?: (angle: number) => void
}

export const useRotation = (
  el: MaybeElementRef<HTMLElement | undefined>,
  { onRotate }: UseRotationOptions = {}
) => {
  const angle = ref(0)
  const isRotating = ref(false)
  let center = { x: 0, y: 0 }

  const handleMouseDown = () => {
    const unwrapped = unref(el)
    if (!unwrapped) return

    const { x, y, width, height } = unwrapped.getBoundingClientRect()
    center = { x: x + width / 2, y: y + height / 2 }
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    isRotating.value = true
  }

  const handleMouseUp = () => {
    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('mousemove', handleMouseMove)
    isRotating.value = false
  }

  const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
    angle.value =
      Math.atan2(clientX - center.x, -(clientY - center.y)) * (180 / Math.PI)
    onRotate?.(angle.value)
  }

  useEventListener(el, 'mousedown', handleMouseDown)

  return { angle, isRotating }
}
