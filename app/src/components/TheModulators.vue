<template>
  <div class="modulators" :class="{ empty: isEmpty }">
    <div
      v-if="!isEmpty"
      class="modulators-items"
      :class="{ 'multi-column': multiColumnEnabled }"
    >
      <ModulatorInstance
        v-for="[id, item] in items.modulators"
        :key="id"
        :modulator="item"
      />
    </div>
    <button class="modulators-add" @click="addModulator">
      <svg viewBox="0 0 10 10">
        <line x1="0" y1="5" x2="10" y2="5" />
        <line x1="5" y1="0" x2="5" y2="10" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useItems } from '@/stores/items'
import ModulatorInstance from './ModulatorInstance.vue'
import { computed } from 'vue'

const items = useItems()
const isEmpty = computed(() => !items.modulators.size)
const multiColumnEnabled = computed(() => items.modulators.size > 3)

const addModulator = () => {
  items.add({
    type: 'Lfo',
    category: 'modulators',
    label: 'fuuu',
    position: { x: 0, y: 0 },
  })
}
</script>

<style scoped>
.modulators {
  position: absolute;
  top: 0;
  right: 0;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.modulators-items {
  display: grid;
  column-gap: 1.75rem;
  row-gap: 0.5rem;

  &.multi-column {
    grid-auto-flow: column;
    grid-template-rows: repeat(3, auto);
  }
}

.modulators-add {
  --color: white;
  --bg: var(--color-glass-dark-solid);

  border-radius: var(--radius-s);
  background-color: var(--bg);
  height: 1.5rem;
  width: 1.5rem;
  padding: 0.3rem;
  box-sizing: border-box;
  cursor: pointer;

  svg {
    stroke: var(--color);
    line {
      vector-effect: non-scaling-stroke;
      stroke: 1px;
    }
  }

  &:hover {
    --bg: var(--color-modulation);
    --color: black;
  }

  /* Reverse the color-scheme to draw more attention on an empty modulators
    list. */
  .empty & {
    --bg: var(--color-modulation);
    --color: black;

    &:hover {
      --color: white;
      --bg: var(--color-glass-dark-solid);
    }
  }
}
</style>
