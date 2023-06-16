import { ref, watch, type Ref } from 'vue'

export const useDraggable = (el: Ref<HTMLElement | undefined>) => {
  const dragThreshold = 5 // px
  const positionMouseDown = { x: 0, y: 0 }
  const size = { width: 0, height: 0 }
  const delta = { x: 0, y: 0 }

  const position = ref({ x: 0, y: 0 })
  const isDragging = ref(false)

  const handleMouseDown = ({ clientX, clientY }: MouseEvent) => {
    if (!el.value) return

    positionMouseDown.x = clientX
    positionMouseDown.y = clientY

    delta.x = clientX - position.value.x
    delta.y = clientY - position.value.y

    const { width, height } = el.value.getBoundingClientRect()
    size.width = width
    size.height = height

    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
  }

  const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
    let x = clientX - delta.x
    let y = clientY - delta.y

    if (x < 0) {
      x = 0
    } else if (x + size.width > window.innerWidth) {
      x = window.innerWidth - size.width
    }

    if (y < 0) {
      y = 0
    } else if (y + size.height > window.innerHeight) {
      y = window.innerHeight - size.height
    }

    if (!isDragging.value) {
      const { x, y } = positionMouseDown
      const distance = Math.hypot(clientX - x, clientY - y)
      if (distance > dragThreshold) isDragging.value = true
    }

    if (isDragging.value) position.value = { x, y }
  }

  const handleMouseUp = () => {
    delta.x = 0
    delta.y = 0

    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('mousemove', handleMouseMove)

    isDragging.value = false
  }

  watch(el, (el) => {
    if (!el) return

    const { x, y } = el.getBoundingClientRect()
    position.value = { x: Math.round(x), y: Math.round(y) }

    el.addEventListener('mousedown', handleMouseDown)
  })

  return { position, isDragging }
}
