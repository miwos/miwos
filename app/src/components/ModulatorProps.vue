<template>
  <div class="modulator-props">
    <ItemProp
      v-for="(prop, name) in definition?.props"
      class="modulator-prop"
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

<style scoped lang="scss">
.modulator-props {
  position: absolute;
  padding: 0.6rem 0.8rem;
  background-color: var(--color-glass-dark-solid);
  outline: 1px solid rgb(255 255 255 / 38%);
  border-radius: var(--radius-s);
  right: -0.5rem;
  // opacity: 0.5;
  top: 0;
  z-index: var(--z-menu);
}

.modulator-prop {
  flex-direction: row-reverse;
}
</style>
