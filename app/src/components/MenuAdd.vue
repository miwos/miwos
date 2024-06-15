<script setup lang="ts">
import { useApp } from '@/stores/app'
import { useItems } from '@/stores/items'
import type { ModuleDefinition } from '@/types'
import { onKeyDown, useMouse, useWindowSize } from '@vueuse/core'
import { nextTick, ref } from 'vue'
import ModuleDefinitionSearch from './ModuleDefinitionSearch.vue'

const mouse = useMouse()
const app = useApp()
const items = useItems()
const { height: windowHeight } = useWindowSize()
const height = ref(0)

const el = ref<HTMLDialogElement>()
const search = ref<InstanceType<typeof ModuleDefinitionSearch>>()

onKeyDown(' ', (e) => e.ctrlKey && open())

const open = () => {
  el.value?.showModal()
  search.value?.clear()
}

const close = () => el.value?.close()

const addModule = (type: ModuleDefinition['id']) => {
  const position = { x: mouse.x.value, y: mouse.y.value }
  items.add({ type, category: 'modules', position })
  close()
}
</script>

<template>
  <dialog ref="el" class="menu-add">
    <ModuleDefinitionSearch
      ref="search"
      @select="addModule"
    ></ModuleDefinitionSearch>
  </dialog>
</template>

<style scoped>
.menu-add {
  position: fixed;
  top: 20;
  margin-inline: auto;
  padding: 0.5rem;

  --item-gap: 0.5rem;
  --item-height: 2.5rem;
  --item-size: calc(var(--item-height) + var(--item-gap));

  height: 100%;
  max-height: calc(round(down, 40%, var(--item-size)) - var(--item-gap));

  &,
  &::backdrop {
    opacity: 0;
    transition:
      display 200ms allow-discrete,
      overlay 200ms allow-discrete,
      opacity 200ms;
  }

  &[open] {
    opacity: 1;
  }
  &[open]::backdrop {
    opacity: 0.75;
  }

  @starting-style {
    &[open],
    &[open]::backdrop {
      opacity: 0;
    }
  }

  &::backdrop {
    background-color: var(--color-background);
  }
}
</style>
