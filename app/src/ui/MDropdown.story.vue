<template>
  <Story>
    <MDropdown
      :options="options"
      v-model:value="value"
      theme="default"
      label="Dropdown"
      @update:value="logEvent('update value', [$event])"
      preferredAlignment="above"
    >
      <template #currentOption="{ label }">{{ label }}</template>
      <template #option="{ label }">{{ label }}</template>
    </MDropdown>
  </Story>
</template>

<script setup lang="ts">
import { logEvent } from 'histoire/client'
import { ref } from 'vue'
import MDropdown from './MDropdown.vue'

const options = [
  { id: 0, label: 'One' },
  { id: 1, label: 'Two' },
  { id: 2, label: 'Three' },
]

const value = ref(0)
</script>

<style scoped>
.m-dropdown {
  --m-select-color-bg: var(--color-glass-dark-solid);
  --m-select-color-focus: red;
  margin: 2rem;
  width: 100px;
}
</style>
