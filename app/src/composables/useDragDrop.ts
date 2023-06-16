import { useEventListener } from '@vueuse/core'
import { ref, type Ref } from 'vue'

interface Options {
  handleDragStart?: (e: DragEvent) => void
  handleDrag?: (e: DragEvent) => void
  handleDragEnd?: (e: DragEvent) => void
  handleDrop?: (e: DragEvent) => void
  handleDragOver?: (e: DragEvent) => void
}

/**
 * Based on vueuse's `useDropZone()`, with additional drag information.
 * https://github.com/vueuse/vueuse/blob/main/packages/core/useDropZone/index.ts
 */
export const useDragDrop = (
  el: Ref<HTMLElement | undefined>,
  options: Options = {}
) => {
  const isDragging = ref(false)
  const isDraggedOver = ref(false)
  let counter = 0

  useEventListener<DragEvent>(el, 'drag', (event) => {
    options.handleDrag?.(event)
  })
  useEventListener<DragEvent>(el, 'dragstart', (event) => {
    isDragging.value = true
    options.handleDragStart?.(event)
  })
  useEventListener<DragEvent>(el, 'dragend', (event) => {
    isDragging.value = false
    options.handleDragEnd?.(event)
  })
  useEventListener<DragEvent>(el, 'dragenter', (event) => {
    event.preventDefault()
    counter += 1
    isDraggedOver.value = true
  })
  useEventListener<DragEvent>(el, 'dragover', (event) => {
    event.preventDefault()
    options.handleDragOver?.(event)
  })
  useEventListener<DragEvent>(el, 'dragleave', (event) => {
    event.preventDefault()
    counter -= 1
    if (counter === 0) isDraggedOver.value = false
  })
  useEventListener<DragEvent>(el, 'drop', (event) => {
    event.preventDefault()
    counter = 0
    isDraggedOver.value = false
    options.handleDrop?.(event)
  })

  return { isDragging, isDraggedOver }
}
