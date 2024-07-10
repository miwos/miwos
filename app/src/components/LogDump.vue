<script setup lang="ts">
import LogDumpValue from './LogDumpValue.vue'
import LogDumpTable from './LogDumpTable.vue'
const props = defineProps<{
  value: any
}>()
</script>

<template>
  <LogDumpTable v-if="typeof value === 'object'" :value="value" />
  <LogDumpValue v-else :value="value" />
</template>
