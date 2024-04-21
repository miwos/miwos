<template>
  <MSelect
    class="modulate-select"
    :options="options"
    :autoFocus="true"
    :showUnset="true"
  />
</template>

<script setup lang="ts">
import { useItems } from '@/stores/items'
import MSelect from '@/ui/MSelect.vue'
import { computed } from 'vue'

const modulators = useItems().modulators

const options = computed(() =>
  [...modulators.values()].map(({ id, label }) => ({ id, label })),
)
</script>

<style scoped>
.modulate-select {
  --m-select-color-bg: var(--color-modulation);
  /* Slightly darker modulate color: */
  --m-select-color-focus: hsl(46 112% 41%);

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
