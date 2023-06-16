<template>
  <div class="menu-add" v-if="isOpen" :class="`align-${align}`" ref="el">
    <ModuleDefinitionSearch
      ref="search"
      :align-results="align"
      @select="addModule"
      @blur="close()"
    ></ModuleDefinitionSearch>
  </div>
</template>

<script setup lang="ts">
import { useApp } from '@/stores/app'
import { useModules } from '@/stores/modules'
import type { ModuleDefinition } from '@/types'
import {
  onClickOutside,
  onKeyDown,
  useMouse,
  useWindowSize,
} from '@vueuse/core'
import { nextTick, ref, watchEffect } from 'vue'
import ModuleDefinitionSearch from './ModuleDefinitionSearch.vue'

const mouse = useMouse()
const app = useApp()
const modules = useModules()

const el = ref<HTMLElement>()
const search = ref<InstanceType<typeof ModuleDefinitionSearch>>()
const { height: windowHeight } = useWindowSize()
const position = ref({ x: 0, y: 0 })
const isOpen = ref(false)
const align = ref<'top' | 'bottom'>('bottom')
const height = ref(0)

onKeyDown(' ', (e) => e.ctrlKey && open())
onKeyDown('Escape', () => close())
onClickOutside(el, () => close())

watchEffect(() => {
  const itemHeight = 40 // 2.5rem
  const itemPadding = 8 // 0.5rem
  const itemSize = itemHeight + itemPadding

  height.value =
    Math.floor((windowHeight.value * 0.2) / itemSize) * itemSize - itemPadding
})

const open = () => {
  if (isOpen.value) return

  app.isOverlaying = true

  position.value = { x: mouse.x.value, y: mouse.y.value }
  isOpen.value = true

  align.value = position.value.y > window.innerHeight / 2 ? 'top' : 'bottom'

  search.value?.clear()
  nextTick(() => search.value?.focus())
}

const close = () => {
  app.isOverlaying = false
  isOpen.value = false
}

const addModule = (type: ModuleDefinition['id']) => {
  const position = { x: mouse.x.value, y: mouse.y.value }
  modules.add({ type, position })
  close()
}
</script>

<style scoped lang="scss">
.menu-add {
  position: absolute;
  z-index: var(--z-menu);
  top: v-bind('position.y + `px`');
  left: v-bind('position.x + `px`');

  max-height: v-bind('height + `px`');
  height: 100%;

  &.align-top {
    transform: translateY(-100%);
  }
}
</style>
