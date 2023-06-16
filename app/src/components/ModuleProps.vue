<template>
  <div class="module-props">
    <ModuleProp
      v-for="(prop, index) in listedProps"
      :name="prop.name"
      :type="prop.type"
      :moduleId="module.id"
      :position="getPosition(index)"
      :side="index < 3 ? 'right' : 'left'"
      :options="prop.options"
      :value="module.props[prop.name]"
      @update:value="modules.updateProp(module.id, prop.name, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useModuleDefinitions } from '@/stores/moduleDefinitions'
import { useModules } from '@/stores/modules'
import { useModuleShapes } from '@/stores/moduleShapes'
import type { Module } from '@/types'
import { computed } from 'vue'
import ModuleProp from './ModuleProp.vue'

const props = defineProps<{
  module: Module
}>()

const modules = useModules()
const definition = computed(
  () => useModuleDefinitions().get(props.module.type)!
)
const shape = useModuleShapes().get(definition.value.shape)!

const listedProps = computed(() =>
  Object.entries(definition.value.props)
    .map(([name, prop]) => ({ name, ...prop }))
    .filter((v) => v.options.listed ?? true)
    .sort((a, b) => a.options.index - b.options.index)
)

const getPosition = (index: number) => {
  const side = index < 3 ? 'right' : 'left'
  const count = Object.values(listedProps.value).length
  const positions = shape.props

  const position =
    side === 'right'
      ? count === 1
        ? positions.right.one
        : count === 2
        ? positions.right.two[index]
        : positions.right.three[index]
      : count === 4
      ? positions.left.one
      : count === 5
      ? positions.left.two[index - 3]
      : positions.left.three[index - 3]

  if (!position) throw new Error(`No position found for prop #${index}`)

  const offset = 8 * (side === 'left' ? 1 : -1)
  return { x: position.x + offset, y: position.y }
}
</script>

<style scoped lang="scss">
.module-props {
  pointer-events: all;
}
</style>
