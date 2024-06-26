<template>
  <svg
    class="connection-line"
    tabindex="0"
    :data-active="isActive"
    :data-selected="isSelected"
  >
    <path class="display" :d="path?.data" />
    <path
      class="hit-area"
      ref="hitArea"
      :d="path?.data"
      :style="hitAreaDash"
      @click="handleClick"
    />
    <g v-if="debug">
      <circle
        v-for="{ x, y } in path?.controls"
        class="control-point"
        :cx="x"
        :cy="y"
        r="5"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { onMouseUpOutside } from '@/composables/onMouseUpOutside'
import { useConnectionPath } from '@/composables/useConnectionPath'
import { useConnections } from '@/stores/connections'
import { useItems } from '@/stores/items'
import type { Connection } from '@/types/Connection'
import { watchDebounced } from '@vueuse/core'
import { computed, ref, toRefs } from 'vue'

const props = defineProps<{
  connection: Connection
}>()

const hitArea = ref<SVGPathElement>()
const { from, to } = toRefs(props.connection)
const items = useItems()
const connections = useConnections()
const debug = false

const isSelected = computed(
  () =>
    connections.selectedIds.has(props.connection.id) ||
    items.selectedIds.has(from.value.itemId) ||
    items.selectedIds.has(to.value.itemId),
)
const isActive = computed(() => connections.activeIds.has(props.connection.id))

const path = useConnectionPath(props.connection)

// Add a bit of padding to the start and end of the hit area so it won't cover
// the connection points (which would block pointer events from them).
const hitAreaDash = ref({ 'stroke-dasharray': 0, 'stroke-dashoffset': 0 })
watchDebounced(
  path,
  () => {
    if (!hitArea.value) return
    const length = hitArea.value.getTotalLength()
    const padding = 10
    hitAreaDash.value = {
      'stroke-dasharray': length - padding * 2,
      'stroke-dashoffset': -padding,
    }
  },
  { debounce: 100, immediate: true },
)

const select = (shouldClear = true) => {
  if (shouldClear) connections.selectedIds.clear()
  connections.selectedIds.add(props.connection.id)
}

const unselect = () => connections.selectedIds.clear()

const handleClick = (event: MouseEvent) => select(!event.shiftKey)

onMouseUpOutside(hitArea, (event) => {
  if (event.shiftKey) return
  unselect()
})
</script>

<style scoped>
.connection-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  outline: none;
  pointer-events: none;
  transition: opacity 100ms;

  .patch[data-selection='true'] &[data-selected='false'] {
    opacity: 0.25;
  }
}

.display {
  stroke-width: 1px;
  stroke: var(--color-connection);
  transition: stroke var(--transition-duration-connection);
  fill: none;

  .connection-line[data-active='true'] & {
    stroke: var(--color-active);
  }
}

.hit-area {
  pointer-events: stroke;
  stroke-width: 20px;
  fill: none;
  cursor: pointer;
  &:focus {
    outline: none;
  }
}

/* For visual debugging */
.control-point {
  fill: blue;
}
</style>
