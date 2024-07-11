<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEventBus } from '@vueuse/core'
import { useDevice } from '@/stores/device'
import DevToolsTabMenu from './DevToolsTabMenu.vue'

import CloseIcon from '@/assets/icons/close.svg?component'

const emit = defineEmits<{ close: [] }>()

const device = useDevice()
const deviceMemoryBus = useEventBus<number>('device-memory')

const steps = 25
const maxMemory = 400
const width = steps - 1
const height = maxMemory

const gridIntervalHorizontal = 50
const gridIntervalVertical = 3

let verticalGuideOffset = ref(0)
const verticalGuidesCount = computed(() => {
  const count = Math.floor(width / gridIntervalVertical)
  // If we don't have any vertical guide offset the last line would lie on the
  // border.
  const drawLastLine = verticalGuideOffset.value > 0
  return drawLastLine ? count : count - 1
})

const values = ref<number[]>(Array(steps).fill(0))
const points = computed(() =>
  values.value.map((value, index) => `${index},${maxMemory - value}`).join(' '),
)

const area = computed(() => {
  const { length } = values.value
  return `0,${height} ${points.value} ${length - 1},${height}`
})

deviceMemoryBus.on((value) => {
  verticalGuideOffset.value++
  if (verticalGuideOffset.value >= gridIntervalVertical)
    verticalGuideOffset.value = 0

  values.value.shift()
  values.value.push(value)
})
</script>

<template>
  <div class="memory-monitor" :data-usage="device.memoryUsage">
    <DevToolsTabMenu>
      <button @click="emit('close')"><CloseIcon /></button>
    </DevToolsTabMenu>
    <div class="label">
      <span class="value">{{ Math.floor(values.at(-1) ?? 0) }}</span
      >kb
    </div>
    <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
      <!-- <polyline :points="points" class="line" /> -->

      <line
        v-for="n in Math.round(height / gridIntervalHorizontal) - 1"
        x1="0"
        :y1="n * gridIntervalHorizontal"
        :x2="width"
        :y2="n * gridIntervalHorizontal"
        class="guide"
      />

      <line
        v-for="n in verticalGuidesCount"
        :x1="n * gridIntervalVertical - verticalGuideOffset"
        y1="0"
        :x2="n * gridIntervalVertical - verticalGuideOffset"
        :y2="height"
        class="guide"
      />

      <polyline :points="area" class="area" />
    </svg>
  </div>
</template>

<style scoped>
.memory-monitor {
  --color-guide: var(--color-log-gray);

  position: relative;
  width: 100%;
  height: 100%;
  &[data-usage='normal'] {
    --color: rgb(0, 209, 255);
  }
  &[data-usage='increased'] {
    --color: orange;
  }
  &[data-usage='high'] {
    --color: red;
  }

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;

    line,
    polyline {
      vector-effect: non-scaling-stroke;
    }
  }

  .guide {
    stroke: var(--color-guide);
  }

  .line,
  .area {
    transition: all 1000ms ease-in-out;
  }

  .line {
    stroke: var(--color);
    stroke-width: 2;
    fill: none;
  }

  .area {
    fill: var(--color);
    mix-blend-mode: lighten;
  }

  .label {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0 1em;
    line-height: 2.5rem; /* Match the NavBar */

    text-shadow: 1px 1px var(--color-glass-dark-solid);
  }

  .value {
    /* Make sure value won't flicker (as we don't use a monospace) */
    display: inline-block;
    min-width: 2.1em;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
}
</style>
