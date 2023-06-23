<template>
  <div>
    <ItemProp
      v-for="(prop, name) in definition?.props"
      class="modulator-prop"
      :name="name"
      :type="prop.type"
      :ownerId="modulator.id"
      :options="prop.options"
      :value="modulator.props[name]"
      :position="{ x: 0, y: 0 }"
      side="left"
    />
  </div>
</template>

<script setup lang="ts">
import { useModulatorDefinitions } from '@/stores/modulatorDefinitions';
import type { Modulator } from '@/types';
import ItemProp from './ItemProp.vue';

const props = defineProps<{
  modulator: Modulator
}>()

const definition = useModulatorDefinitions().get(props.modulator.type)
</script>

<style scoped lang="scss">
.modulator-prop {
  flex-direction: row-reverse;
}
</style>