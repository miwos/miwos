<template>
  <div>
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
import { useModulatorDefinitions } from '@/stores/modulatorDefinitions';
import type { Modulator } from '@/types';
import ItemProp from './ItemProp.vue';
import { useProject } from '@/stores/project';

const props = defineProps<{
  modulator: Modulator
}>()

const project = useProject()
const definition = useModulatorDefinitions().get(props.modulator.type)
</script>

<style scoped lang="scss">
.modulator-prop {
  flex-direction: row-reverse;
}
</style>