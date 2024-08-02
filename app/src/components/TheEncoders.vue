<script setup lang="ts">
import { useApp } from '@/stores/app'
import { useItems } from '@/stores/items'
import { useMappings } from '@/stores/mappings'
import MEncoder from '@/ui/MEncoder.vue'
import { computed } from 'vue'

const app = useApp()
const items = useItems()
const mappings = useMappings()

interface Encoder {
  value: number
  min: number
  max: number
  step?: number
}

const encoders = computed(() => {
  const page = mappings.getCurrentPage()
  if (!page) return new Map()

  const encoders = new Map<number, Encoder>()
  for (const { itemId, prop, slot } of page.values()) {
    const item = items.instances.get(itemId)
    if (!item) continue

    const definition = items.definitions.get(item.type)
    if (!definition) continue

    const propDefinition = definition.props[prop]
    if (!propDefinition) continue

    const { type, options } = propDefinition
    const [min, max, step] =
      type === 'Select'
        ? [1, options.options.length, 1] // one-based index
        : [options.min, options.max, options.step]

    const value = item.props[prop] ?? options.value
    encoders.set(slot, { min, max, step, value: value })
  }

  return encoders
})

const updateValue = (slot: number, value: number) => {
  if (!encoders.value?.has(slot)) return

  const mapping = mappings.getCurrentPage()?.get(slot)
  if (!mapping) return

  const { itemId, prop } = mapping
  items.updateProp(itemId, prop, value)
}
</script>

<template>
  <div class="encoders" :data-show-labels="app.isMapping">
    <MEncoder
      v-for="(_, i) in 3"
      :enabled="encoders.has(i)"
      v-bind="encoders.get(i)"
      class="encoder"
      @update:value="updateValue(i, $event)"
    />
  </div>
</template>

<style scoped>
.encoders {
  position: absolute;
  top: 50%;
  right: 0;
  width: 80px;
  height: 156px;
  margin: 1rem;
  transform: translateY(-50%);
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
    padding-top: 0.67em;
    padding-right: 0.5em;
    transform: translateX(-100%);
    content: counter(encoder);
    color: var(--color-module-bg);
    font-size: 16px;
    font-family: 'Vevey Positive';
    opacity: 0;
    transition: opacity 100ms;
  }

  .encoders[data-show-labels='true'] &::before {
    opacity: 1;
  }
}
</style>
