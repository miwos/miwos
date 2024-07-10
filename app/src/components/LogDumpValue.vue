<script setup lang="ts">
import { tokenizeValue } from '@/utils'

const props = defineProps<{ value: any }>()
const [formattedValue, token] = tokenizeValue(props.value)
</script>

<template>
  <span :style="`color: var(--color-log-${token})`">{{ formattedValue }}</span>
</template>
