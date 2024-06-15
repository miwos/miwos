<script setup lang="ts">
import type { Module } from '@/types'
import { computed } from 'vue'
import type { Shape } from '@miwos/shape'

const props = defineProps<{ module: Module; shape?: Shape }>()

const positionedLabels = computed(() => {
  const { label } = props.module

  const labelDefinitions = props.shape?.labels
  if (!labelDefinitions) return []

  // A label can contain line breaks. If the shape defines multiple labels we
  // can split the label and position each line accordingly.
  const labels = labelDefinitions.length > 1 ? label.split('\n') : [label]

  return labelDefinitions.map((labelDefinition, index) => ({
    ...labelDefinition,
    text: labels[index],
  }))
})
</script>

<template>
  <div class="container">
    <template v-if="positionedLabels?.length">
      <div
        v-for="label of positionedLabels"
        class="label"
        :data-positioned="true"
        :style="{
          width: `${label.length}px`,
          'text-align': label.align,
          '--x': `${label.position.x}px`,
          '--y': `${label.position.y}px`,
          '--angle': `${label.angle}deg`,
        }"
      >
        {{ label.text }}
      </div>
    </template>
    <div v-else class="label" :data-positioned="false">{{ module.label }}</div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  font-family: Vevey Positive;
  text-align: center;
  white-space: pre-line;
  pointer-events: none;
}

.label {
  &[data-positioned='true'] {
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(var(--x), var(--y)) rotate(var(--angle))
      translateY(-100%);
    transform-origin: top left;
  }

  &[data-positioned='false'] {
    text-align: center;
  }
}
</style>
