<template>
  <div class="module-outline" v-html="shape.path"></div>
</template>

<script setup lang="ts">
import type { Module } from '@/types'
import type { Shape } from '@miwos/shape'
defineProps<{ module: Module; shape: Shape }>()
</script>

<style scoped lang="scss">
.module-outline {
  position: absolute;
  top: 0;
  left: 0;
  stroke: rgb(0 0 0 / 16%);
  stroke-width: 8px;
  fill: none;
  stroke-linejoin: round;

  &::v-deep(svg) {
    display: block;
    overflow: visible;
  }
}
</style>
