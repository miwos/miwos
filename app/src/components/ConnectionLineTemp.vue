<script setup lang="ts">
import { useConnectionPath } from '@/composables/useConnectionPath'
import type { TemporaryConnection } from '@/types'

const props = defineProps<{
  connection: TemporaryConnection
}>()

const debug = true
const path = useConnectionPath(props.connection)
</script>

<template>
  <svg class="connection-line-temp">
    <path :d="path?.data" />
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

<style scoped>
.connection-line-temp {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  outline: none;
  pointer-events: none;

  stroke-width: 1px;
  stroke: var(--color-connection);
  fill: none;
}

/* For visual debugging */
.control-point {
  fill: blue;
  stroke: none;
}
</style>
