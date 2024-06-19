<script setup lang="ts">
import type { Shape } from '@miwos/shape'
defineProps<{ shape: Shape }>()
</script>

<template>
  <div class="module-shape" v-html="shape.path"></div>
</template>

<style scoped>
/* Note: `:deep()` inside css nesting causes issues, so we keep it flat. */

.module-shape :deep(svg) {
  display: block;
}

.module-shape :deep(svg .shape) {
  fill: var(--color-module-bg);
  pointer-events: auto;
}
</style>
