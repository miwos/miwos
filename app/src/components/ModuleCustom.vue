<template>
  <div class="module-custom">
    <component
      :is="component"
      :module="module"
      v-bind="resolvedProps"
      v-on="updatePropHandlers"
      ref="customEl"
      @update:size="updateSize"
    />
  </div>
</template>

<script setup lang="ts">
import { useItems } from '@/stores/items'
import type { Module, Size } from '@/types'
import type { Component } from 'vue'
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  component: Component
  module: Module
}>()

const customEl = ref<HTMLElement | undefined>()

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

const updateSize = (size: Size) => {
  props.module.size = size
}
</script>

<style scoped>
.module-custom {
  /* Pointer events are disable on the module instance, so we have to enable
  them again. */
  pointer-events: all;
}
</style>
