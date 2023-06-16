<template>
  <div class="modulator glass-dark" @keydown.delete="remove" tabindex="0">
    <ScrollingPlot ref="plot" color="orange" />
  </div>
</template>

<script setup lang="ts">
import type { Modulator } from '@/types'
import ScrollingPlot from './ScrollingPlot.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { useEventBus } from '@vueuse/core'
import { useModulators } from '@/stores/modulators'

const props = defineProps<{ modulator: Modulator }>()
const plot = ref<InstanceType<typeof ScrollingPlot>>()
const modulatorValueBus = useEventBus('modulator-value')
let unsubscribe: Function | undefined
const modulators = useModulators()

onMounted(() => {
  unsubscribe = modulatorValueBus.on((modulatorId, value) => {
    if (modulatorId === props.modulator.id) plot.value?.plotValue(value)
  })
})

onUnmounted(() => unsubscribe?.())

const remove = () => modulators.remove(props.modulator.id)
</script>

<style lang="scss">
.modulator {
  height: 50px;
  width: 120px;
  box-sizing: border-box;
  padding: 5px 0;
  border-radius: var(--radius-s);

  &:focus {
    outline: 2px solid white;
  }
}
</style>
