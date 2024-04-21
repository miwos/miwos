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

<template>
  <div>
    <span class="before">{{ before }}</span>
    <input
      class="input"
      ref="input"
      :value="value"
      type="number"
      v-bind="{ min, max, step }"
      @change="emit('update:value', parseInt(($event.target as any).value))"
      @blur="emit('blur')"
      @focus="emit('focus')"
    />
    <span class="after">{{ unit }}</span>
  </div>
</template>

<style scoped>
.input {
  flex: 1;
  min-width: 1em;
  cursor: ew-resize;

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.before,
.after {
  display: flex;
  align-items: center;
  color: hsl(0deg 0% 85%);
}
</style>
