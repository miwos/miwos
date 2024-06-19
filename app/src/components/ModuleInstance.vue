<script setup lang="ts">
import { onClickNoDrag } from '@/composables/onClickNoDrag'
import { useModulesDrag } from '@/composables/useModulesDrag'
import { useItems } from '@/stores/items'
import { useProject } from '@/stores/project'
import type { Module, Point } from '@/types'
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import ConnectionPoints from './ConnectionPoints.vue'
import ModuleContent from './ModuleContent.vue'
import ModuleCustom from './ModuleCustom.vue'
import ModuleLabel from './ModuleLabel.vue'
import ModuleMask from './ModuleMask.vue'
import ModuleProps from './ModuleProps.vue'
import ModuleShape from './ModuleShape.vue'
import { onMouseUpOutside } from '@/composables/onMouseUpOutside'

const props = defineProps<{ position: Point; module: Module }>()

const moduleContentsImport = import.meta.glob('../modules/content/*.vue')
const moduleContents = new Map(
  Object.entries(moduleContentsImport).map(([path, asyncModule]) => {
    const name = path.match(/\/([\w_-]+).vue$/)![1]
    return [name, defineAsyncComponent(asyncModule as any)]
  }),
)

const contentComponent = moduleContents.get(props.module.type)

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

const customComponent = moduleComponents.get(props.module.type)

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
const dragHandle = ref<HTMLElement>()
const maskId = `module-${props.module.id}-mask`

const isSelected = computed(() => items.selectedIds.has(props.module.id))

onMouseUpOutside(el, () => {
  if (!items.isDragging && !project.isSelecting) unselect()
})

const select = () => {
  items.selectedIds.clear()
  items.selectedIds.add(props.module.id)
}

const unselect = () => items.selectedIds.clear()

useModulesDrag(dragHandle, props.module)
onClickNoDrag(dragHandle, select)

watch(
  () => props.position,
  () => project.save(),
)
</script>

<template>
  <div ref="el" class="module" :data-selected="isSelected">
    <template v-if="customComponent">
      <ModuleCustom :component="customComponent" :module="module" />
      <ConnectionPoints :item="module" />
    </template>

    <template v-else>
      <ModuleMask v-if="shape" :shape="shape" :id="maskId" />
      <ModuleShape v-if="shape" ref="dragHandle" :shape="shape" tabindex="0" />
      <ModuleContent
        v-if="contentComponent"
        :component="contentComponent"
        :module="module"
        :mask="`url(#${maskId})`"
      />
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

<style scoped>
.module {
  position: absolute;
  top: v-bind('props.position.y + `px`');
  left: v-bind('props.position.x + `px`');
  pointer-events: none;
  transition: opacity 100ms;
}

.patch[data-selection='true'] .module[data-selected='false'] {
  opacity: 0.25;
}
</style>
