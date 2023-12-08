<template>
  <ConnectionPoint v-for="point in points" :point="point" />
</template>

<script setup lang="ts">
import { useItems } from '@/stores/items'
import type { ConnectionPoint as TConnectionPoint } from '@/types'
import type { Item } from '@/types/Item'
import { getConnectionPoint } from '@/utils'
import { computed } from 'vue'
import ConnectionPoint from './ConnectionPoint.vue'

const props = defineProps<{ item: Item }>()
const items = useItems()

const points = computed((): TConnectionPoint[] => {
  const definition = items.definitions.get(props.item.type)
  if (!definition) return []

  const points: TConnectionPoint[] = []

  for (let i = 0; i < definition.inputs.length; i++) {
    const point = getConnectionPoint(props.item.id, i, 'in')
    if (point) points.push(point)
  }

  for (let i = 0; i < definition.outputs.length; i++) {
    const point = getConnectionPoint(props.item.id, i, 'out')
    // A `thru` is a visually combined input and output. We only render the
    // corresponding input but omit the output.
    if (point && !point.thru) points.push(point)
  }

  return points
})
</script>
