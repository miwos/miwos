<script setup lang="ts">
import { useItems } from '@/stores/items'
import type { Modulation } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  value: number
  modulation: Modulation
}>()

const emit = defineEmits<{
  (e: 'update:value', value: number): void
}>()

const modulators = useItems().modulators
const modulator = computed(() => modulators.get(props.modulation.modulatorId))
</script>

<template>
  <div class="modulate-amount">
    {{ modulator?.label }} Amount
    <input
      class="input"
      type="range"
      min="0"
      max="1"
      step="0.01"
      :value="value"
      @input="emit('update:value', +($event.target as any).value)"
    />
  </div>
</template>

<style scoped>
.modulate-amount {
  padding: 0.25rem var(--radius-s);
  border-radius: var(--radius-s);
  background-color: var(--color-modulation);
  font-weight: 400;
  font-size: 14px;
  font-family: 'Inter';
}

.input {
  display: block;
  margin: 0.4rem 0;

  &::-webkit-slider-runnable-track {
    height: 2px;
    border: none;
    background: currentColor;
    cursor: pointer;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 0.85rem;
    height: 0.85rem;
    transform: translateY(-50%);
    border: none;
    border-radius: 50%;
    background: currentColor;
  }
}
</style>
