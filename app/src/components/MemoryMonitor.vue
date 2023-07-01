<template>
  <div class="memory-monitor glass" :data-usage="usage">
    <div class="label">
      Memory:
      <span class="label-value">{{ Math.floor(values.at(-1) ?? 0) }}</span
      >kb
    </div>
    <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
      <polyline :points="area" class="area" />
      <polyline :points="points" class="line" />

      <line
        v-for="n in horizontalGuides - 1"
        x1="0"
        :y1="n * horizontalGuideDistance"
        :x2="width"
        :y2="n * horizontalGuideDistance"
        class="guide"
      />

      <line
        v-for="n in (steps - 1) / 4 + 1"
        :x1="n * verticalGuidesDistance - verticalGuideOffsetSteps"
        y1="0"
        :x2="n * verticalGuidesDistance - verticalGuideOffsetSteps"
        :y2="height"
        class="guide"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEventBus } from '@vueuse/core'

const deviceMemoryBus = useEventBus<number>('device-memory')

const steps = 13
const maxMemory = 400
const width = steps - 1
const height = maxMemory

const horizontalGuides = 6
const horizontalGuideDistance = height / horizontalGuides
const verticalGuides = 4
const verticalGuidesDistance = width / verticalGuides
let verticalGuideOffsetSteps = 0

const usageThresholds = {
  high: 300, // kb
  increased: 250, // kb
}

const usage = ref<'normal' | 'increased' | 'high'>('normal')

const values = ref<number[]>([])
const points = computed(() =>
  values.value.map((value, index) => `${index},${maxMemory - value}`).join(' ')
)

const area = computed(() => {
  const { length } = values.value
  return `0,${height} ${points.value} ${length - 1},${height}`
})

deviceMemoryBus.on((value) => {
  if (values.value.length === steps) {
    values.value.shift()
    verticalGuideOffsetSteps =
      (verticalGuideOffsetSteps + 1) % (verticalGuides - 1)
  }

  usage.value =
    (Object.keys(usageThresholds) as Array<keyof typeof usageThresholds>).find(
      (threshold) => value >= usageThresholds[threshold]
    ) ?? 'normal'

  values.value.push(value)
})
</script>

<style scoped lang="scss">
.memory-monitor {
  position: relative;
  width: 9rem;
  height: 5rem;
  border-radius: var(--radius-s);
  overflow: hidden;

  &[data-usage='normal'] {
    --color: aqua;
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

    line,
    polyline {
      vector-effect: non-scaling-stroke;
    }
  }

  .guide {
    stroke: rgb(34 34 34 / 19%);
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
    opacity: 0.3;
  }

  .label {
    position: absolute;
    top: 0;
    right: 0;
    line-height: 2.5rem; // Match the NavBar
    padding: 0 1em;

    text-shadow: 1px 1px var(--color-glass-dark-solid);

    &-value {
      // Make sure value won't flicker (as we don't use a monospace)
      display: inline-block;
      min-width: 2.1em;
    }
  }
}
</style>
