<template>
  <div class="modulate-amount">
    {{ modulator?.label }} Amount
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      :value="value"
      @input="emit('update:value', +($event.target as any).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { useModulators } from '@/stores/modulators'
import type { Modulation } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  value: number
  modulation: Modulation
}>()

const emit = defineEmits<{
  (e: 'update:value', value: number): void
}>()

const modulators = useModulators()
const modulator = computed(() => modulators.get(props.modulation.modulatorId))
</script>

<style scoped lang="scss">
.modulate-amount {
  border-radius: var(--radius-s);
  background-color: var(--color-modulation);
  padding: 0.25rem var(--radius-s);
  font-family: 'Inter';
  font-weight: 400;
  font-size: 14px;

  input {
    display: block;
    margin: 0.4rem 0;

    &::-webkit-slider-runnable-track {
      height: 2px;
      background: currentColor;
      border: none;
      cursor: pointer;
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      border: none;
      height: 0.85rem;
      width: 0.85rem;
      border-radius: 50%;
      background: currentColor;
      // margin-top: -0.425rem;
      transform: translateY(-50%);
    }
  }
}
</style>
