<template>
  <MSelect
    class="mapping-select"
    :options="options"
    :autoFocus="true"
    :showUnset="true"
  />
</template>

<script setup lang="ts">
import MSelect from '@/ui/MSelect.vue'

const options = [
  { id: 0, label: 'Map to 1' },
  { id: 1, label: 'Map to 2' },
  { id: 2, label: 'Map to 3' },
]
</script>

<style scoped lang="scss">
.mapping-select {
  --m-select-color-bg: var(--color-mapping);
  --m-select-color-focus: hsl(155deg 58% 38%); // Slightly darker mapping color.

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
