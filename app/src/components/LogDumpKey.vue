<script setup lang="ts">
import { tokenizeKey } from '@/utils'

const props = defineProps<{ value: any }>()
const [formattedKey, token] = tokenizeKey(props.value)
// In lua, only normal string keys are written as is, all other keys must be
// enclosed in in square brackets.
const hasSquareBrackets = token !== 'key'
</script>

<template>
  <span>
    <template v-if="hasSquareBrackets">[</template>
    <span :style="`color: var(--color-log-${token})`">{{ formattedKey }}</span>
    <template v-if="hasSquareBrackets">]</template>
  </span>
</template>
