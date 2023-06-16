<template>
  <MSelect
    class="modulate-select"
    :options="options"
    :autoFocus="true"
    :showUnset="true"
  />
</template>

<script setup lang="ts">
import { useModulators } from '@/stores/modulators'
import MSelect from '@/ui/MSelect.vue'
import { computed } from 'vue'

const modulators = useModulators()

const options = computed(() =>
  modulators.list.map(({ id, label }) => ({ id, label }))
)
</script>

<style scoped lang="scss">
.modulate-select {
  --m-select-color-bg: var(--color-modulation);
  --m-select-color-focus: hsl(46 112% 41%); // Slightly darker modulate color.

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
