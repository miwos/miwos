<template>
  <div class="module-content" :style="clipStyle">
    <component
      :is="component"
      v-bind="resolvedProps"
      v-on="updatePropHandlers"
    />
  </div>
</template>

<script setup lang="ts">
import { useItems } from '@/stores/items'
import type { Module } from '@/types'
import type { Component } from 'vue'
import { computed } from 'vue'

const props = defineProps<{
  component: Component
  module: Module
  mask: string
}>()

const definition = useItems().moduleDefinitions.get(props.module.type)
const clipStyle = computed(() =>
  definition?.clipContent ?? true ? { clipPath: props.mask } : {},
)

const items = useItems()
const updatePropHandlers = computed(() =>
  Object.fromEntries(
    Object.keys(props.module.props).map((name) => [
      `update:${name}`,
      (value: any) => items.updateProp(props.module.id, name, value),
    ]),
  ),
)

const resolvedProps = computed(() => ({
  ...props.module.props,
  ...props.module.modulatedProps,
}))
</script>

<style>
.module-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
