<template>
  <div class="modulator" @keydown.delete="remove" tabindex="0">
    <ScrollingPlot ref="plot" class="modulator-plot glass-dark" color="orange" />
    <button class="props-menu-button" @click="showPropsMenu"></button>
    <ModulatorProps
      v-if="propsMenuIsVisible"
      ref="propsMenu"
      :modulator="modulator"
    />
  </div>
</template>

<script setup lang="ts">
import type { Modulator } from '@/types'
import ScrollingPlot from './ScrollingPlot.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { useEventBus } from '@vueuse/core'
import { useModulators } from '@/stores/modulators'
import ModulatorProps from './ModulatorProps.vue'
import { onMouseDownOutside } from '@/composables/onMouseDownOutside'

const props = defineProps<{ modulator: Modulator }>()

const modulators = useModulators()
const modulatorValueBus = useEventBus('modulator-value')

const plot = ref<InstanceType<typeof ScrollingPlot>>()
const propsMenu = ref<InstanceType<typeof ModulatorProps>>()
const propsMenuIsVisible = ref(false)
let unsubscribe: Function | undefined

onMounted(() => {
  unsubscribe = modulatorValueBus.on((modulatorId, value) => {
    if (modulatorId === props.modulator.id) plot.value?.plotValue(value)
  })
})

onUnmounted(() => unsubscribe?.())

const showPropsMenu = () => propsMenuIsVisible.value = true

const hidePropsMenu = () => propsMenuIsVisible.value = false

const remove = () => modulators.remove(props.modulator.id)

// onMouseDownOutside(propsMenu, hidePropsMenu)
</script>

<style scoped lang="scss">
.modulator {
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
  background-color: red;
  margin-left: 12px; // Same as module props, see `shape` package.
}
</style>
