<template>
  <div class="m-input">
    <span class="m-input-before">{{ before }}</span>
    <input
      ref="input"
      :value="value"
      type="number"
      v-bind="{ min, max, step }"
      @change="emit('update:value', parseInt(($event.target as any).value))"
      @blur="emit('blur')"
      @focus="emit('focus')"
    />
    <span class="m-input-after">{{ unit }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  value: number
  before?: string
  unit?: string
  min?: number
  max?: number
  step?: number
}>()

const emit = defineEmits<{
  (e: 'update:value', value: number): void
  (e: 'blur'): void
  (e: 'focus'): void
}>()

const input = ref<HTMLInputElement | null>(null)

const focus = () => window.setTimeout(() => input.value?.focus())

defineExpose({ focus })
</script>

<style scoped lang="scss">
.m-input {
  &-before,
  &-after {
    display: flex;
    align-items: center;
    color: hsl(0deg 0% 85%);
  }

  input {
    flex: 1;
    min-width: 1em;
    cursor: ew-resize;
  }
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
