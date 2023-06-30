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
      @update:value="project.updateProp(modulator.id, name, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useModulatorDefinitions } from '@/stores/modulatorDefinitions'
import type { Modulator } from '@/types'
import ItemProp from './ItemProp.vue'
import { useProject } from '@/stores/project'

const props = defineProps<{
  modulator: Modulator
}>()

const project = useProject()
const definition = useModulatorDefinitions().get(props.modulator.type)
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
