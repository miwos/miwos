<template>
  <div
    class="connection-point"
    :class="{
      'dragged-over': isDraggedOver,
      dragging: isDragging,
      active: isActive,
    }"
    ref="el"
    draggable="true"
    @mousedown.stop
    @mouseup.stop
  >
    <MIcon class="icon" :type="`signal-${point.signal}`" />
  </div>
</template>

<script setup lang="ts">
import { useDragDrop } from '@/composables/useDragDrop'
import { useConnections } from '@/stores/connections'
import { useItems } from '@/stores/items'
import type { ConnectionPoint } from '@/types/Connection'
import { createEmptyImage } from '@/utils'
import { computed, ref } from 'vue'
import MIcon from './MIcon.vue'

const props = defineProps<{
  point: ConnectionPoint
}>()

const el = ref<HTMLElement>()
const connections = useConnections()
const items = useItems()
const item = items.instances.get(props.point.itemId)
const isActive = computed(() =>
  props.point.direction == 'in'
    ? items.activeInputIds.has(props.point.id)
    : items.activeOutputIds.has(props.point.id),
)

const handleDragStart = (event: DragEvent) => {
  if (!event.dataTransfer) return
  event.dataTransfer.setDragImage(createEmptyImage(), 0, 0)
  event.dataTransfer.dropEffect = 'link'
  connections.connectFrom(props.point)

  if (module) {
    const { direction } = props.point
    connections.tempConnection = {
      [direction === 'out' ? 'from' : 'to']: {
        moduleId: props.point.itemId,
        index: props.point.index,
      },
    }
  }
}

const handleDrag = ({ clientX, clientY }: DragEvent) => {
  if (!connections.tempConnection) return
  // The connection line starts at this connection point and points to the
  // current mouse position.
  const oppositeType = props.point.direction === 'out' ? 'to' : 'from'
  connections.tempConnection[oppositeType] = { x: clientX, y: clientY }
}

const handleDragOver = () => {
  if (!module || !connections.tempConnection) return
  // Snap the temporary connection on the connection point.
  const type = props.point.direction === 'out' ? 'from' : 'to'
  const { itemId, index } = props.point
  connections.tempConnection[type] = { itemId, index }
}

const handleDragEnd = () => {
  connections.tempConnection = undefined
}

const handleDrop = () => {
  connections.connectTo(props.point)
  connections.tempConnection = undefined
}

const { isDragging, isDraggedOver } = useDragDrop(el, {
  handleDragStart,
  handleDrag,
  handleDragOver,
  handleDragEnd,
  handleDrop,
})
</script>

<style scoped lang="scss">
.connection-point {
  position: absolute;
  transform: translate(-50%, -50%);
  top: v-bind('point.offset.y + `px`');
  left: v-bind('point.offset.x + `px`');
  fill: var(--color-connection);
  transition: fill var(--transition-duration-connection);
  &.active {
    fill: var(--color-active);
  }

  &.dragging .icon,
  &.dragged-over {
    stroke: red;
    stroke-width: 8px;
  }
}
</style>
