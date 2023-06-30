<template>
  <button class="item-prop-handle" :data-status="status"></button>
</template>

<script setup lang="ts">
defineProps<{
  status:
    | 'mapped'
    | 'modulated'
    | 'mapped-and-modulated'
    | 'mapped-other-page'
    | 'none'
}>()
</script>

<style scoped lang="scss">
// Expose these variables so the modulator menu button can reuse them.
:global(:root) {
  --prop-bg-mapped: var(--color-mapping);
  --prop-bg-mapped-other-page: var(--color-glass-dark-solid);
  --prop-bg-modulated: var(--color-modulation);
  --prop-bg-mapped-and-modulated: linear-gradient(
    90deg,
    var(--color-mapping) 50%,
    var(--color-modulation) 50%
  );
}

.item-prop-handle {
  background-color: var(--color-glass-solid);

  &[data-status='mapped'] {
    background: var(--prop-bg-mapped);
  }

  &[data-status='mapped-other-page'] {
    background: var(--prop-bg-mapped-other-page);
  }

  &[data-status='modulated'] {
    background: var(--prop-bg-modulated);
  }

  &[data-status='mapped-and-modulated'] {
    background: var(--prop-bg-mapped-and-modulated);
  }
}
</style>
