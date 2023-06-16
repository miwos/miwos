<template>
  <svg class="connection-line" :class="{ active: isActive }">
    <path class="line-selected" v-if="isSelected" :d="path?.data" />
    <path class="line-display" :d="path?.data" />
    <path
      class="line-hit-area"
      ref="hitArea"
      :d="path?.data"
      :style="hitAreaDash"
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
import { useConnectionPath } from '@/composables/useConnectionPath'
import { useConnections } from '@/stores/connections'
import { useModules } from '@/stores/modules'
import type { Connection } from '@/types/Connection'
import { watchDebounced } from '@vueuse/core'
import { computed, ref, toRefs } from 'vue'

const props = defineProps<{
  connection: Connection
}>()

const hitArea = ref<SVGPathElement>()
const { from, to } = toRefs(props.connection)
const modules = useModules()
const connections = useConnections()
const debug = false

const isSelected = computed(
  () =>
    modules.selectedIds.has(from.value.moduleId) ||
    modules.selectedIds.has(to.value.moduleId)
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
  { debounce: 100, immediate: true }
)
</script>

<style scoped lang="scss">
.connection-line {
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  outline: none;
}

.line-hit-area {
  pointer-events: stroke;
  stroke-width: 20px;
  fill: none;
  &:focus {
    outline: none;
  }
}

.line-display {
  stroke-width: 1px;
  stroke: var(--color-connection);
  transition: stroke var(--transition-duration-connection);
  fill: none;
  .active & {
    stroke: var(--color-active);
  }
}

.line-selected {
  stroke: rgb(0 0 0 / 16%);
  stroke-width: 8px;
  fill: none;
}

.control-point {
  fill: blue;
}
</style>
