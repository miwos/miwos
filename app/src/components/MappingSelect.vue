<script setup lang="ts">
import MSelect from '@/ui/MSelect.vue'

const options = [
  { id: 0, label: 'Map to 1' },
  { id: 1, label: 'Map to 2' },
  { id: 2, label: 'Map to 3' },
]
</script>

<template>
  <MSelect
    class="mapping-select"
    :options="options"
    :autoFocus="true"
    :showUnset="true"
  />
</template>

<style scoped>
.mapping-select {
  --m-select-color-bg: var(--color-mapping);
  /* Slightly darker mapping color: */
  --m-select-color-focus: hsl(155deg 58% 38%);

  width: fit-content;
  color: rgb(0 0 0 / 91%);
  font-family: 'Inter';
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 1px;
  white-space: nowrap;
  z-index: var(--z-dialog);
}
</style>
