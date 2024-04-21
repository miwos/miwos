<template>
  <div class="encoders" :class="{ 'show-labels': app.isMapping }">
    <MEncoder
      v-for="(_, i) in 3"
      :enabled="encoders.has(i)"
      v-bind="encoders.get(i)"
      @update:value="updateValue(i, $event)"
      class="encoder"
    />
  </div>
</template>

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

    const propOptions = definition.props[prop]?.options
    if (!propOptions) continue

    const { min, max, step, value: defaultValue } = propOptions
    const value = item.props[prop]

    encoders.set(slot, { min, max, step, value: value ?? defaultValue })
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

<style scoped>
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
