<template>
  <div class="module-label">
    <template v-if="positionedLabels?.length">
      <div
        v-for="label of positionedLabels"
        class="module-label-positioned"
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
    <div class="module-label-default" v-else>{{ module.label }}</div>
  </div>
</template>

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

<style scoped lang="scss">
.module-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  white-space: pre-line;
  text-align: center;

  font-family: Vevey Positive;

  &-default {
    text-align: center;
  }

  &-positioned {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: top left;
    transform: translate(var(--x), var(--y)) rotate(var(--angle))
      translateY(-100%);
  }
}
</style>
