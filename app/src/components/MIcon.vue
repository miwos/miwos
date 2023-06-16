<template>
  <svg width="12" height="10" viewBox="0 0 12 10">
    <circle
      v-if="type === 'signal-midi'"
      class="module-input-output-path signal-midi"
      cx="6"
      cy="5"
      r="5"
    />
    <polygon
      v-else-if="type === 'signal-trigger'"
      class="module-input-output-path signal-trigger"
      points="0,10 12,10 6,0"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  type: 'signal-midi' | 'signal-trigger'
}>()
</script>

<style scoped lang="scss">
svg {
  --hit-area-increase: 4px;

  display: block;
  overflow: visible;

  > * {
    stroke: transparent;
    // The stroke is is drawn on the center so we have to double it.
    stroke-width: calc(var(--hit-area-increase) * 2);
    paint-order: stroke;
    pointer-events: all;
  }
}
</style>
