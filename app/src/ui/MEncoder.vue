<script setup lang="ts">
import { useRotation } from '@/composables/useRotation'
import { map } from '@/utils'
import { computed, ref } from 'vue'

export interface Props {
  value?: number | boolean
  min?: number
  max?: number
  step?: number
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  min: 0,
  max: 1,
})

const emit = defineEmits<{ (e: 'update:value', value: number): void }>()

const el = ref<HTMLElement>()
const angle = computed(() => valueToAngle(+(props.value ?? 0)))

const onRotate = (angle: number) => {
  const constrainedAngle = Math.max(Math.min(angle, 135), -135)
  emit('update:value', angleToValue(constrainedAngle))
}

useRotation(el, { onRotate })

const valueToAngle = (value: number) =>
  map(value, props.min, props.max, -135, 135)

const angleToValue = (angle: number) => {
  let value = map(angle, -135, 135, props.min, props.max)
  return props.step ? Math.ceil(value / props.step) * props.step : value
}
</script>

<template>
  <button class="encoder" ref="el" :class="{ disabled: !enabled }">
    <svg class="icon" viewBox="0 0 10 10">
      <line class="dial" x1="5" y1="0" x2="5" y2="2.5" />
    </svg>
  </button>
</template>

<style scoped>
.encoder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--m-encoder-color);

  &.disabled {
    background-color: var(--color-glass);
  }
}

.icon {
  width: 100%;
  height: 100%;
  overflow: visible;
  transform: rotate(v-bind('angle + `deg`'));
}

.dial {
  stroke: var(--m-encoder-dial-color);
  stroke-width: 3;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;

  .disabled & {
    stroke: #d5d5d5;
  }
}
</style>
