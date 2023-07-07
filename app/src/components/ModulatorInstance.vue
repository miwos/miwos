<template>
  <div class="modulator" @keydown.delete="remove" tabindex="0">
    <ScrollingPlot
      ref="plot"
      class="modulator-plot glass-dark"
      color="orange"
    />
    <ItemPropHandle
      class="modulator-props-menu-handle"
      :status="status"
      @click="showPropsMenu"
    />
    <ModulatorProps
      v-if="propsMenuIsVisible"
      ref="propsMenu"
      :modulator="modulator"
    />
  </div>
</template>

<script setup lang="ts">
import { onMouseDownOutside } from '@/composables/onMouseDownOutside'
import { useModulators } from '@/stores/modulators'
import type { Modulator } from '@/types'
import { useEventBus } from '@vueuse/core'
import { computed, ref } from 'vue'
import ItemPropHandle from './ItemPropHandle.vue'
import ModulatorProps from './ModulatorProps.vue'
import ScrollingPlot from './ScrollingPlot.vue'
import { useModulations } from '@/stores/modulations'
import { useMappings } from '@/stores/mappings'

const props = defineProps<{ modulator: Modulator }>()

const modulators = useModulators()
const modulatorValueBus = useEventBus('modulator-value')
const modulations = useModulations()
const mappings = useMappings()

const plot = ref<InstanceType<typeof ScrollingPlot>>()
const propsMenu = ref<InstanceType<typeof ModulatorProps>>()
const propsMenuIsVisible = ref(false)

modulatorValueBus.on((modulatorId, value) => {
  if (modulatorId === props.modulator.id) plot.value?.plotValue(value)
})

const status = computed(() => {
  const { id } = props.modulator
  const hasModulations = !!modulations.getByItemId(id).value.length
  const hasMappings = !!mappings.getByItemId(id).value.length
  const hasMappingsOnCurrentPage =
    !!mappings.getOnCurrentPageByItemId(id).value.length

  return hasMappingsOnCurrentPage && hasModulations
    ? 'mapped-and-modulated'
    : hasMappingsOnCurrentPage
    ? 'mapped'
    : hasModulations
    ? 'modulated'
    : hasMappings
    ? 'mapped-other-page'
    : 'none'
})

const showPropsMenu = () => (propsMenuIsVisible.value = true)

const hidePropsMenu = () => (propsMenuIsVisible.value = false)

const remove = () => modulators.remove(props.modulator.id)

onMouseDownOutside(propsMenu, ({ target }: MouseEvent) => {
  // The item prop's context menu is teleported to the body so this is a quick
  // and dirty workaround to prevent clicks inside the context menu from closing
  // the modulators props menu.
  if (target instanceof HTMLElement && !target.closest('.item-prop-context'))
    hidePropsMenu()
})
</script>

<style scoped lang="scss">
.modulator {
  position: relative;

  display: flex;
  align-items: center;

  &:focus {
    outline: 2px solid white;
  }
}

.modulator-plot {
  height: 50px;
  width: 120px;
  box-sizing: border-box;
  padding: 5px 0;
  border-radius: var(--radius-s);
}

.modulator-props-menu-handle {
  margin-left: 12px; // Same as module props, see `shape` package.
}
</style>
