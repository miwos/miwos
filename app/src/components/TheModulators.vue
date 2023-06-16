<template>
  <div class="modulators" :class="{ empty: isEmpty }">
    <div
      v-if="!isEmpty"
      class="modulators-items"
      :class="{ 'multi-column': multiColumnEnabled }"
    >
      <ModulatorInstance
        v-for="[id, item] in modulators.items"
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
import { useModulators } from '@/stores/modulators'
import ModulatorInstance from './ModulatorInstance.vue'
import { computed } from 'vue'

const modulators = useModulators()

const isEmpty = computed(() => !modulators.list.length)

const multiColumnEnabled = computed(() => modulators.list.length > 3)

const addModulator = () => {
  modulators.add({
    type: 'Lfo',
    label: 'fuuu',
    position: { x: 0, y: 0 },
  })
}
</script>

<style scoped lang="scss">
.modulators {
  position: absolute;
  top: 0;
  right: 0;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &-items {
    display: grid;
    gap: 0.5rem;

    &.multi-column {
      grid-auto-flow: column;
      grid-template-rows: repeat(3, auto);
    }
  }

  &-add {
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

    // Reverse the color-scheme to draw more attention on an empty modulators
    // list.
    .empty & {
      --bg: var(--color-modulation);
      --color: black;

      &:hover {
        --color: white;
        --bg: var(--color-glass-dark-solid);
      }
    }
  }
}
</style>
