<script setup lang="ts">
import { createColorize } from '@/utils/createColorize'
import { computed } from 'vue'

const props = defineProps<{
  type: 'log' | 'warn' | 'info' | 'error'
  text: string
  count: number
}>()

const restoreCurlyBraces = (text: string) =>
  text.replaceAll('#<#', '{').replaceAll('#>#', '}')

// prettier-ignore
const marks = [
  'black', 'white', 'gray', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan',
  'success', 'info', 'warn', 'error', 'specialKey', 'key', 'complexType',
  'number', 'boolean', 'string',
]
const createMark = (name: string, input: string) =>
  `<span style="color: var(--color-log-${name})">${input}</span>`

const colors = Object.fromEntries(
  marks.map((name) => [name, (input: string) => createMark(name, input)]),
)

const colorize = createColorize(colors)

const colorized = computed(() => restoreCurlyBraces(colorize`${props.text}`))

const html = computed(() =>
  colorized.value.replace(
    /^([\w\/]+\.lua:\d+):/,
    `<button class="log-file-link" onclick="window.postMessage({ method: 'launchEditor', file: '$1' })">$1</button>`,
  ),
)
</script>

<template>
  <div class="log-text">
    <span v-if="props.count > 1" class="counter">{{ count }}x</span>
    <span :style="`color: var(--color-log-${type})`" v-html="html"></span>
  </div>
</template>

<style scoped>
.log-text {
  white-space: pre-wrap;
}

.counter {
  margin-right: 1ch;
  color: var(--color-log-gray);
}

:deep(.log-file-link) {
  text-decoration: underline;
  cursor: pointer;
}
</style>
