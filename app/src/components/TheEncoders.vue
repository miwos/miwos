<template>
  <div class="encoders" :class="{ 'show-labels': app.isMapping }">
    <MEncoder
      v-for="count in 3"
      :enabled="encoders.has(count - 1)"
      v-bind="encoders.get(count - 1)"
      @update:value="updateValue(count - 1, $event)"
      class="encoder"
    />
  </div>
</template>

<script setup lang="ts">
import { useApp } from '@/stores/app'
import { useMappings } from '@/stores/mappings'
import { useModuleDefinitions } from '@/stores/moduleDefinitions'
import { useModules } from '@/stores/modules'
import MEncoder from '@/ui/MEncoder.vue'
import { computed } from 'vue'

const app = useApp()
const modules = useModules()
const definitions = useModuleDefinitions()
const mappings = useMappings()

interface Encoder {
  value: number
  min: number
  max: number
  step?: number
}

const encoders = computed(() => {
  const page = mappings.getPage(mappings.pageIndex)
  if (!page) return new Map()

  const encoders = new Map<number, Encoder>()
  for (const { moduleId, prop, slot } of page.values()) {
    const module = modules.get(moduleId)
    if (!module) continue

    const propOptions = definitions.get(module.type)?.props[prop]?.options
    if (!propOptions) continue

    const { min, max, step, value: defaultValue } = propOptions
    const value = module.props[prop]

    encoders.set(slot, { min, max, step, value: value ?? defaultValue })
  }

  return encoders
})

const updateValue = (slot: number, value: number) => {
  if (!encoders.value?.has(slot)) return

  const mapping = mappings.getCurrentPage()?.get(slot)
  if (!mapping) return

  const { moduleId, prop } = mapping
  modules.updateProp(moduleId, prop, value)
}
</script>

<style scoped lang="scss">
.encoders {
  position: absolute;
  top: 50%;
  right: 0;
  width: 80px;
  height: 156px;
  transform: translateY(-50%);
  margin: 1rem;
  counter-reset: encoder;
}

.encoder {
  --m-encoder-color: var(--color-mapping);
  --m-encoder-dial-color: white;

  position: absolute;
  counter-increment: encoder;

  &:nth-child(1) {
    left: 40px;
  }

  &:nth-child(2) {
    top: 58px;
  }

  &:nth-child(3) {
    top: 116px;
    left: 40px;
  }

  &::before {
    position: absolute;
    transform: translateX(-100%);
    content: counter(encoder);
    padding-top: 0.67em;
    padding-right: 0.5em;
    font-size: 16px;
    font-family: 'Vevey Positive';
    color: var(--color-module-bg);
    opacity: 0;
    transition: opacity 100ms;
  }

  .show-labels &::before {
    opacity: 1;
  }
}
</style>
