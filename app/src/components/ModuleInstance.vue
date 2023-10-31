<template>
  <div class="module" ref="el" :class="{ isSelected }">
    <component
      class="module-custom-component"
      v-if="customComponent"
      :is="customComponent"
    />
    <template v-else>
      <ModuleMask v-if="shape" :shape="shape" :id="maskId" />
      <ModuleOutline
        v-if="shape && isSelected"
        :module="module"
        :shape="shape"
      />
      <ModuleShape v-if="shape" :shape="shape" />
      <ModuleContent :module="module" :mask="`url(#${maskId})`" />
      <ModuleLabel
        v-if="definition?.showLabel"
        :module="module"
        :shape="shape"
      />
      <ConnectionPoints :item="module" />
      <ModuleProps :module="module" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMouseUpOutside } from '@/composables/onMouseUpOutside'
import { useModulesDrag } from '@/composables/useModulesDrag'
import { useItems } from '@/stores/items'
import { useProject } from '@/stores/project'
import type { Module, Point } from '@/types'
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import ConnectionPoints from './ConnectionPoints.vue'
import ModuleContent from './ModuleContent.vue'
import ModuleLabel from './ModuleLabel.vue'
import ModuleMask from './ModuleMask.vue'
import ModuleOutline from './ModuleOutline.vue'
import ModuleProps from './ModuleProps.vue'
import ModuleShape from './ModuleShape.vue'

const moduleComponentsImport = import.meta.glob([
  '../modules/*.vue',
  '!**/*.story.vue',
])

const moduleComponents = new Map(
  Object.entries(moduleComponentsImport).map(([path, asyncModule]) => {
    const name = path.match(/\/([\w_-]+).vue$/)![1]
    return [name, defineAsyncComponent(asyncModule as any)]
  }),
)

const props = defineProps<{ position: Point; module: Module }>()

const project = useProject()
const items = useItems()
const definition = computed(() =>
  items.moduleDefinitions.get(props.module.type),
)
const shape = computed(() => {
  if (!definition.value) return
  const { shape, id } = definition.value
  return items.shapes.get(shape ?? id)
})

const el = ref<HTMLElement>()
const maskId = `module-${props.module.id}-mask`
const customComponent = moduleComponents.get(props.module.type)

const isSelected = computed(() => items.selectedIds.has(props.module.id))

onMounted(() => {
  if (!el.value) return
  const { width, height } = el.value.getBoundingClientRect()
  props.module.size = { width, height }
})

onMouseUpOutside(el, () => {
  if (!items.isDragging && !project.isSelecting) items.selectedIds.clear()
})

useModulesDrag(el, props.module)

watch(
  () => props.position,
  () => project.save(),
)
</script>

<style scoped lang="scss">
.module {
  position: absolute;
  top: v-bind('props.position.y + `px`');
  left: v-bind('props.position.x + `px`');
  pointer-events: none;

  &-custom-component {
    pointer-events: all;
  }
}
</style>
