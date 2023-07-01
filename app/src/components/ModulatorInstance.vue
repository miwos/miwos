<template>
  <div class="modulator" @keydown.delete="remove" tabindex="0">
    <ScrollingPlot
      ref="plot"
      class="modulator-plot glass-dark"
      color="orange"
    />
    <button class="props-menu-button" @click="showPropsMenu"></button>
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
import { ref } from 'vue'
import ModulatorProps from './ModulatorProps.vue'
import ScrollingPlot from './ScrollingPlot.vue'

const props = defineProps<{ modulator: Modulator }>()

const modulators = useModulators()
const modulatorValueBus = useEventBus('modulator-value')

const plot = ref<InstanceType<typeof ScrollingPlot>>()
const propsMenu = ref<InstanceType<typeof ModulatorProps>>()
const propsMenuIsVisible = ref(false)

modulatorValueBus.on((modulatorId, value) => {
  if (modulatorId === props.modulator.id) plot.value?.plotValue(value)
})

const showPropsMenu = () => (propsMenuIsVisible.value = true)

const hidePropsMenu = () => (propsMenuIsVisible.value = false)

const remove = () => modulators.remove(props.modulator.id)

onMouseDownOutside(propsMenu, hidePropsMenu)
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

.props-menu-button {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-glass-solid);
  margin-left: 12px; // Same as module props, see `shape` package.
  cursor: pointer;

  .modulator:has([data-status='mapped-other-page']) & {
    background: var(--prop-bg-mapped-other-page);
  }

  .modulator:has([data-status='mapped']) & {
    background: var(--prop-bg-mapped);
  }

  .modulator:has([data-status='modulated']) & {
    background: var(--prop-bg-modulated);
  }

  .modulator:has([data-status='mapped-and-modulated']) & {
    background: var(--prop-bg-mapped-and-modulated);
  }
}
</style>
