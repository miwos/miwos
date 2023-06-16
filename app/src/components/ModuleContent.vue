<template>
  <div class="module-content" :style="clipStyle">
    <component
      :is="moduleContents.get(props.module.type)"
      v-bind="module.props"
      v-on="updatePropHandlers"
    />
  </div>
</template>

<script setup lang="ts">
import { useModuleDefinitions } from '@/stores/moduleDefinitions'
import { useModules } from '@/stores/modules'
import type { Module } from '@/types'
import { computed, defineAsyncComponent } from 'vue'

const props = defineProps<{ module: Module; mask: string }>()
const definition = useModuleDefinitions().get(props.module.type)
const clipStyle = computed(() =>
  definition?.clipContent ?? true ? { clipPath: props.mask } : {}
)

const moduleContentsImport = import.meta.glob('../modules/content/*.vue')
const moduleContents = new Map(
  Object.entries(moduleContentsImport).map(([path, asyncModule]) => {
    const name = path.match(/\/([\w_-]+).vue$/)![1]
    return [name, defineAsyncComponent(asyncModule as any)]
  })
)

const modules = useModules()
const updatePropHandlers = computed(() =>
  Object.fromEntries(
    Object.keys(props.module.props).map((name) => [
      `update:${name}`,
      (value: any) => modules.updateProp(props.module.id, name, value),
    ])
  )
)
</script>

<style lang="scss">
.module-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
