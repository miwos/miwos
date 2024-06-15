<script setup lang="ts">
import { useItems } from '@/stores/items'
import MSelect from '@/ui/MSelect.vue'
import { computed } from 'vue'

const modulators = useItems().modulators

const options = computed(() =>
  [...modulators.values()].map(({ id, label }) => ({ id, label })),
)
</script>

<template>
  <MSelect
    class="modulate-select"
    :options="options"
    :autoFocus="true"
    :showUnset="true"
  />
</template>

<style scoped>
.modulate-select {
  --m-select-color-bg: var(--color-modulation);
  /* Slightly darker modulate color: */
  --m-select-color-focus: hsl(46 112% 41%);
  z-index: var(--z-dialog);

  width: fit-content;
  color: rgb(0 0 0 / 91%);
  font-weight: 400;
  font-size: 14px;
  font-family: 'Inter';
  letter-spacing: 1px;
  white-space: nowrap;
}
</style>
