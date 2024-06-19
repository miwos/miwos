<script setup lang="ts">
import ConnectionLine from '@/components/ConnectionLine.vue'
import ConnectionLineTemp from '@/components/ConnectionLineTemp.vue'
import MenuAdd from '@/components/MenuAdd.vue'
import ModuleInstance from '@/components/ModuleInstance.vue'
import TheEncoders from '@/components/TheEncoders.vue'
import TheModulators from '@/components/TheModulators.vue'
import ThePagesButtons from '@/components/ThePagesButtons.vue'
import { useSelection } from '@/composables/useSelection'
import { useApp } from '@/stores/app'
import { useConnections } from '@/stores/connections'
import { useItems } from '@/stores/items'
import { useProject } from '@/stores/project'
import { containsRect } from '@/utils'
import { useMagicKeys, whenever } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import type { Module } from '@/types'

const bg = ref<HTMLElement>()
const connections = useConnections()
const project = useProject()
const app = useApp()
const items = useItems()

const { style, rect, cancel, isSelecting } = useSelection(bg)
const keys = useMagicKeys()
const hasSelection = computed(() => {
  const hasSelectedItems = items.selectedIds.size > 0
  const hasSelectedConnections = connections.selectedIds.size > 0
  return project.isSelecting || hasSelectedItems || hasSelectedConnections
})

const selectItems = () => {
  items.selectedIds.clear()
  for (const [id, instance] of items.instances) {
    if (instance.category !== 'modules') continue
    const { x, y } = instance.position
    const definition = items.definitions.get(instance.type)!
    const shape = items.shapes.get(definition?.shape ?? definition.id)!
    const { width, height } = shape.size
    const moduleRect = { x, y, width, height }
    if (containsRect(rect.value, moduleRect)) items.selectedIds.add(id)
  }
}

watch(isSelecting, (value) => (project.isSelecting = value))
watch(rect, selectItems)

whenever(keys['escape'], () => {
  items.selectedIds.clear()
  cancel()
})

whenever(keys['delete'], () => {
  items.selectedIds.forEach((id) => items.remove(id))
  connections.selectedIds.forEach((id) => connections.remove(id))
})
</script>

<template>
  <div class="background" ref="bg"></div>
  <div class="selection" v-if="isSelecting" :style="style"></div>
  <TheModulators />
  <div class="patch" :data-selection="hasSelection">
    <div class="module-instances">
      <ModuleInstance
        v-for="[id, item] in items.modules"
        :key="id"
        :module="item"
        v-model:position="item.position"
        :style="`z-index: ${items.getSortIndex(id)}`"
      />
    </div>
    <div class="connections">
      <ConnectionLine
        v-for="[id, connection] in connections.map"
        :key="id"
        :connection="connection"
        :style="`z-index: ${connections.getSortIndex(id)}`"
      />
      <ConnectionLineTemp
        v-if="
          connections.tempConnection?.from && connections.tempConnection?.to
        "
        :connection="connections.tempConnection"
        :style="`z-index: ${items.instances.size}`"
      />
    </div>
  </div>
  <TheEncoders />
  <ThePagesButtons />
  <MenuAdd />
</template>

<style scoped>
.background {
  width: 100vw;
  height: 100vh;
}

.patch {
  position: absolute;
  top: 0;
  left: 0;
  /* ? Since we're using Dialog/Popover do we still need this? */
  /* Create a new stacking context, so modules and connections don't
  overlay menus and dialogs. */
  isolation: isolate;
}

.selection {
  box-sizing: border-box;
  position: absolute;
  border: 1px dotted white;
  border-radius: 5px;
  background: rgb(0 0 0 / 12%);
  pointer-events: none;
}
</style>

<style>
body[data-dragging='true'] * {
  user-select: none;
}
</style>
