import { useEventListener, type MaybeRefOrGetter } from '@vueuse/core'

export const onClickNoDrag = (
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  handler: (e: MouseEvent) => void,
) => {
  const dragThreshold = 5 // px
  let positionMouseDown = { x: 0, y: 0 }

  let hasDragged = false
  const handleMouseDrag = (event: MouseEvent) => {
    const distance = Math.hypot(
      event.clientX - positionMouseDown.x,
      event.clientY - positionMouseDown.y,
    )
    hasDragged = distance > dragThreshold
  }

  useEventListener(target, 'mousedown', (event) => {
    hasDragged = false
    window.addEventListener('mousemove', handleMouseDrag)
    positionMouseDown = { x: event.clientX, y: event.clientY }
  })

  useEventListener(target, 'mouseup', (event) => {
    if (!hasDragged) handler(event)
    window.removeEventListener('mousemove', handleMouseDrag)
  })
}
