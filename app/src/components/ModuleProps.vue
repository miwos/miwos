<template>
  <div class="module-props">
    <ItemProp
      v-for="(prop, index) in listedProps"
      class="module-prop"
      :name="prop.name"
      :type="prop.type"
      :itemId="module.id"
      :data-side="index < 3 ? 'right' : 'left'"
      :style="getPosition(index)"
      :options="prop.options"
      :value="module.props[prop.name]"
      @update:value="project.updateProp(module.id, prop.name, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useModuleDefinitions } from '@/stores/moduleDefinitions'
import { useModuleShapes } from '@/stores/moduleShapes'
import { useProject } from '@/stores/project'
import type { Module } from '@/types'
import { computed } from 'vue'
import ItemProp from './ItemProp.vue'

const props = defineProps<{
  module: Module
}>()

const project = useProject()
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
  return { left: `${position.x + offset}px`, top: `${position.y}px` }
}
</script>

<style scoped lang="scss">
.module-props {
  pointer-events: all;
}

.module-prop {
  position: absolute;
  transform: translateY(-50%);

  &[data-side='left'] {
    transform: translate(-100%, -50%);
    flex-direction: row-reverse;
  }
}
</style>
