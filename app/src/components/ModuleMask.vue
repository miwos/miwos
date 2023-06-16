<template>
  <div class="module-mask" v-html="clipPath"></div>
</template>

<script setup lang="ts">
import type { Shape } from '@miwos/shape'
import { computed } from 'vue'

const props = defineProps<{ shape: Shape; id: string }>()

const parser = new DOMParser()
const clipPath = computed(() => {
  const doc = parser.parseFromString(props.shape.path, 'image/svg+xml')
  const svg = doc.documentElement

  const path = svg.querySelector('path.shape')
  if (!path) return

  const clipPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'clipPath'
  )
  clipPath.id = props.id
  clipPath.appendChild(path)
  svg.append(clipPath)

  return svg.outerHTML
})
</script>

<style lang="scss">
.module-mask {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
