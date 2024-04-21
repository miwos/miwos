<script setup lang="ts">
import type { Shape } from '@miwos/shape'
defineProps<{ shape: Shape }>()
</script>

<template>
  <div class="module-shape" v-html="shape.path"></div>
</template>

<style scoped>
.module-shape {
  fill: var(--color-module-bg);

  &::v-deep(svg) {
    display: block;
    path {
      pointer-events: auto;
    }
  }
}
</style>
