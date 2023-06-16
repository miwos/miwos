<template>
  <div>
    <span :class="`log-entry-${type} mark-${type}`" v-html="html"></span>
    <span v-if="props.count > 1" class="mark-yellow"> (x{{ count }})</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'log' | 'warn' | 'info' | 'error' | 'dump'
  text: string
  count: number
}>()

const html = computed(() =>
  props.text.replace(
    /^([\w\/]+\.lua:\d+):/,
    `<button class="log-file-link" onclick="window.postMessage({ method: 'launchEditor', file: '$1' })">$1</button>`
  )
)
</script>
