<template>
  <div class="background" ref="bg"></div>
  <div class="selection" v-if="isSelecting" :style="style"></div>
  <TheModulators />
  <div class="patch" :class="app.isOverlaying && 'dim'">
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
import { ref, watch } from 'vue'
import type { Module } from '@/types'

const bg = ref<HTMLElement>()
const connections = useConnections()
const project = useProject()
const app = useApp()
const items = useItems()

const { style, rect, cancel, isSelecting } = useSelection(bg)
const keys = useMagicKeys()

const selectItems = () => {
  items.selectedIds.clear()
  for (const [id, instance] of items.instances) {
    // TODO: cleanup this TS mess!
    if (!(instance as Module).size) continue
    const { x, y } = instance.position
    const { width, height } = (instance as Module).size!
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

whenever(keys['delete'], () =>
  items.selectedIds.forEach((id) => items.remove(id)),
)
</script>

<style scoped lang="scss">
.background {
  width: 100vw;
  height: 100vh;
}

.patch {
  // Create a new stacking context, so modules and connections don't
  // overlay menus and dialogs.
  isolation: isolate;

  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 100ms ease;

  &.dim {
    opacity: 0.3;
  }
}

.selection {
  position: absolute;
  box-sizing: border-box;
  pointer-events: none;
  background: rgb(0 0 0 / 12%);
  border-radius: 7px;
}
</style>
