<script setup lang="ts">
import { useItems } from '@/stores/items'
import type { Modulator } from '@/types'
import ItemProp from './ItemProp.vue'

const props = defineProps<{
  modulator: Modulator
}>()

const items = useItems()
const definition = items.definitions.get(props.modulator.type)
</script>

<template>
  <div class="pane">
    <ItemProp
      v-for="(prop, name) in definition?.props"
      class="prop"
      :name="name"
      :type="prop.type"
      :itemId="modulator.id"
      :options="prop.options"
      :position="{ x: 0, y: 0 }"
      side="left"
      :value="modulator.props[name]"
      @update:value="items.updateProp(modulator.id, name, $event)"
    />
  </div>
</template>

<style scoped>
.pane {
  position: absolute;
  padding: 0.6rem 0.8rem;
  background-color: var(--color-glass-dark-solid);
  outline: 1px solid rgb(255 255 255 / 38%);
  border-radius: var(--radius-s);
  right: -0.5rem;
  top: 0;
  z-index: var(--z-menu);
}

.prop {
  flex-direction: row-reverse;
}
</style>
